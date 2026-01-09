import type { Metadata } from "next"

import { WebpageToPdf } from "@/components/webpage-to-pdf"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import webpageToPdfSeo from "@/seo/webpage-to-pdf.json"

export const metadata: Metadata = buildMetadata(webpageToPdfSeo)

export default function WebpageToPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={webpageToPdfSeo.structuredData} />
      <WebpageToPdf />
    </main>
  )
}
