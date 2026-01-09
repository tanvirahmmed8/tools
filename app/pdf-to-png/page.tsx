import type { Metadata } from "next"

import { PdfToImageConverter } from "@/components/pdf-to-image-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToPngSeo from "@/seo/pdf-to-png.json"

export const metadata: Metadata = buildMetadata(pdfToPngSeo)

const heroContent = {
  badge: "Crystal clear exports",
  title: "Turn any PDF into edge-to-edge PNGs",
  description: "Upload a PDF and export every slide, worksheet, or receipt as a high-resolution PNG that is ready for LMS platforms, decks, and newsletters.",
}

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep and upload your PDF",
    description: "Start every conversion with a clean file name and a quick preview before hitting render.",
    steps: [
      "Drag your PDF into the converter or tap to browse from desktop, Drive, or iPad Files.",
      "Rename the document with SEO keywords (marketing-kit-2026.pdf) so exported PNGs inherit useful slugs.",
      "Stick to files under 20 MB to keep the in-browser renderer fast, even on multi-hundred-page workbooks.",
    ],
    helper: "Export PDFs from the source app at 150–300 DPI for tack-sharp PNG output without bloating downloads.",
  },
  {
    title: "Render each page into a PNG",
    description: "Let the canvas renderer rasterize pages at 1.5× scale for razor-sharp text and charts.",
    steps: [
      "Watch the rendering overlay for progress. Once it clears, every page appears with pixel dimensions for quick QA.",
      "Zoom through thumbnails to confirm handwriting, annotations, and signatures remain legible before downloading.",
      "Need to retry? Hit Clear to flush canvases and re-upload a tweaked PDF without refreshing the tab.",
    ],
    helper: "Transparent backgrounds are preserved, so sticker sheets, badges, or UI mockups move straight into Figma or Canva.",
  },
  {
    title: "Download individual PNGs or ZIPs",
    description: "Share classroom slides, product tear sheets, or receipts anywhere without requiring a PDF viewer.",
    steps: [
      "Use the PNG button on each card to download a specific page with an SEO-friendly filename.",
      "Select Download all to bundle every page into a single ZIP for LMS modules, DAM libraries, or client packages.",
      "Drop the exported PNGs into CMS galleries, social schedulers, or support docs knowing they match the original layout.",
    ],
    helper: "Keep archive names short and hyphenated (brand-style-pages.zip) so cloud drives index them cleanly.",
  },
  {
    title: "Fix common hiccups",
    description: "Resolve rendering issues without leaving the browser or exposing the file to third parties.",
    steps: [
      "If a page looks blurry, re-export the PDF from the source design file with higher image quality, then reconvert.",
      "For password-protected decks, remove the password in Acrobat or Preview before uploading.",
      "When gradients appear banded, reduce the PDF page size or flatten effects before running the converter again.",
    ],
    helper: "All processing happens locally, so confidential decks, invoices, or reports never leave your device.",
  },
]

export default function PdfToPngPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToPngSeo.structuredData} />
      <PdfToImageConverter format="png" navTitle="PDF to PNG" hero={heroContent}>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF to PNG workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-friendly playbook to convert PDFs into PNGs for pitch decks, coursework packets, and service receipts while preserving
                perfect layout fidelity and transparent backgrounds.
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
      </PdfToImageConverter>
    </main>
  )
}
