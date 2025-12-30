import type { Metadata } from "next"

import { PdfMergeSplitConverter } from "@/components/pdf-merge-split-converter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfMergeSplitSeo from "@/seo/pdf-merge-split.json"

export const metadata: Metadata = buildMetadata(pdfMergeSplitSeo)

export default function PdfMergeSplitPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfMergeSplitSeo.structuredData} />
      <PdfMergeSplitConverter />
    </main>
  )
}
