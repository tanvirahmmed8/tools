import type { Metadata } from "next"

import { UuidGenerator } from "@/components/uuid-generator"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import uuidSeo from "@/seo/uuid-generator.json"

export const metadata: Metadata = buildMetadata(uuidSeo)

export default function UuidGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={uuidSeo.structuredData} />
      <UuidGenerator />
    </main>
  )
}
