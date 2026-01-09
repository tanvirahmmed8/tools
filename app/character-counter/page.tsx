import type { Metadata } from "next"

import { CharacterCounter } from "@/components/character-counter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import characterCounterSeo from "@/seo/character-counter.json"

export const metadata: Metadata = buildMetadata(characterCounterSeo)

export default function CharacterCounterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={characterCounterSeo.structuredData} />
      <CharacterCounter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Character Counter workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly guide to count characters with and without spaces, total lines, and UTF‑8 bytes online. Perfect for
                tweet length, SEO titles, meta descriptions, SMS limits, and platform caps.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Paste clean text",
                  description: "Ensure accurate character counts across browsers and editors.",
                  steps: [
                    "Paste from your draft or CMS without HTML tags or tracking code.",
                    "Use the Clear button to reset the field before checking new snippets.",
                    "Copy text after edits to reuse in titles, snippets, or SMS.",
                  ],
                  helper: "Counts update live as you type—great for rapid iterations.",
                },
                {
                  title: "Characters with and without spaces",
                  description: "Hit platform limits without accidental truncation.",
                  steps: [
                    "Check characters (with spaces) for SEO meta descriptions (~150–160).",
                    "Use characters (no spaces) when counting storage or strict field caps.",
                    "Tighten long sentences or remove extra whitespace to fit constraints.",
                  ],
                  helper: "Some CMSs count by bytes, not characters—review the next section when in doubt.",
                },
                {
                  title: "Bytes (UTF‑8) and line count",
                  description: "Plan for storage limits and multi‑line fields.",
                  steps: [
                    "Use Bytes (UTF‑8) when APIs or databases enforce byte caps, not character caps.",
                    "Check Lines to ensure multi‑line inputs (commit messages, YAML, CSV cells) fit UI expectations.",
                    "Normalize line endings if you move content between Windows, macOS, and Linux.",
                  ],
                  helper: "Emoji and some symbols are multi‑byte—byte counts help you avoid truncation in strict systems.",
                },
                {
                  title: "Platform length tips",
                  description: "Stay within common limits for better engagement and UX.",
                  steps: [
                    "SEO title: ~50–60 chars. Meta description: ~150–160.",
                    "Tweets/X posts: keep headlines tight; captions 70–100 characters often perform well.",
                    "SMS: target ≤ 160 chars per segment; Unicode may reduce the limit—verify by bytes.",
                  ],
                  helper: "Always preview in the target platform—rendering and truncation vary by device.",
                },
                {
                  title: "Publishing checklist",
                  description: "Ship polished copy to your CMS, app, or scheduler.",
                  steps: [
                    "Confirm char/byte limits, casing, and punctuation.",
                    "Add alt text for images and internal links where relevant.",
                    "Copy the final text and paste it into your production field.",
                  ],
                  helper: "Pair with Word Counter and Case Converter for complete pre‑publish QA.",
                },
              ].map((section) => (
                <article key={section.title} className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
                  <header>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                  </header>
                  <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm leading-relaxed text-foreground/80">
                    {section.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-4 rounded-md border border-dashed border-border/80 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    {section.helper}
                  </p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </CharacterCounter>
    </main>
  )
}
