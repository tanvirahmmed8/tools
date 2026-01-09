import type { Metadata } from "next"

import { MarkdownToHtml } from "@/components/markdown-to-html"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import mdHtmlSeo from "@/seo/markdown-to-html.json"

export const metadata: Metadata = buildMetadata(mdHtmlSeo)

export default function MarkdownToHtmlPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={mdHtmlSeo.structuredData} />
      <MarkdownToHtml>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Markdown to HTML converter workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Convert Markdown to safe, sanitized HTML online. This SEO‑friendly guide covers headings, lists, links, inline code, fenced
                code blocks, and common troubleshooting for copy/paste content.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Paste Markdown",
                  description: "Start with clean source for accurate rendering.",
                  steps: [
                    "Paste Markdown from your editor, README, or docs without extra HTML.",
                    "Keep headings (# .. ######), lists (-, *, 1.), links [text](url), and inline code `like this`.",
                    "Use the Sample button first if you need to verify supported syntax.",
                  ],
                  helper: "The converter focuses on common GitHub‑style Markdown.",
                },
                {
                  title: "Format headings, lists, and links",
                  description: "Generate readable HTML for blogs and docs.",
                  steps: [
                    "Use # H1 and ## H2 for SEO‑friendly structure; avoid skipping heading levels.",
                    "Create bullet lists with -, * and ordered lists with 1. 2. 3.",
                    "Insert links with [label](https://example.com) to keep anchor text descriptive.",
                  ],
                  helper: "Descriptive headings and anchor text improve accessibility and search.",
                },
                {
                  title: "Code and fenced blocks",
                  description: "Render code snippets clearly for tutorials and READMEs.",
                  steps: [
                    "Wrap inline snippets with backticks (`code`).",
                    "Use triple backticks for fenced blocks; language hints are preserved in a code element.",
                    "Copy the output to your CMS or docs site as preformatted code.",
                  ],
                  helper: "The converter escapes HTML to prevent injection—safe by default.",
                },
                {
                  title: "Sanitization & safety",
                  description: "Protect pages from unsafe markup.",
                  steps: [
                    "HTML in Markdown is escaped so scripts and tags aren’t executed.",
                    "Links include rel attributes for external targets to reduce risk.",
                    "If you need raw HTML, paste it directly into your CMS after review.",
                  ],
                  helper: "Sanitization keeps content safe for embedding across sites and knowledge bases.",
                },
                {
                  title: "Copy & Download",
                  description: "Move sanitized HTML into your workflow.",
                  steps: [
                    "Copy output and paste into your CMS, static site generator, or component.",
                    "Download converted.html for version control or attachments.",
                    "Re‑run after editing Markdown to keep HTML in sync.",
                  ],
                  helper: "All conversion happens locally in your browser.",
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
      </MarkdownToHtml>
    </main>
  )
}
