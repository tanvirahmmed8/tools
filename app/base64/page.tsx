import type { Metadata } from "next"

import { Base64Tool } from "@/components/base64-tool"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import base64Seo from "@/seo/base64.json"

export const metadata: Metadata = buildMetadata(base64Seo)

export default function Base64Page() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={base64Seo.structuredData} />
      <Base64Tool />
    </main>
  )
}
