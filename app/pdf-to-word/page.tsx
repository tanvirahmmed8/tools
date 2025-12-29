import type { Metadata } from "next"

import { PdfToWordConverter } from "@/components/pdf-to-word-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToWordSeo from "@/seo/pdf-to-word.json"

export const metadata: Metadata = buildMetadata(pdfToWordSeo)

export default function PdfToWordPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToWordSeo.structuredData} />
      <PdfToWordConverter />
    </main>
  )
}
