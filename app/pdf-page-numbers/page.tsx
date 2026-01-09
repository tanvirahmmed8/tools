import type { Metadata } from "next"

import { PdfPageNumbersConverter } from "@/components/pdf-page-numbers-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfNumbersSeo from "@/seo/pdf-page-numbers.json"

export const metadata: Metadata = buildMetadata(pdfNumbersSeo)

export default function PdfPageNumbersPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfNumbersSeo.structuredData} />
      <PdfPageNumbersConverter />
    </main>
  )
}
