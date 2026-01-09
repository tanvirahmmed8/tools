import type { Metadata } from "next"

import { MarkdownToHtml } from "@/components/markdown-to-html"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import mdHtmlSeo from "@/seo/markdown-to-html.json"

export const metadata: Metadata = buildMetadata(mdHtmlSeo)

export default function MarkdownToHtmlPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={mdHtmlSeo.structuredData} />
      <MarkdownToHtml />
    </main>
  )
}
