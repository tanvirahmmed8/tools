import type { Metadata } from "next"

import { PdfCompressConverter } from "@/components/pdf-compress-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import homeSeo from "@/seo/home.json"

export const metadata: Metadata = buildMetadata(homeSeo)

export default function PdfCompressPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={homeSeo.structuredData} />
      <PdfCompressConverter />
    </main>
  )
}
