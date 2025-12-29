import type { Metadata } from "next"

import { PdfToTextConverter } from "@/components/pdf-to-text-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToTextSeo from "@/seo/pdf-to-text.json"

export const metadata: Metadata = buildMetadata(pdfToTextSeo)

export default function PdfToTextPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToTextSeo.structuredData} />
      <PdfToTextConverter />
    </main>
  )
}
