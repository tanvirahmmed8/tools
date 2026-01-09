"use server"
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib"

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

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import pdfParse from "pdf-parse/lib/pdf-parse.js"

const { OPENAI_API_KEY, PDF_PROTECT_API_URL, PDF_PROTECT_API_KEY } = process.env

const openai = OPENAI_API_KEY
  ? createOpenAI({
      apiKey: OPENAI_API_KEY,
    })
  : null

const getOpenAI = () => {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not set. Add it to your environment before running image extraction.")
  }
  return openai
}

const getProtectApiConfig = () => {
  if (!PDF_PROTECT_API_URL) {
    throw new Error("PDF_PROTECT_API_URL is not configured. Add it to your environment to enable PDF password protection.")
  }
  return {
    url: PDF_PROTECT_API_URL,
    apiKey: PDF_PROTECT_API_KEY,
  }
}

const toPdfBuffer = (pdfInput: string | Buffer): Buffer => {
  if (Buffer.isBuffer(pdfInput)) {
    return pdfInput
  }
  const base64Data = pdfInput.includes(",") ? pdfInput.split(",")[1] ?? "" : pdfInput
  return Buffer.from(base64Data, "base64")
}

export async function extractTextFromImage(imageBase64: string): Promise<string> {
  const { text } = await generateText({
    model: getOpenAI()("gpt-4o"),
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

const PDF_TO_WORD_API_ENDPOINT = "https://pdftowordconv.azurewebsites.net/api/convert" as const

export async function convertPdfToWord(pdfBase64: string) {
  const pdfBuffer = toPdfBuffer(pdfBase64)
  const [extractedText, pageCount] = await Promise.all([
    extractTextFromPdf(pdfBuffer),
    (async () => {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      return pdfDoc.getPageCount()
    })(),
  ])

  const formData = new FormData()
  const uploadName = `upload-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`
  const fileBytes = new Uint8Array(pdfBuffer)
  formData.append("file", new Blob([fileBytes], { type: "application/pdf" }), uploadName)

  const apiResponse = await fetch(PDF_TO_WORD_API_ENDPOINT, {
    method: "POST",
    body: formData,
    cache: "no-store",
  })

  if (!apiResponse.ok) {
    throw new Error("PDF to Word service unavailable. Please try again later.")
  }

  const payload: { downloadUrl?: string; fileName?: string; expiresOn?: string } = await apiResponse.json()

  if (!payload.downloadUrl) {
    throw new Error("Invalid response from PDF to Word service.")
  }

  const docxResponse = await fetch(payload.downloadUrl, { cache: "no-store" })
  if (!docxResponse.ok) {
    throw new Error("Unable to download converted Word document.")
  }

  const docxBuffer = Buffer.from(await docxResponse.arrayBuffer())
  const safeText = extractedText && extractedText.trim().length ? extractedText.trim() : "No text found in PDF."

  return {
    fileName: payload.fileName ?? `textextract-${new Date().toISOString().replace(/[:.]/g, "-")}.docx`,
    docxBase64: docxBuffer.toString("base64"),
    text: safeText,
    pageCount,
    downloadUrl: payload.downloadUrl,
    expiresOn: payload.expiresOn,
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

function parsePagesToDelete(input: string, totalPages: number): number[] {
  const cleaned = input.replace(/\s+/g, "")
  if (!cleaned) {
    throw new Error("Enter the pages you want to delete, e.g., 1-3,6.")
  }

  const parts = cleaned.split(",").filter(Boolean)
  const selected = new Set<number>()

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const page = Math.min(Math.max(parseInt(part, 10), 1), totalPages)
      selected.add(page)
    } else {
      const match = part.match(/^(\d+)-(\d+)$/)
      if (match) {
        let start = parseInt(match[1], 10)
        let end = parseInt(match[2], 10)
        if (start > end) [start, end] = [end, start]
        start = Math.min(Math.max(start, 1), totalPages)
        end = Math.min(Math.max(end, 1), totalPages)
        for (let page = start; page <= end; page += 1) {
          selected.add(page)
        }
      }
    }
  }

  if (!selected.size) {
    throw new Error("No valid pages found to delete. Use commas and hyphens for ranges.")
  }

  return Array.from(selected).sort((a, b) => a - b)
}

function normalizePageOrder(order: number[] | undefined, totalPages: number): number[] {
  if (!order || !Array.isArray(order) || !order.length) {
    throw new Error("Provide the new page order before rearranging the PDF.")
  }

  const normalized = order.map((value) => {
    const page = Math.floor(Number(value))
    if (!Number.isFinite(page)) {
      throw new Error("Page order contains an invalid value. Only numbers are allowed.")
    }
    if (page < 1 || page > totalPages) {
      throw new Error(`Page order references page ${page}, but this PDF has ${totalPages} pages.`)
    }
    return page
  })

  if (normalized.length !== totalPages) {
    throw new Error(`Include every page exactly once. Expected ${totalPages} entries, received ${normalized.length}.`)
  }

  const unique = new Set(normalized)
  if (unique.size !== totalPages) {
    throw new Error("Each page must appear once. Remove duplicates and try again.")
  }

  return normalized
}

type RotationInstruction = { page: number; rotation: number }

type PdfTextEdit = {
  page: number
  text: string
  position?: "top" | "middle" | "bottom"
  align?: "left" | "center" | "right"
  fontSize?: number
  color?: string
}

function normalizeRotationInstructions(
  rotations: RotationInstruction[] | undefined,
  totalPages: number,
): RotationInstruction[] {
  if (!rotations || !Array.isArray(rotations) || !rotations.length) {
    throw new Error("Select at least one page to rotate before exporting.")
  }

  const normalized = new Map<number, number>()

  for (const entry of rotations) {
    const page = Math.floor(Number(entry?.page))
    const rawRotation = Number(entry?.rotation)

    if (!Number.isFinite(page) || !Number.isFinite(rawRotation)) {
      throw new Error("Rotation list contains invalid values. Use numeric page numbers and degrees.")
    }

    if (page < 1 || page > totalPages) {
      throw new Error(`Page ${page} is out of range. This PDF has ${totalPages} pages.`)
    }

    const normalizedRotation = ((rawRotation % 360) + 360) % 360
    if (normalizedRotation % 90 !== 0) {
      throw new Error("Rotations must be set in 90° increments.")
    }

    if (normalizedRotation === 0) {
      normalized.delete(page)
    } else {
      normalized.set(page, normalizedRotation)
    }
  }

  if (!normalized.size) {
    throw new Error("No rotation changes detected. Adjust a page angle before exporting.")
  }

  return Array.from(normalized.entries()).map(([page, rotation]) => ({ page, rotation }))
}

function parseHexColor(value?: string) {
  if (!value) {
    return undefined
  }
  const normalized = value.trim().replace(/^#/, "")
  if (!normalized.length || !/^[0-9a-f]+$/i.test(normalized)) {
    return undefined
  }
  const hex = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized
  if (hex.length !== 6) {
    return undefined
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return rgb(r, g, b)
}

function normalizeTextEdits(edits: PdfTextEdit[] | undefined, totalPages: number) {
  if (!edits || !Array.isArray(edits) || !edits.length) {
    throw new Error("Add at least one text block before exporting the edited PDF.")
  }

  const mapped = edits
    .map((entry) => ({
      page: Math.floor(Number(entry?.page)),
      text: String(entry?.text ?? "").trim(),
      position: (entry?.position ?? "top") as PdfTextEdit["position"],
      align: (entry?.align ?? "left") as PdfTextEdit["align"],
      fontSize: Number(entry?.fontSize) || 16,
      color: entry?.color,
    }))
    .filter((entry) => entry.text.length)

  if (!mapped.length) {
    throw new Error("Text blocks cannot be empty. Enter copy for each edit before exporting.")
  }

  mapped.forEach((entry) => {
    if (!Number.isFinite(entry.page) || entry.page < 1 || entry.page > totalPages) {
      throw new Error(`Text block references page ${entry.page}. This PDF has ${totalPages} pages.`)
    }
    entry.fontSize = Math.min(Math.max(entry.fontSize ?? 16, 8), 48)
    if (!entry.position || !["top", "middle", "bottom"].includes(entry.position)) {
      entry.position = "top"
    }
    if (!entry.align || !["left", "center", "right"].includes(entry.align)) {
      entry.align = "left"
    }
  })

  return mapped
}

export async function deletePdfPages(
  pdfBase64: string,
  options?: { pages?: string },
) {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")
  const srcDoc = await PDFDocument.load(pdfBuffer)
  const totalPages = srcDoc.getPageCount()

  const pagesToRemove = parsePagesToDelete(options?.pages ?? "", totalPages)
  if (pagesToRemove.length >= totalPages) {
    throw new Error("Cannot delete every page. Leave at least one page in the PDF.")
  }

  const removalSet = new Set(pagesToRemove)
  const keepIndices: number[] = []
  for (let page = 1; page <= totalPages; page += 1) {
    if (!removalSet.has(page)) {
      keepIndices.push(page - 1)
    }
  }

  const out = await PDFDocument.create()
  const copiedPages = await out.copyPages(srcDoc, keepIndices)
  copiedPages.forEach((p) => out.addPage(p))

  const bytes = await out.save({ useObjectStreams: true })

  return {
    fileName: `cleaned-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(bytes).toString("base64"),
    totalPages,
    removedPages: pagesToRemove,
    remainingPages: totalPages - pagesToRemove.length,
  }
}

export async function rearrangePdfPages(
  pdfBase64: string,
  options: { order: number[] },
) {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")
  const srcDoc = await PDFDocument.load(pdfBuffer)
  const totalPages = srcDoc.getPageCount()

  const normalizedOrder = normalizePageOrder(options?.order, totalPages)

  const out = await PDFDocument.create()
  for (const pageNumber of normalizedOrder) {
    const [copiedPage] = await out.copyPages(srcDoc, [pageNumber - 1])
    out.addPage(copiedPage)
  }

  const bytes = await out.save({ useObjectStreams: true })

  return {
    fileName: `reordered-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(bytes).toString("base64"),
    totalPages,
    order: normalizedOrder,
  }
}

export async function protectPdfWithPassword(
  pdfBase64: string,
  options: { userPassword: string; ownerPassword?: string; permissions?: string[] },
) {
  const userPassword = options?.userPassword?.trim()
  if (!userPassword) {
    throw new Error("Provide the password you want to require before opening the PDF.")
  }

  const { url, apiKey } = getProtectApiConfig()
  const pdfBuffer = toPdfBuffer(pdfBase64)
  const formData = new FormData()
  const uploadName = `protect-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`
  const fileBytes = new Uint8Array(pdfBuffer)
  formData.append("file", new Blob([fileBytes], { type: "application/pdf" }), uploadName)
  formData.append("userPassword", userPassword)

  if (options?.ownerPassword?.trim()) {
    formData.append("ownerPassword", options.ownerPassword.trim())
  }
  if (options?.permissions?.length) {
    formData.append("permissions", JSON.stringify(options.permissions))
  }

  const headers: Record<string, string> = {}
  if (apiKey) headers["x-api-key"] = apiKey

  const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: Object.keys(headers).length ? headers : undefined,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("PDF protection service unavailable. Please try again later.")
  }

  const payload: {
    fileName?: string
    pdfBase64?: string
    downloadUrl?: string
    expiresOn?: string
    permissions?: string[]
  } = await response.json()

  let protectedBase64 = payload.pdfBase64
  if (!protectedBase64 && payload.downloadUrl) {
    const protectedResponse = await fetch(payload.downloadUrl, { cache: "no-store" })
    if (!protectedResponse.ok) {
      throw new Error("Unable to download protected PDF from the service response.")
    }
    const bytes = await protectedResponse.arrayBuffer()
    protectedBase64 = Buffer.from(bytes).toString("base64")
  }

  if (!protectedBase64) {
    throw new Error("Invalid response from PDF protection service.")
  }

  return {
    fileName: payload.fileName ?? `protected-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: protectedBase64,
    downloadUrl: payload.downloadUrl,
    expiresOn: payload.expiresOn,
    enforcedPermissions: payload.permissions ?? options?.permissions ?? [],
  }
}

export async function rotatePdfPages(
  pdfBase64: string,
  options: { rotations: RotationInstruction[] },
) {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const totalPages = pdfDoc.getPageCount()

  const instructions = normalizeRotationInstructions(options?.rotations, totalPages)

  for (const instruction of instructions) {
    const page = pdfDoc.getPage(instruction.page - 1)
    page.setRotation(degrees(instruction.rotation))
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true })

  return {
    fileName: `rotated-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(bytes).toString("base64"),
    totalPages,
    rotations: instructions,
  }
}

export async function editPdf(
  pdfBase64: string,
  options: { edits: PdfTextEdit[]; metadata?: { title?: string; author?: string } },
) {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const totalPages = pdfDoc.getPageCount()

  const edits = normalizeTextEdits(options?.edits, totalPages)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  if (options?.metadata?.title?.trim()) {
    pdfDoc.setTitle(options.metadata.title.trim())
  }
  if (options?.metadata?.author?.trim()) {
    pdfDoc.setAuthor(options.metadata.author.trim())
  }

  const margin = 40
  const defaultColor = rgb(32 / 255, 36 / 255, 46 / 255)

  for (const edit of edits) {
    const page = pdfDoc.getPage(edit.page - 1)
    const { width, height } = page.getSize()
    const fontSize = edit.fontSize ?? 16
    const text = edit.text
    const color = parseHexColor(edit.color) ?? defaultColor
    let y: number
    switch (edit.position) {
      case "middle":
        y = height / 2 - fontSize / 2
        break
      case "bottom":
        y = margin
        break
      case "top":
      default:
        y = height - margin - fontSize
        break
    }

    const textWidth = font.widthOfTextAtSize(text, fontSize)
    let x: number
    switch (edit.align) {
      case "center":
        x = Math.max(margin, (width - textWidth) / 2)
        break
      case "right":
        x = Math.max(margin, width - margin - textWidth)
        break
      case "left":
      default:
        x = margin
        break
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color,
    })
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true })

  return {
    fileName: `edited-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(bytes).toString("base64"),
    totalPages,
    edits,
  }
}

export async function unlockPdf(
  pdfBase64: string,
  options: { password: string },
) {
  const password = options?.password?.trim()
  if (!password) {
    throw new Error("Enter the password required to open this PDF before unlocking it.")
  }

  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")

  let pdfDoc: PDFDocument
  try {
    const loadOptions = { password } as Parameters<typeof PDFDocument.load>[1]
    pdfDoc = await PDFDocument.load(pdfBuffer, loadOptions)
  } catch (error) {
    throw new Error("Unable to open the PDF with the provided password. Double-check it and try again.")
  }

  // Clearing encryption simply means resaving without password protection
  const bytes = await pdfDoc.save({ useObjectStreams: true })

  return {
    fileName: `unlocked-${new Date().toISOString().replace(/[:.]/g, "-")}.pdf`,
    pdfBase64: Buffer.from(bytes).toString("base64"),
  }
}
