import type { Metadata } from "next"

import { CaseConverter } from "@/components/case-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import caseConverterSeo from "@/seo/case-converter.json"

export const metadata: Metadata = buildMetadata(caseConverterSeo)

export default function CaseConverterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={caseConverterSeo.structuredData} />
      <CaseConverter />
    </main>
  )
}
