import type { Metadata } from "next"

import { WordCounter } from "@/components/word-counter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import wordCounterSeo from "@/seo/word-counter.json"

export const metadata: Metadata = buildMetadata(wordCounterSeo)

export default function WordCounterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={wordCounterSeo.structuredData} />
      <WordCounter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Word Counter workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly checklist to count words, characters, sentences, paragraphs, and estimate reading time online. Great for
                blog posts, product pages, social captions, and documentation where length and readability matter.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Paste or type your text",
                  description: "Start analysis with clean input for accurate counts.",
                  steps: [
                    "Paste content from your CMS draft, Google Doc, or markdown editor into the text box.",
                    "Remove tracking snippets or HTML. Keep only the copy you want measured for SEO and readability.",
                    "Click Copy text after edits to reuse the refined version in your publishing workflow.",
                  ],
                  helper: "Use descriptive headings and short paragraphs—your reading‑time estimate improves and bounce rates drop.",
                },
                {
                  title: "Check word and character counts",
                  description: "Hit common length targets for titles, meta descriptions, and emails.",
                  steps: [
                    "Aim for 50–60 characters for SEO titles and ~150–160 for meta descriptions.",
                    "For product bullets and CTAs, keep lines concise (under ~60–80 characters) to avoid truncation.",
                    "Track characters with and without spaces when comparing platform limits.",
                  ],
                  helper: "Counts update live as you type so you can tune headings, snippets, and captions on the fly.",
                },
                {
                  title: "Review sentences and paragraphs",
                  description: "Keep readability high for skimmers and screen readers.",
                  steps: [
                    "Shorten very long sentences or split into bullet points for better scan‑ability.",
                    "Target 2–4 sentences per paragraph for blog and docs; dense walls of text reduce engagement.",
                    "Use sub‑headings every ~150–300 words to introduce new sections and keywords.",
                  ],
                  helper: "Combine with your style guide (voice, tense, casing) for consistent UX across pages.",
                },
                {
                  title: "Estimate reading time",
                  description: "Set expectations for users and editors.",
                  steps: [
                    "Reading time is based on ~200 words per minute. Adjust copy length to match your target session length.",
                    "Flag very short pages (&lt; 30 sec) for enrichment—add examples, images, or internal links.",
                    "For long tutorials (&gt; 7 min), add a table of contents and anchors for quick navigation.",
                  ],
                  helper: "Long‑form posts can perform better when paired with summaries and jump links.",
                },
                {
                  title: "Publishing checklist",
                  description: "Ship SEO‑ready copy without leaving the browser.",
                  steps: [
                    "Confirm title/meta limits, add alt text for images, and include internal/external links.",
                    "Check for duplicate headings and ensure consistent casing (Title Case or sentence case).",
                    "Copy the final text and paste it into your CMS, docs, or social scheduler.",
                  ],
                  helper: "Pair the Word Counter with Case Converter and Character Counter for final polish.",
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
      </WordCounter>
    </main>
  )
}
