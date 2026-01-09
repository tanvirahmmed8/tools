import type { Metadata } from "next"

import { PdfWatermarkConverter } from "@/components/pdf-watermark-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfWatermarkSeo from "@/seo/pdf-watermark.json"

export const metadata: Metadata = buildMetadata(pdfWatermarkSeo)

export default function PdfWatermarkPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfWatermarkSeo.structuredData} />
      <PdfWatermarkConverter />
    </main>
  )
}
