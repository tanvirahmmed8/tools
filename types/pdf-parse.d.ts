declare module "pdf-parse/lib/pdf-parse.js" {
  import type { Buffer } from "node:buffer"

  interface PdfMetadata {
    info?: Record<string, unknown>
    metadata?: unknown
    version?: string
  }

  interface PdfParseResult {
    numpages: number
    numrender: number
    info: PdfMetadata["info"]
    metadata: PdfMetadata["metadata"]
    version: PdfMetadata["version"]
    text: string
    outline?: unknown
    attachments?: unknown
    formImage?: unknown
  }

  type PdfParse = (data: Buffer | Uint8Array) => Promise<PdfParseResult>

  const pdfParse: PdfParse
  export default pdfParse
}
