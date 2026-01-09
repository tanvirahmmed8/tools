import type { Metadata } from "next"

import { CaseConverter } from "@/components/case-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import caseConverterSeo from "@/seo/case-converter.json"

export const metadata: Metadata = buildMetadata(caseConverterSeo)

export default function CaseConverterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={caseConverterSeo.structuredData} />
      <CaseConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Case Converter workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Convert text to UPPERCASE, lowercase, or Title Case online. This SEO‑friendly playbook helps you format headlines, meta titles,
                email subject lines, and UI labels consistently across apps and CMSs.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Paste the text you want to convert",
                  description: "Start with clean input for reliable casing.",
                  steps: [
                    "Paste copy from your editor, docs, or CMS without extra markup.",
                    "Use Clear to reset the field before checking another snippet.",
                    "Tap Copy text after conversion to reuse in production.",
                  ],
                  helper: "Keep lines short for UI strings and navigation labels to avoid truncation.",
                },
                {
                  title: "UPPERCASE",
                  description: "Great for short labels, badges, and acronyms.",
                  steps: [
                    "Apply to CTA buttons, table headers, and status chips sparingly.",
                    "Avoid long uppercase sentences—readability drops on mobile.",
                    "Combine with Character Counter to stay within UI caps.",
                  ],
                  helper: "UPPERCASE can increase perceived emphasis but should not replace semantic headings.",
                },
                {
                  title: "lowercase",
                  description: "Neutral tone for slugs, filenames, and certain brand styles.",
                  steps: [
                    "Use for URL slugs and filenames to improve consistency and searchability.",
                    "Adopt for minimalist brands or microcopy where tone calls for it.",
                    "Verify readability in all‑lowercase languages and avoid ambiguity in proper nouns.",
                  ],
                  helper: "For slugs, replace spaces with hyphens and remove punctuation for best SEO hygiene.",
                },
                {
                  title: "Title Case",
                  description: "Ideal for blog headlines, feature names, and marketing pages.",
                  steps: [
                    "Capitalize principal words; keep short articles/conjunctions lowercase unless first or last.",
                    "Use consistent rules across site sections to meet brand guidelines.",
                    "Preview how titles appear in SERP snippets and nav menus.",
                  ],
                  helper: "Different style guides vary—choose Chicago/AP rules and stick to one convention.",
                },
                {
                  title: "Publishing checklist",
                  description: "Ship formatted copy with confidence.",
                  steps: [
                    "Confirm casing matches brand voice and context (headline vs. label).",
                    "Run a quick spell‑check after conversion; casing doesn’t fix typos.",
                    "Copy the final text and paste into your CMS, design system, or translation tool.",
                  ],
                  helper: "Pair with Word Counter/Character Counter to meet platform limits before launch.",
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
      </CaseConverter>
    </main>
  )
}
