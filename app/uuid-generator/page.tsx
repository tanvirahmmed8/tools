import type { Metadata } from "next"

import { UuidGenerator } from "@/components/uuid-generator"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import uuidSeo from "@/seo/uuid-generator.json"

export const metadata: Metadata = buildMetadata(uuidSeo)

export default function UuidGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={uuidSeo.structuredData} />
      <UuidGenerator>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">UUID Generator workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Generate RFC 4122 UUIDv4 identifiers online. This SEO‑friendly guide covers uppercase and hyphenless formats, copy/download
                actions, and best practices for database keys, logs, and integration tests.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Choose batch size and format",
                  description: "Create 1–1000 UUIDs in uppercase or without hyphens.",
                  steps: [
                    "Set Count to the number of identifiers you need for seeding or fixtures.",
                    "Toggle Uppercase when your system or logs prefer capital letters.",
                    "Toggle Remove hyphens to output the 32‑character compact form.",
                  ],
                  helper: "Most systems accept the canonical 36‑character variant with hyphens: 8-4-4-4-12.",
                },
                {
                  title: "Generate UUIDv4 values",
                  description: "Use secure randomness from the browser where available.",
                  steps: [
                    "Click Generate to produce cryptographically secure UUIDv4 identifiers.",
                    "The tool falls back to getRandomValues when randomUUID isn’t available.",
                    "Avoid manually editing UUIDs—format errors cause downstream validation failures.",
                  ],
                  helper: "UUIDv4 is random; if you need time‑sortable IDs, consider ULID or UUIDv7 instead.",
                },
                {
                  title: "Copy and download",
                  description: "Move identifiers into your app, seed scripts, or test data.",
                  steps: [
                    "Use Copy to place the batch on your clipboard.",
                    "Download uuids.txt for audit trails or sharing with teammates.",
                    "Clear before generating a new set to avoid duplicate pastes.",
                  ],
                  helper: "Store sensitive identifiers in a secure vault or .env file when applicable.",
                },
                {
                  title: "Best practices",
                  description: "Keep IDs unique, opaque, and non‑guessable.",
                  steps: [
                    "Use UUIDs as surrogate keys, not user‑visible references when sequence matters.",
                    "Index UUID columns in databases; consider compact/hyphenless form for storage and cache keys.",
                    "Never expose predictable identifiers in public APIs—UUIDv4 reduces enumeration risk.",
                  ],
                  helper: "For relational databases, benchmark UUID storage vs. bigint to choose the right trade‑offs.",
                },
                {
                  title: "Troubleshooting",
                  description: "Resolve common formatting and copy issues.",
                  steps: [
                    "If an import rejects values, verify hyphen placement (8‑4‑4‑4‑12) or use the hyphenless option.",
                    "Ensure uppercase/lowercase matches your system’s validation pattern.",
                    "Regenerate if accidental edits or whitespace were introduced while copying.",
                  ],
                  helper: "All generation happens locally in your browser—no identifiers are uploaded to a server.",
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
      </UuidGenerator>
    </main>
  )
}
