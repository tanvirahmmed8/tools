import type { Metadata } from "next"

import { PdfCompressConverter } from "@/components/pdf-compress-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import homeSeo from "@/seo/home.json"

export const metadata: Metadata = buildMetadata(homeSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload PDF files up to 20 MB",
    description: "Start every compression workflow with a local preview and SEO-friendly filenames.",
    steps: [
      "Drag a PDF into the upload area or click to browse from your desktop, Google Drive download, or email attachment.",
      "Confirm the filename and size appear under Upload PDF; rename the source file with keywords like q4-board-report.pdf for better organization.",
      "Use the inline preview (never uploaded to a server) to verify orientation, page count, and embedded images before you optimize.",
    ],
    helper: "Staying under 20 MB keeps browser compression snappy even on lower-powered laptops.",
  },
  {
    title: "Compress PDFs with one click",
    description: "Shrink decks, invoices, and manuals without leaving the browser.",
    steps: [
      "Hit Compress PDF to trigger the client-side compression pipeline powered by pdf-lib.",
      "Watch the status card; once the spinner stops, you will see a success notice and a new filename like compressed-2026-01-02.pdf.",
      "If compression fails, double-check the file is a standard PDF and try again—password-protected or corrupted files are the usual blockers.",
    ],
    helper: "Compression focuses on object streams and metadata cleanup. For heavy image recompression, run the file through an external optimizer first, then finalize it here.",
  },
  {
    title: "Download and share lighter PDFs",
    description: "Deliver optimized documents to email, LMS, CRM, or client portals.",
    steps: [
      "Click Download PDF to save the compressed file locally using the auto-generated filename.",
      "Drop the smaller PDF into email replies, Slack threads, or ticketing systems without hitting attachment limits.",
      "Archive both the original and compressed versions in Drive, SharePoint, or Dropbox so you can revert if a stakeholder needs full quality.",
    ],
    helper: "Keep filenames lowercase, hyphenated, and keyword-rich (marketing-plan-2026-compressed.pdf) to boost search visibility across DAMs.",
  },
  {
    title: "Troubleshoot quality and privacy",
    description: "Maintain clarity while staying compliant with in-browser processing.",
    steps: [
      "If text looks fuzzy after compression, re-export the source PDF with vector fonts enabled or split large PDFs into smaller sections.",
      "For extremely image-heavy decks, combine this tool with a PDF image optimizer or downscale images before exporting the original deck.",
      "Need to wipe everything? Tap Clear to remove previews and cached blobs instantly—no data ever leaves your browser.",
    ],
    helper: "All compression happens locally, which satisfies privacy policies for HR docs, medical forms, and financial reports.",
  },
]

export default function PdfCompressPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={homeSeo.structuredData} />
      <PdfCompressConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF compression workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized playbook to upload, compress, and distribute lightweight PDFs for sales decks, proposals, and onboarding packets.
                Everything runs in-browser, so sensitive documents stay private while remaining email-friendly and search-ready.
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
      </PdfCompressConverter>
    </main>
  )
}
