import type { Metadata } from "next"

import { ImageToTextConverter } from "@/components/image-to-text-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageToTextSeo from "@/seo/image-to-text.json"

export const metadata: Metadata = buildMetadata(imageToTextSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload images to the OCR workspace",
    description: "Start every image to text conversion with crisp uploads and keyword-friendly filenames.",
    steps: [
      "Open the online image to text converter and drag PNG, JPG, or screenshot files into the Drop Zone, or tap to browse from camera roll or desktop.",
      "Wait for the preview to render inside the GlowCard so you can double-check orientation, handwriting legibility, and lighting.",
      "Rename source files with descriptive slugs (invoice-2024-jan.jpg) so downloaded transcripts inherit SEO-ready context for CMS or CRM uploads.",
    ],
    helper: "Well-lit scans with dark text on light backgrounds deliver the highest OCR accuracy for receipts, worksheets, and forms.",
  },
  {
    title: "Extract text with AI-powered OCR",
    description: "Convert any image into editable text using the TextExtract AI vision pipeline.",
    steps: [
      "Click or drop your image; the tool automatically sends a secure request to the AI OCR engine (powered by GPT-4o vision).",
      "Watch the Extracting text overlay—most uploads convert in under five seconds, even for multi-language documents.",
      "Review the Extracted Text panel for preserved line breaks, bullet points, and monospaced formatting ideal for code snippets or invoices.",
    ],
    helper: "The AI handles printed fonts, handwriting, whiteboard notes, and UI screenshots, making it a versatile online OCR solution.",
  },
  {
    title: "Copy, edit, and repurpose transcripts",
    description: "Keep everything SEO-friendly by pairing extracted copy with descriptive alt text and metadata.",
    steps: [
      "Use the Copy button to push the entire transcript to the clipboard for CMS pasting, support tickets, or CRM notes.",
      "Clean up line breaks or add markdown headings directly in the text area before exporting to knowledge bases or docs.",
      "Pair each transcript with alt text and keyword-rich summaries to improve accessibility and search rankings for blog posts or media libraries.",
    ],
    helper: "Set a 2-minute review loop to proof high-stakes extracts (legal paperwork, contracts) before publishing.",
  },
  {
    title: "Troubleshoot OCR accuracy issues",
    description: "Solve low-confidence scans and keep the AI image to text converter running at peak quality.",
    steps: [
      "If results look noisy, retake the photo with better contrast or crop the image so only the text region remains.",
      "Rotate sideways photos before uploading—upright text helps the OCR engine avoid misreads and garbled characters.",
      "Clear the session and re-upload when switching between handwriting, receipts, and UI screenshots to keep memory clean.",
    ],
    helper: "Everything happens in the browser; refreshing wipes previews and transcripts but never stores sensitive files on a server.",
  },
]

export default function ImageToTextPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageToTextSeo.structuredData} />
      <ImageToTextConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Image to Text converter playbook</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO-optimized workflow to master TextExtract's online OCR. Upload any image, run AI-powered extraction, and ship
                keyword-rich transcripts for ecommerce, documentation, and accessibility updates without leaving the browser.
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
      </ImageToTextConverter>
    </main>
  )
}
