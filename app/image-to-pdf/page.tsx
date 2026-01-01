import type { Metadata } from "next"

import { ImageToPdfConverter } from "@/components/image-to-pdf-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageToPdfSeo from "@/seo/image-to-pdf.json"

export const metadata: Metadata = buildMetadata(imageToPdfSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload PNG or JPG images",
    description: "Kick off the image to PDF workflow with lossless previews and SEO-friendly file ordering.",
    steps: [
      "Launch the online image to PDF converter, drag PNGs/JPGs into the upload panel, or click to browse from desktop, phone, or cloud storage.",
      "Wait for each thumbnail preview; the tool auto-generates filenames so you can track slides, receipts, or product shots.",
      "Use Clear when you want to start fresh—perfect for bulk scan sessions or weekly invoice consolidations.",
    ],
    helper: "Higher-resolution inputs (at least 150 DPI) produce sharper PDFs for print, audits, and legal archives.",
  },
  {
    title: "Arrange images for multi-page PDFs",
    description: "Control the reading order before exporting to a single PDF file.",
    steps: [
      "Scroll through the Order list to verify every thumbnail is present and legible before conversion.",
      "Use Move Up/Down arrows to reorganize images so hero shots, receipts, or worksheet pages flow properly.",
      "Remove duplicates or low-quality uploads to keep the final PDF lean and easy to share via email or LMS.",
    ],
    helper: "Set descriptive source filenames (like lesson-plan-01.jpg) so the PDF inherits keyword-rich metadata after conversion.",
  },
  {
    title: "Convert images to PDF online",
    description: "Generate a combined PDF in seconds—all processing happens in your browser for privacy.",
    steps: [
      "Hit Create PDF; the converter turns every PNG/JPG into a vector-compatible PDF without compression surprises.",
      "Watch the Conversion Status card—once it shows 'Conversion complete', the download card unlocks automatically.",
      "If an error appears, ensure every file is PNG or JPG, then re-run the conversion. Mixed formats or corrupted uploads are the common culprits.",
    ],
    helper: "Since the tool stays client-side, refreshing the page clears cached thumbnails and frees up memory instantly.",
  },
  {
    title: "Download and share the PDF",
    description: "Save the combined file with SEO-friendly naming for LMS, CRM, or cloud storage uploads.",
    steps: [
      "Click Download PDF to store the merged document locally with the auto-generated name (for example receipts-2024-01.pdf).",
      "Share or email the PDF without re-uploading images—ideal for teachers, accountants, and ecommerce returns teams.",
      "Need another version? Reorder the list or add new scans, then run Create PDF again without leaving the page.",
    ],
    helper: "Keep PDF names short, keyword-focused, and lowercase to maximize compatibility with SharePoint, Drive, Dropbox, and DAM systems.",
  },
]

export default function ImageToPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageToPdfSeo.structuredData} />
      <ImageToPdfConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Image to PDF workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized guide to master the PNG/JPG to PDF converter, multi-page ordering, and instant download flow.
                Each step keeps your scans lightweight, keyword-rich, and ready for LMS, CRM, onboarding, and invoice archives.
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
      </ImageToPdfConverter>
    </main>
  )
}
