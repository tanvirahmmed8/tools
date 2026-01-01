import type { Metadata } from "next"

import { PdfMergeSplitConverter } from "@/components/pdf-merge-split-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfMergeSeo from "@/seo/pdf-merge.json"

export const metadata: Metadata = buildMetadata(pdfMergeSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prepare PDFs before merging",
    description: "Clean filenames and optimized exports help the PDF merger tool stay fast and SEO-friendly.",
    steps: [
      "Rename every file with keyword-rich slugs such as client-onboarding-pack.pdf so search platforms understand the merged deliverable.",
      "Export each document at 150–300 DPI and keep the size under 20 MB to prevent stalled uploads when you merge PDF files online.",
      "Remove passwords or flatten annotations inside Acrobat, Preview, or your favorite editor so the combine process does not fail midstream.",
    ],
    helper: "Tip: If a PDF is huge, split it into quarterly or product-specific files first, then merge the final versions for your audience.",
  },
  {
    title: "Arrange PDF order and preview",
    description: "Use the drag-and-drop queue to control storytelling before combining PDF documents.",
    steps: [
      "Drop two or more PDFs into the uploader or tap Browse; each card lists page count and the original keyword-rich name.",
      "Use the Move Up or Move Down arrows to reorder case studies, contracts, or decks so the merged PDF mirrors your campaign flow.",
      "Clear the list when switching projects to avoid mixing confidential decks inside a single export.",
    ],
    helper: "Reordering inside the tool is faster than rearranging pages in Acrobat and preserves your original files untouched.",
  },
  {
    title: "Combine PDF documents and export",
    description: "Generate a downloadable master file the moment the status badge flips to Merge complete.",
    steps: [
      "Click Merge PDFs and keep the browser tab open; the on-device worker stitches each file without uploading data to external servers.",
      "Watch the Merge status panel for page counts and completion messages so you know the combined PDF is ready for distribution.",
      "Hit Download PDF to save the merged document with a descriptive name like growth-playbook-2026.pdf for instant sharing.",
    ],
    helper: "Store the merged asset in your DAM or Notion hub so sales, legal, and marketing teams grab the latest version.",
  },
  {
    title: "Troubleshoot merge hiccups",
    description: "Resolve common online PDF merger errors without switching tools.",
    steps: [
      "If a merge fails, double-check that every source PDF uses RGB color mode and is not protected by an owner password.",
      "When fonts look fuzzy, re-export the original PDF with embedded fonts enabled before dropping it back into the queue.",
      "Use the Clear button and refresh the page after heavy sessions to free memory before starting a new batch merge.",
    ],
    helper: "All processing happens locally, and files vanish when you close the tab, keeping compliance teams satisfied.",
  },
]

export default function PdfMergePage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfMergeSeo.structuredData} />
      <PdfMergeSplitConverter initialTab="merge" showTabs={false} navigationTitle="PDF Merge">
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF merge workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized manual to merge PDF files online, reorder critical decks, and export a polished master document that is
                ready for investors, compliance reviews, or self-serve downloads.
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
      </PdfMergeSplitConverter>
    </main>
  )
}
