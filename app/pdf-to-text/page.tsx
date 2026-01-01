import type { Metadata } from "next"

import { PdfToTextConverter } from "@/components/pdf-to-text-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToTextSeo from "@/seo/pdf-to-text.json"

export const metadata: Metadata = buildMetadata(pdfToTextSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload PDFs for instant text extraction",
    description: "Start every PDF to text conversion with descriptive filenames and clean previews.",
    steps: [
      "Drag a PDF into the Upload panel or tap to browse. Rename the source file with keyword-rich text like onboarding-guide-2026.pdf before import.",
      "Confirm the preview loads locally in the iframe so you can double-check orientation, page count, and scan quality.",
      "Keep files under 20 MB for the fastest OCR pass. Split giant manuals into sections if needed to preserve responsiveness.",
    ],
    helper: "Scans with dark text on light backgrounds deliver the cleanest extracts for support docs, syllabi, and invoices.",
  },
  {
    title: "Run AI-powered PDF to text extraction",
    description: "Use the GPT-4o pipeline to read multi-page documents without losing structure.",
    steps: [
      "Once uploaded, the extractor automatically sends a secure request to the AI backend and shows a Reading PDF overlay.",
      "Within seconds, the Extracted Text panel fills with the detected content, preserving headings, bullets, and tables for easier editing.",
      "Monitor the status; if an error appears, re-upload a fresh export or flatten problematic fonts before retrying.",
    ],
    helper: "The engine handles contracts, lecture notes, technical specs, and handwritten notes, so one workflow covers every department.",
  },
  {
    title: "Copy, edit, and optimize transcripts for SEO",
    description: "Keep extracted text search-friendly for blogs, LMS modules, and ticket replies.",
    steps: [
      "Use the Copy button to push the cleaned transcript into your clipboard for CMS pasting or CRM updates.",
      "Add headings, alt text, and summary paragraphs directly in your publishing tool so every upload includes keyword-rich context.",
      "Pair transcripts with metadata like author, publish date, and target keywords before publishing to documentation hubs.",
    ],
    helper: "Keep a shared template for alt text and summaries so your team maintains consistent SEO hygiene across releases.",
  },
  {
    title: "Troubleshoot low-confidence extracts",
    description: "Resolve typical PDF OCR issues without leaving the converter.",
    steps: [
      "If characters look garbled, re-export the PDF with embedded fonts or scan at 300 DPI to give the AI more detail.",
      "Rotate sideways documents before uploading—upright text prevents line breaks from scrambling.",
      "Use Clear to reset cached previews when switching between sensitive documents to keep everything private and tidy.",
    ],
    helper: "All processing happens in browser sessions tied to your account, and files are discarded once extraction finishes.",
  },
]

export default function PdfToTextPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToTextSeo.structuredData} />
      <PdfToTextConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF to Text workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized playbook to upload PDFs, run AI extraction, and publish keyword-rich transcripts for blogs, LMS content,
                and support libraries—all without leaving the browser.
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
      </PdfToTextConverter>
    </main>
  )
}
