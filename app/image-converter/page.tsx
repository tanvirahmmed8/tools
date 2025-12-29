import type { Metadata } from "next"

import { ImageFormatConverter } from "@/components/image-format-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageConverterSeo from "@/seo/image-converter.json"

export const metadata: Metadata = buildMetadata(imageConverterSeo)

export default function ImageConverterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageConverterSeo.structuredData} />
      <ImageFormatConverter />
    </main>
  )
}
