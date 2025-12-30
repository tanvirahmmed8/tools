import type { Metadata } from "next"

import { ImageWatermark } from "@/components/image-watermark"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageWatermarkSeo from "@/seo/image-watermark.json"

export const metadata: Metadata = buildMetadata(imageWatermarkSeo)

export default function ImageWatermarkPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageWatermarkSeo.structuredData} />
      <ImageWatermark />
    </main>
  )
}
