import type { Metadata } from "next"

import { WordCounter } from "@/components/word-counter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import wordCounterSeo from "@/seo/word-counter.json"

export const metadata: Metadata = buildMetadata(wordCounterSeo)

export default function WordCounterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={wordCounterSeo.structuredData} />
      <WordCounter />
    </main>
  )
}
