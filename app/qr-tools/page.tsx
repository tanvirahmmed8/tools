import type { Metadata } from "next"

import { QrTools } from "@/components/qr-tools"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import qrToolsSeo from "@/seo/qr-tools.json"

export const metadata: Metadata = buildMetadata(qrToolsSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload and scan QR codes",
    description: "Kick off decoding sessions with camera captures or uploaded PNG/JPG files.",
    steps: [
      "Launch the QR toolkit and drag any QR screenshot into the drop zone or tap Scan QR with Camera to capture live.",
      "Wait for the QR to Text panel to display the embedded payload; the detection engine handles URLs, Wi-Fi configs, and short strings.",
      "Use the Reset button to clear previews before scanning the next code—perfect for booth visitors, packaging, or event badges.",
    ],
    helper: "Best results come from QR images that are sharp, high-contrast, and occupy most of the frame.",
  },
  {
    title: "Generate branded QR codes",
    description: "Turn URLs, coupons, or support links into downloadable QR PNGs.",
    steps: [
      "Enter any message, deep link, or short set of instructions in Text to QR.",
      "Press Generate QR to render a 480px PNG preview that keeps edges crisp for print or digital signage.",
      "Download the PNG and add it to posters, receipts, packaging, or microsites. Use New code to clear the canvas for the next campaign.",
    ],
    helper: "Pair each QR download with descriptive filenames like qr-new-feature-tour.png to keep DAM libraries organized and SEO-friendly.",
  },
  {
    title: "Bulk-create QR codes from CSV",
    description: "Export hundreds of codes for onboarding kits, loyalty cards, or product inserts.",
    steps: [
      "Prepare a CSV with columns value,name (name optional). Column one is the QR payload; column two becomes the filename slug.",
      "Upload the CSV and confirm the parser reports how many rows were detected.",
      "Click Generate ZIP to download a bundle of PNG QR codes labeled with each custom filename.",
    ],
    helper: "Grab the sample CSV if you need to double-check formatting before exporting from Airtable, Sheets, or Excel.",
  },
  {
    title: "Troubleshoot scanning and exports",
    description: "Solve common QR decoding or generation issues without leaving the page.",
    steps: [
      "If decoding fails, crop tighter around the QR or brighten the photo. Glare and blur are the usual culprits.",
      "When generated codes look soft on print, avoid resizing the PNG; instead, place it at 100% scale in your layout app.",
      "Split CSV batches into chunks of 500 rows or fewer to keep the browser responsive during ZIP creation.",
    ],
    helper: "Everything runs locally in your browser, so refreshing the page clears previews, generated ZIPs, and cached camera captures.",
  },
]

export default function QrToolsPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={qrToolsSeo.structuredData} />
      <QrTools>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">QR Toolkit workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO-friendly playbook to scan, generate, and batch-export QR codes for growth campaigns, packaging, and onsite signage.
                Every step keeps filenames keyword-rich and all processing private inside your browser.
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
      </QrTools>
    </main>
  )
}
