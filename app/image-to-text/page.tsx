import type { Metadata } from "next"

import { ImageToTextConverter } from "@/components/image-to-text-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageToTextSeo from "@/seo/image-to-text.json"

export const metadata: Metadata = buildMetadata(imageToTextSeo)

export default function ImageToTextPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageToTextSeo.structuredData} />
      <ImageToTextConverter />
    </main>
  )
}
