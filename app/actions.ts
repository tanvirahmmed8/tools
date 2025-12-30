"use server"
import { PDFDocument } from "pdf-lib"

export async function compressPdf(pdfBase64: string) {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")
  const pdfDoc = await PDFDocument.load(pdfBuffer)

  // NOTE: pdf-lib does not provide a public API to extract and recompress images in-place.
  // The previous approach accessed internal PDFKit structures, which is not supported and breaks type safety.
  // Instead, we can only optimize the PDF using pdf-lib's built-in compression, which does not recompress images.
  // If you need true image recompression, you must use a lower-level PDF parser or a service/library that supports it.
  // Here, we just save with useObjectStreams for best possible compression with pdf-lib.
  // Optionally, you can add a warning to the user if the PDF is still large after compression.

  // Remove unused objects, compress streams, and optimize
  pdfDoc.setTitle(pdfDoc.getTitle() || "Compressed PDF")
  const compressedBytes = await pdfDoc.save({ useObjectStreams: true })

  return {
    fileName: `compressed-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(compressedBytes).toString("base64"),
  }
}

import type { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from "canvas"
import { createCanvas } from "canvas"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import pdfParse from "pdf-parse/lib/pdf-parse.js"
import { Document, ImageRun, Packer, Paragraph } from "docx"

const { OPENAI_API_KEY } = process.env

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set. Add it to your environment before running server actions.")
}

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
})

const PDF_RENDER_SCALE = 2
const DOCX_IMAGE_MAX_WIDTH = 720

type PdfjsLib = typeof import("pdfjs-dist/legacy/build/pdf.mjs")

interface CanvasAndContext {
  canvas: ReturnType<typeof createCanvas>
  context: NodeCanvasRenderingContext2D
}

interface RenderedPageImage {
  buffer: Buffer
  width: number
  height: number
}

class NodeCanvasFactory {
  create(width: number, height: number): CanvasAndContext {
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid canvas size.")
    }

    const canvas = createCanvas(Math.ceil(width), Math.ceil(height))
    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Unable to create a 2D canvas context.")
    }

    return { canvas, context }
  }

  reset(canvasAndContext: CanvasAndContext, width: number, height: number) {
    canvasAndContext.canvas.width = Math.ceil(width)
    canvasAndContext.canvas.height = Math.ceil(height)
  }

  destroy(canvasAndContext: CanvasAndContext) {
    canvasAndContext.canvas.width = 0
    canvasAndContext.canvas.height = 0
  }
}

let pdfjsLibPromise: Promise<PdfjsLib> | null = null

const loadPdfjs = () => {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/legacy/build/pdf.mjs")
  }
  return pdfjsLibPromise
}

const toPdfBuffer = (pdfInput: string | Buffer): Buffer => {
  if (Buffer.isBuffer(pdfInput)) {
    return pdfInput
  }
  const base64Data = pdfInput.includes(",") ? pdfInput.split(",")[1] ?? "" : pdfInput
  return Buffer.from(base64Data, "base64")
}

const getImageDimensions = (originalWidth: number, originalHeight: number) => {
  if (!originalWidth || !originalHeight) {
    return { width: DOCX_IMAGE_MAX_WIDTH, height: DOCX_IMAGE_MAX_WIDTH }
  }

  const scale = originalWidth > DOCX_IMAGE_MAX_WIDTH ? DOCX_IMAGE_MAX_WIDTH / originalWidth : 1
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  }
}

const renderPdfPagesToImages = async (pdfBuffer: Buffer): Promise<RenderedPageImage[]> => {
  const pdfjs = await loadPdfjs()
  const loadingTask = pdfjs.getDocument({ data: pdfBuffer })
  const pdfDocument = await loadingTask.promise
  const canvasFactory = new NodeCanvasFactory()
  const renderedPages: RenderedPageImage[] = []

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber)
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE })
    const { canvas, context } = canvasFactory.create(viewport.width, viewport.height)
    const renderContext = {
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
      canvasFactory,
    }
    await page.render(renderContext as unknown as Parameters<typeof page.render>[0]).promise
    renderedPages.push({ buffer: canvas.toBuffer("image/png"), width: viewport.width, height: viewport.height })
    canvasFactory.destroy({ canvas, context })
    page.cleanup()
  }

  await loadingTask.destroy()
  return renderedPages
}

export async function extractTextFromImage(imageBase64: string): Promise<string> {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract ALL text from this image. Return ONLY the extracted text, nothing else. Preserve the original formatting, line breaks, and structure as much as possible. If there is no text in the image, respond with 'No text found in image.'",
          },
          {
            type: "image",
            image: imageBase64,
          },
        ],
      },
    ],
  })

  return text
}

export async function extractTextFromPdf(pdfInput: string | Buffer): Promise<string> {
  const pdfBuffer = toPdfBuffer(pdfInput)

  const { text } = await pdfParse(pdfBuffer)
  const trimmed = text.trim()

  return trimmed.length ? trimmed : "No text found in PDF."
}

export async function convertPdfToWord(pdfBase64: string) {
  const pdfBuffer = toPdfBuffer(pdfBase64)
  const [text, renderedPages] = await Promise.all([extractTextFromPdf(pdfBuffer), renderPdfPagesToImages(pdfBuffer)])

  if (!renderedPages.length) {
    throw new Error("No renderable pages found in PDF.")
  }

  const safeText = text && text.trim().length ? text.trim() : "No text found in PDF."

  const layoutParagraphs = renderedPages.map(
    (pageImage, index) =>
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data: pageImage.buffer,
            transformation: getImageDimensions(pageImage.width, pageImage.height),
          }),
        ],
        pageBreakBefore: index === 0 ? undefined : true,
        spacing: { after: 0, before: 0 },
      }),
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children: layoutParagraphs,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)

  return {
    fileName: `textextract-${new Date().toISOString().replace(/[:.]/g, "-")}.docx`,
    docxBase64: buffer.toString("base64"),
    text: safeText,
    pageCount: renderedPages.length,
  }
}

export async function imagesToPdf(imagesBase64: string[]) {
  if (!Array.isArray(imagesBase64) || imagesBase64.length === 0) {
    throw new Error("Provide one or more images to convert to PDF.")
  }

  const pdfDoc = await PDFDocument.create()

  for (const dataUrl of imagesBase64) {
    const header = dataUrl.slice(0, 50).toLowerCase()
    const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] ?? "" : dataUrl
    const bytes = Buffer.from(base64, "base64")

    let embedded
    if (header.includes("image/png")) {
      embedded = await pdfDoc.embedPng(bytes)
    } else if (header.includes("image/jpeg") || header.includes("image/jpg")) {
      embedded = await pdfDoc.embedJpg(bytes)
    } else {
      throw new Error("Only PNG and JPEG images are supported.")
    }

    const { width, height } = embedded.scale(1)
    const page = pdfDoc.addPage([width, height])
    page.drawImage(embedded, { x: 0, y: 0, width, height })
  }

  const out = await pdfDoc.save({ useObjectStreams: true })
  return {
    fileName: `images-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(out).toString("base64"),
  }
}

export async function mergePdfs(pdfBase64List: string[]) {
  if (!Array.isArray(pdfBase64List) || pdfBase64List.length === 0) {
    throw new Error("Provide at least two PDFs to merge.")
  }

  const mergedPdf = await PDFDocument.create()

  for (const pdfBase64 of pdfBase64List) {
    const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
    const pdfBuffer = Buffer.from(base64Data, "base64")
    const srcDoc = await PDFDocument.load(pdfBuffer)
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices())
    copiedPages.forEach((p) => mergedPdf.addPage(p))
  }

  const bytes = await mergedPdf.save({ useObjectStreams: true })

  return {
    fileName: `merged-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(bytes).toString("base64"),
  }
}

function parseRanges(input: string, totalPages: number): number[][] {
  // Returns array of [start,end] 1-based inclusive ranges
  const cleaned = input.replace(/\s+/g, "")
  if (!cleaned) {
    // default: split per page
    return Array.from({ length: totalPages }, (_, i) => [i + 1, i + 1])
  }
  const parts = cleaned.split(",").filter(Boolean)
  const ranges: number[][] = []
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const n = Math.min(Math.max(parseInt(part, 10), 1), totalPages)
      ranges.push([n, n])
    } else {
      const m = part.match(/^(\d+)-(\d+)$/)
      if (m) {
        let a = parseInt(m[1], 10)
        let b = parseInt(m[2], 10)
        if (a > b) [a, b] = [b, a]
        a = Math.min(Math.max(a, 1), totalPages)
        b = Math.min(Math.max(b, 1), totalPages)
        ranges.push([a, b])
      }
    }
  }
  if (!ranges.length) {
    return Array.from({ length: totalPages }, (_, i) => [i + 1, i + 1])
  }
  return ranges
}

export async function splitPdf(
  pdfBase64: string,
  options?: { ranges?: string },
) {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")
  const srcDoc = await PDFDocument.load(pdfBuffer)
  const totalPages = srcDoc.getPageCount()

  const ranges = parseRanges(options?.ranges ?? "", totalPages)

  const outputs: { fileName: string; pdfBase64: string }[] = []
  let idx = 1
  for (const [start, end] of ranges) {
    const out = await PDFDocument.create()
    const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
    const copiedPages = await out.copyPages(srcDoc, pageIndices)
    copiedPages.forEach((p) => out.addPage(p))
    const bytes = await out.save({ useObjectStreams: true })
    outputs.push({
      fileName: `split-${idx}-${start}-${end}.pdf`,
      pdfBase64: Buffer.from(bytes).toString("base64"),
    })
    idx += 1
  }

  return { totalPages, parts: outputs }
}
