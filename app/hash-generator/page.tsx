import type { Metadata } from "next"

import { HashGenerator } from "@/components/hash-generator"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import hashSeo from "@/seo/hash-generator.json"

export const metadata: Metadata = buildMetadata(hashSeo)

export default function HashGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={hashSeo.structuredData} />
      <HashGenerator />
    </main>
  )
}
