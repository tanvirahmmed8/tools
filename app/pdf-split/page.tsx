import type { Metadata } from "next"

import { PdfMergeSplitConverter } from "@/components/pdf-merge-split-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfSplitSeo from "@/seo/pdf-split.json"

export const metadata: Metadata = buildMetadata(pdfSplitSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Audit the PDF before splitting",
    description: "Polish filenames and remove protections so the PDF splitter can process every page instantly.",
    steps: [
      "Rename the source file with intent, such as investor-report-2026.pdf, to keep SEO context when exporting each part.",
      "Flatten layers and annotations inside Acrobat or Preview so signatures, highlights, and sticky notes survive the split.",
      "If the file is encrypted, remove the owner password or export an unsecured copy before uploading to the PDF split tool.",
    ],
    helper: "Scanning or exporting at 200 DPI in sRGB ensures charts and scanned receipts look clean in every extracted PDF.",
  },
  {
    title: "Set precise page ranges",
    description: "Tell the PDF range splitter exactly which sections to pull for legal teams, investors, or LMS portals.",
    steps: [
      "Drop the PDF into the uploader and confirm the filename plus page count show up under Split status.",
      "Use the ranges field for granular control: enter 1-3 for executive summaries, 5,8 for single pages, or leave blank to export every page individually.",
      "Validate your syntax with commas between ranges and hyphens for spans so the parser knows how to separate each bundle.",
    ],
    helper: "Keep a note of chapter start pages in Notion or Excel so you can paste accurate ranges without re-reading the document.",
  },
  {
    title: "Split PDF pages and download",
    description: "Generate SEO-friendly, ready-to-share PDFs in seconds with on-device processing.",
    steps: [
      "Click Split PDF and let the worker process locally; no pages leave the browser, which keeps compliance happy.",
      "Watch the outputs counter to see how many child PDFs were generated and confirm naming conventions match your campaign keywords.",
      "Download each part or queue multiple clicks to grab every file you need for email attachments, LMS uploads, or investor portals.",
    ],
    helper: "Move the downloaded PDFs into a project-specific folder in Drive or SharePoint so teams reuse the fragments later.",
  },
  {
    title: "Troubleshoot PDF splitting issues",
    description: "Resolve common errors without leaving the browser-based PDF splitter.",
    steps: [
      "If the split fails, ensure the PDF is under 20 MB. Compress or split the source document first, then rerun the job.",
      "When fonts or colors shift, re-export the master PDF with embedded fonts and RGB color space before uploading again.",
      "Use the Clear button between large batches to flush cached previews and prevent accidental reuse of the previous document.",
    ],
    helper: "All temporary files delete automatically when you refresh, so sensitive decks never persist on shared machines.",
  },
]

export default function PdfSplitPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfSplitSeo.structuredData} />
      <PdfMergeSplitConverter initialTab="split" showTabs={false} navigationTitle="PDF Split">
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF split workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO-optimized manual to split PDFs online, isolate compliance-ready chapters, and ship download-friendly fragments without
                exposing documents to third-party servers.
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
