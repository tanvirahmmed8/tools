import type { Metadata } from "next"

import { PdfPageNumbersConverter } from "@/components/pdf-page-numbers-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfNumbersSeo from "@/seo/pdf-page-numbers.json"

export const metadata: Metadata = buildMetadata(pdfNumbersSeo)

export default function PdfPageNumbersPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfNumbersSeo.structuredData} />
      <PdfPageNumbersConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Add page numbers to PDF — workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly checklist to insert header or footer page numbers into any PDF online. Customize templates like
                “Page {`{n}`} of {`{total}` }”, pick position presets, and export a clean, searchable document for print or sharing.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Upload and audit the PDF",
                  description: "Start with a tidy filename and check the order before numbering.",
                  steps: [
                    "Upload the PDF and confirm the total page count appears in the status card.",
                    "If slides are out of sequence, resequence them first in Rearrange PDF Pages, then return to numbering.",
                    "Rename the source file with a keyword‑rich slug (playbook-2026-numbered.pdf) to keep archives searchable.",
                  ],
                  helper: "Rotate sideways scans before numbering so footer and header positions align with the reading flow.",
                },
                {
                  title: "Pick a page number template",
                  description: "Choose simple {`{n}`} or full context with {`{n}`} of {`{total}`}.",
                  steps: [
                    "Use Page {`{n}`} of {`{total}`} for formal reports and legal deliverables.",
                    "Stick to {`{n}`} for slide decks where space is tight.",
                    "Enter a custom string with {`{n}`} and {`{total}`} placeholders to match house style.",
                  ],
                  helper: "You can start numbering at any value (e.g., 5) when the first pages are covers or tables of contents.",
                },
                {
                  title: "Set position, margins, and opacity",
                  description: "Control readability without distracting from content.",
                  steps: [
                    "Choose bottom‑center for most documents; top‑right works well for technical specs and manuals.",
                    "Adjust the margin to keep numbers clear of footers, legal disclaimers, or binding edges.",
                    "Use a subtle color (e.g., #111827 at ~90% opacity) to stay legible on print and screen.",
                  ],
                  helper: "Consider smaller font sizes on dense tables; test at 100% zoom before exporting for print.",
                },
                {
                  title: "Export and QA the numbered PDF",
                  description: "Verify pagination and template rendering across sections.",
                  steps: [
                    "Click Download numbered PDF and open the file in a new tab or viewer.",
                    "Jump to the first and last pages to confirm the starting value and total are correct.",
                    "Spot‑check pages with complex footers to ensure numbers do not overlap charts or signatures.",
                  ],
                  helper: "If numbers clip near the edge, increase the margin or switch position to top‑center.",
                },
                {
                  title: "Troubleshooting templates and fonts",
                  description: "Fix typical layout issues quickly.",
                  steps: [
                    "If numbers appear faint, switch to a darker color or increase opacity.",
                    "When digits wrap strangely, try a smaller font size or move to bottom‑center.",
                    "For documents with alternating margins, export two variants (left/right) and merge if exact mirroring is required.",
                  ],
                  helper: "All numbering runs in your browser; refresh to clear temporary data when switching projects.",
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
      </PdfPageNumbersConverter>
    </main>
  )
}
