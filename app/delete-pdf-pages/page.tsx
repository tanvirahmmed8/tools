import type { Metadata } from "next"

import { PdfDeletePagesConverter } from "@/components/pdf-delete-pages-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import deletePdfPagesSeo from "@/seo/delete-pdf-pages.json"

export const metadata: Metadata = buildMetadata(deletePdfPagesSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep the PDF for cleanup",
    description: "Give the document a descriptive name and ensure it is unlocked before removing pages.",
    steps: [
      "Rename the file with a slug like q1-board-deck.pdf so the exported version inherits a context-rich filename.",
      "Flatten annotations or signature layers so nothing disappears when you trim pages.",
      "If the PDF is password protected, export an unsecured copy first; the page remover skips encrypted files.",
    ],
    helper: "Scanning or exporting in sRGB avoids color shifts when you generate the cleaned PDF.",
  },
  {
    title: "Describe the pages you want to delete",
    description: "Use commas for single pages and hyphens for ranges to keep syntax short and readable.",
    steps: [
      "Enter patterns such as 1-3,7,10 to remove a cover, appendix, and stray slide in one go.",
      "Keep a running doc of section start pages so you can paste accurate ranges without scrolling the PDF each time.",
      "Need to keep odd pages only? Enter the even numbers and the tool will delete them in one pass.",
    ],
    helper: "The parser automatically deduplicates numbers, so overlapping ranges are safe.",
  },
  {
    title: "Generate the cleaned PDF",
    description: "All processing happens in the browser, so regulated decks never leave your device.",
    steps: [
      "Click Delete pages and watch the status card for confirmation — most documents finish in a few seconds.",
      "Review the removed page list to confirm you hit every section before downloading.",
      "Share the cleaned PDF with clients or upload it to your LMS knowing sensitive slides are gone.",
    ],
    helper: "The tool preserves original page order and metadata so downstream automations stay intact.",
  },
  {
    title: "Troubleshoot edge cases",
    description: "A few quick fixes keep the delete workflow smooth on every browser.",
    steps: [
      "If nothing happens, confirm your syntax uses commas and hyphens only, with no spaces or semicolons.",
      "When a huge PDF stutters, run it through PDF Compress first or split it into halves, then delete pages.",
      "Hit Clear between different documents so you never mix page selections from the previous file.",
    ],
    helper: "Keep the original PDF archived so you can restore deleted sections later if priorities change.",
  },
]

export default function DeletePdfPagesPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={deletePdfPagesSeo.structuredData} />
      <PdfDeletePagesConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Remove PDF pages workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized playbook to delete sensitive or outdated PDF pages before sharing decks, briefs, and training packets with stakeholders.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {manualSections.map((section) => (
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
                  {section.helper ? (
                    <p className="mt-4 rounded-md border border-dashed border-border/80 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                      {section.helper}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </PdfDeletePagesConverter>
    </main>
  )
}
