import type { Metadata } from "next"

import { ImageToPdfConverter } from "@/components/image-to-pdf-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageToPdfSeo from "@/seo/image-to-pdf.json"

export const metadata: Metadata = buildMetadata(imageToPdfSeo)

export default function ImageToPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageToPdfSeo.structuredData} />
      <ImageToPdfConverter />
    </main>
  )
}
