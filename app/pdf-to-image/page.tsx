import type { Metadata } from "next"

import { PdfToImageConverter } from "@/components/pdf-to-image-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToImageSeo from "@/seo/pdf-to-image.json"

export const metadata: Metadata = buildMetadata(pdfToImageSeo)

export default function PdfToImagePage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToImageSeo.structuredData} />
      <PdfToImageConverter />
    </main>
  )
}
