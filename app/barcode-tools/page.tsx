import type { Metadata } from "next"

import { BarcodeTools } from "@/components/barcode-tools"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import barcodeSeo from "@/seo/barcode-tools.json"

export const metadata: Metadata = buildMetadata(barcodeSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
  tips?: string[]
}

const manualSections: ManualSection[] = [
  {
    title: "Scan or decode barcodes online",
    description: "Use the built-in barcode scanner to read CODE128, EAN, UPC, ITF, and CODE39 labels in seconds.",
    steps: [
      "Open the Barcode to Text panel, tap Scan Barcode with Camera to launch the in-browser barcode scanner, or drop/upload sharp PNG, JPG, or WEBP barcode images.",
      "Center the code so it fills most of the frame. The ZXing multi-format reader sweeps for CODE128, EAN-13/8, UPC-A/E, ITF, and CODE39 symbologies.",
      "Once the 'Reading barcode...' overlay disappears, copy the decoded SKU, URL, or tracking ID or hit Reset to scan another label.",
    ],
    helper: "For the highest decode accuracy, shoot in bright light, avoid glare, and crop the photo so only the barcode stripes remain.",
  },
  {
    title: "Generate printable CODE128 barcodes",
    description: "Create crisp barcode images for packaging, warehouse racks, and shipping labels directly in the browser.",
    steps: [
      "Enter product codes, shipment numbers, or short URLs into Text to Barcode. Keep inputs under ~80 characters for pixel-perfect renders.",
      "Click Generate barcode to preview the CODE128 image plus human-readable text so QC teams can double-check values.",
      "Download PNG to get a high-contrast barcode ready for print, or choose New barcode to create the next label without refreshing the page.",
    ],
    helper: "JsBarcode outputs on a white canvas with padded margins, ensuring thermal printers and label apps keep the bars scannable.",
  },
  {
    title: "Bulk barcode generator for CSV lists",
    description: "Convert spreadsheet columns into a zipped batch of PNG barcode files for inventory imports.",
    steps: [
      "Export a CSV using the columns value,name (header optional). Column one is the barcode value; column two sets the filename slug.",
      "Drag the CSV into the upload target or browse to select it. The parser validates every row, then reports the total ready for export.",
      "Press Generate ZIP to bundle each row into name.png (or barcode-# if no name exists) and download the archive instantly.",
    ],
    helper: "Grab the Download sample CSV to confirm formatting before exporting data from Excel, Google Sheets, Airtable, or ERPs.",
  },
  {
    title: "Troubleshooting & SEO-friendly best practices",
    description: "Keep the barcode generator, scanner, and CSV exporter performing reliably for onsite and field teams.",
    steps: [
      "If the online barcode scanner fails, move closer or bump exposure until bars span at least 300 px for ZXing to lock onto.",
      "Angle reflective packaging 5–10° to remove glare streaks; the preview refreshes automatically when contrast improves.",
      "When bulk exports slow down, split the CSV into batches of 500 rows or fewer so the browser can zip files without throttling.",
    ],
    helper: "Everything runs locally in your browser, so refreshing the page clears cached previews, generated ZIPs, and temporary images.",
  },
]

export default function BarcodeToolsPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={barcodeSeo.structuredData} />
      <BarcodeTools>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
                Barcode Toolkit walkthrough
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO-optimized guide to master the online barcode scanner, CODE128 barcode generator, and CSV bulk barcode maker.
                Each workflow keeps your barcode operations fast, browser-based, and search-friendly for ecommerce, retail, and logistics teams.
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
      </BarcodeTools>
    </main>
  )
}
