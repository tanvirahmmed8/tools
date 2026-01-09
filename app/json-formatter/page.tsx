import type { Metadata } from "next"

import { JsonFormatter } from "@/components/json-formatter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import jsonFormatterSeo from "@/seo/json-formatter.json"

export const metadata: Metadata = buildMetadata(jsonFormatterSeo)

export default function JsonFormatterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={jsonFormatterSeo.structuredData} />
      <JsonFormatter />
    </main>
  )
}
