import type { Metadata } from "next"

import { ImageResizer } from "@/components/image-resizer"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageResizerSeo from "@/seo/image-resizer.json"

export const metadata: Metadata = buildMetadata(imageResizerSeo)

export default function ImageResizerPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageResizerSeo.structuredData} />
      <ImageResizer />
    </main>
  )
}
