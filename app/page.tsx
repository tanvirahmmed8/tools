import type { Metadata } from "next"

import { ImageToTextConverter } from "@/components/image-to-text-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import homeSeo from "@/seo/home.json"

export const metadata: Metadata = buildMetadata(homeSeo)

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={homeSeo.structuredData} />
      <ImageToTextConverter />
    </main>
  )
}
