import type { Metadata } from "next"

import { PdfWatermarkConverter } from "@/components/pdf-watermark-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfWatermarkSeo from "@/seo/pdf-watermark.json"

export const metadata: Metadata = buildMetadata(pdfWatermarkSeo)

export default function PdfWatermarkPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfWatermarkSeo.structuredData} />
      <PdfWatermarkConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Add watermark to PDF — workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly checklist to add a text watermark or a PNG logo watermark to any PDF online. Batch watermark decks, invoices,
                and product manuals directly in your browser with consistent brand styling and export‑ready filenames.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Upload and inspect the PDF",
                  description: "Start every watermark job with a clean preview and keyword‑rich filename.",
                  steps: [
                    "Drop a PDF up to 20 MB or click Upload PDF to browse from desktop or cloud storage.",
                    "Confirm page count and orientation in the preview; rotate or delete pages first if needed.",
                    "Rename the source file with a descriptive slug (brand-styleguide-watermark.pdf) to keep exports organized and searchable.",
                  ],
                  helper: "High‑resolution scans and embedded fonts yield the sharpest watermark overlays in the final PDF.",
                },
                {
                  title: "Choose watermark type — Text or PNG logo",
                  description: "Match brand guidelines with typographic or logo‑based overlays.",
                  steps: [
                    "Pick Text watermark for quick © Your Brand overlays; set font size, color, opacity, and rotation.",
                    "Switch to Image watermark to import a transparent PNG/SVG logo; control scale for print‑ready clarity.",
                    "Use the Position preset (center, corners) to keep alignment consistent across pages and exports.",
                  ],
                  helper: "For subtle protection on social or public docs, keep opacity around 10–25% and rotate ~45° diagonally.",
                },
                {
                  title: "Apply to all pages or the first page only",
                  description: "Decide coverage based on the document’s audience and content.",
                  steps: [
                    "Enable Apply to all pages for decks, catalogs, or training packets that must retain attribution throughout.",
                    "Disable it to watermark only the cover page—ideal for proposals and one‑pagers.",
                    "Use Rotation and Position to prevent the watermark from overlapping critical charts or signatures.",
                  ],
                  helper: "Center overlays for anti‑copy protection; corner placement keeps reading flow unobstructed on dense reports.",
                },
                {
                  title: "Download and QA the watermarked PDF",
                  description: "Verify legibility and brand consistency before sharing.",
                  steps: [
                    "Click Download watermarked PDF and open the file in a new viewer or browser tab.",
                    "Zoom to 200% on charts and scanned pages to confirm edges remain crisp and the overlay doesn’t band.",
                    "If the watermark feels heavy, reduce opacity or font size, or try a lighter brand tint.",
                  ],
                  helper: "Combine with PDF Compress to shrink large deliverables before emailing or uploading to a CMS/DAM.",
                },
                {
                  title: "Troubleshooting transparency and logos",
                  description: "Fix common visual issues without leaving the tool.",
                  steps: [
                    "If a PNG logo looks soft, upload a 2× resolution source and decrease scaling to ~50–60%.",
                    "For lost contrast on bright pages, switch to a darker RGBA color or enable a subtle shadow behind text.",
                    "When processing very large PDFs, split the document first, watermark sections, then merge.",
                  ],
                  helper: "All processing runs locally in your browser; refreshing clears temporary data but never uploads your files.",
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
      </PdfWatermarkConverter>
    </main>
  )
}
