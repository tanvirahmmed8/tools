import type { Metadata } from "next"

import { PdfToImageConverter } from "@/components/pdf-to-image-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToImageSeo from "@/seo/pdf-to-image.json"

export const metadata: Metadata = buildMetadata(pdfToImageSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload PDFs for image export",
    description: "Kick off the PDF to PNG workflow with crisp previews and SEO-friendly filenames.",
    steps: [
      "Drag a PDF into the converter or tap to browse from your desktop, Google Drive download, or tablet storage.",
      "Confirm the filename appears in the Upload PDF header and rename the source file with keywords like webinar-slides-2026.pdf for better search.",
      "Keep PDFs under 20 MB so rendering stays smooth, even when processing multi-page reports or coursework packets.",
    ],
    helper: "Exporting from the original authoring tool at 150–300 DPI ensures the resulting PNG images stay crisp for social or LMS uploads.",
  },
  {
    title: "Convert every PDF page to PNG",
    description: "Use the in-browser renderer to generate high-resolution page images.",
    steps: [
      "Click Convert (automatic after upload) and let the PDF renderer process each page at 1.5× scale for sharper text.",
      "Monitor the Rendering pages overlay; once it disappears, each slide, receipt, or worksheet appears with pixel dimensions.",
      "Preview every output to ensure charts, signatures, and handwriting remain legible before hitting download.",
    ],
    helper: "Need JPEGs instead? Download the PNGs and run them through the Image Converter tool for lightweight JPG or WEBP variants.",
  },
  {
    title: "Download single pages or full ZIP archives",
    description: "Share slides, lessons, or marketing assets anywhere that prefers images over PDFs.",
    steps: [
      "Use the PNG button on each card to download an individual page with a descriptive filename like deck-name-page-03.png.",
      "Hit Download all to bundle every page into a ZIP, perfect for classroom handouts, LMS modules, or client review folders.",
      "Upload the exported images to social channels, newsletters, or CMS galleries without needing PDF viewers on the recipient side.",
    ],
    helper: "Keep ZIP names short and hyphenated (brand-playbook-pages.zip) so cloud drives and DAM systems index them cleanly.",
  },
  {
    title: "Troubleshoot rendering hiccups",
    description: "Maintain high fidelity while keeping everything private in the browser.",
    steps: [
      "If a PDF stalls, refresh the page to clear cached canvases, then re-upload the file.",
      "For password-protected documents, remove protection in your PDF editor before importing.",
      "When gradients look banded, re-export the PDF with higher image quality or smaller page dimensions, then reconvert.",
    ],
    helper: "All conversions happen locally, so sensitive decks, invoices, and medical forms never leave your device.",
  },
]

export default function PdfToImagePage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToImageSeo.structuredData} />
      <PdfToImageConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF to Image workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized playbook to transform PDFs into shareable PNGs for marketing, education, and client reviews.
                Each step keeps filenames keyword-rich, conversions private, and exports ready for social channels or CMS uploads.
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
