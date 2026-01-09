import type { Metadata } from "next"

import { PdfImageExtractor } from "@/components/pdf-image-extractor"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import extractPdfImagesSeo from "@/seo/extract-pdf-images.json"

export const metadata: Metadata = buildMetadata(extractPdfImagesSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prepare the PDF for extraction",
    description: "Keep filenames clear and pages oriented so assets line up with your brief.",
    steps: [
      "Rename the PDF with a searchable slug (e.g., brand-shoot-2026.pdf) before uploading.",
      "If pages are sideways or need trimming, run Rotate or Delete Pages first so visuals export cleanly.",
      "Ensure the source export preserves raster layers—flattened vectors remain part of the PDF and will not extract as standalone PNGs.",
    ],
    helper: "Need the entire page as an image? Pair this tool with PDF to PNG or PDF to JPG for slide-level renders.",
  },
  {
    title: "Upload and scan",
    description: "Drop the PDF and let the analyzer inspect each page for embedded XObjects and inline images.",
    steps: [
      "Drag the PDF into the uploader or tap to browse from desktop, Drive download, or tablet storage.",
      "Watch the status feed as the tool steps through every page, caching high-res assets as it goes.",
      "Keep the tab active for large decks—everything runs locally, so no data leaves your device.",
    ],
    helper: "Most decks finish in under a minute, even with 50+ product photos or architectural renders.",
  },
  {
    title: "Audit every asset",
    description: "Preview images, confirm pixel dimensions, and group them by page before downloading.",
    steps: [
      "Scroll the Extracted Images panel to review each PNG with its page number and source type (embedded vs. inline).",
      "Note the width × height callouts to see which assets are ready for social, web, or print workflows.",
      "Need to keep track of sections? Filter by page number inside your DAM or rename after download using the generated slug.",
    ],
    helper: "Inline icons often export at smaller sizes. Upscale them in the Image Resizer tool if you need retina-ready UI elements.",
  },
  {
    title: "Deliver PNGs or a single ZIP",
    description: "Hand off assets to marketing, design, or documentation teams immediately.",
    steps: [
      "Download individual PNGs right from the list when you only need a couple of hero shots.",
      "Click Download all to bundle everything into a ZIP with descriptive filenames (page + image index).",
      "Move the archive into your shared drive, Slack channel, or DAM folder while the PDF stays private on-device.",
    ],
    helper: "Pair with Image Converter if teammates prefer JPG, WEBP, or AVIF outputs for web performance.",
  },
]

export default function ExtractPdfImagesPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={extractPdfImagesSeo.structuredData} />
      <PdfImageExtractor>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Extract PDF images playbook</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow these field-tested steps to capture every raster asset inside a PDF, keep filenames consistent, and share exports with marketing, design, or research teams without installing heavy desktop software.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {manualSections.map((section) => (
                <article key={section.title} className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
                  <header>
                    <h3 className="text-xl font-semibold text-foreground">{section.title}</h3>
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
      </PdfImageExtractor>
    </main>
  )
}
