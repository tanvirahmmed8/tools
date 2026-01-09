import type { Metadata } from "next"

import { CharacterCounter } from "@/components/character-counter"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import characterCounterSeo from "@/seo/character-counter.json"

export const metadata: Metadata = buildMetadata(characterCounterSeo)

export default function CharacterCounterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={characterCounterSeo.structuredData} />
      <CharacterCounter />
    </main>
  )
}
