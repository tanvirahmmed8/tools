"use server"

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import pdfParse from "pdf-parse/lib/pdf-parse.js"
import { Document, Packer, Paragraph, TextRun } from "docx"

const { OPENAI_API_KEY } = process.env

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set. Add it to your environment before running server actions.")
}

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
})

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

export async function extractTextFromPdf(pdfBase64: string): Promise<string> {
  const base64Data = pdfBase64.includes(",") ? pdfBase64.split(",")[1] ?? "" : pdfBase64
  const pdfBuffer = Buffer.from(base64Data, "base64")

  const { text } = await pdfParse(pdfBuffer)
  const trimmed = text.trim()

  return trimmed.length ? trimmed : "No text found in PDF."
}

export async function convertPdfToWord(pdfBase64: string) {
  const text = await extractTextFromPdf(pdfBase64)
  const safeText = text && text.trim().length ? text.trim() : "No text found in PDF."

  const paragraphs = safeText.split(/\n{2,}/).map(
    (block) =>
      new Paragraph({
        children: block.split("\n").map((line, index) =>
          new TextRun({
            text: index === 0 ? line : `\n${line}`,
          }),
        ),
      }),
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length ? paragraphs : [new Paragraph({ children: [new TextRun("No text found in PDF.")] })],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)

  return {
    fileName: `textextract-${new Date().toISOString().replace(/[:.]/g, "-")}.docx`,
    docxBase64: buffer.toString("base64"),
    text: safeText,
  }
}
