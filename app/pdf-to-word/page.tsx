import type { Metadata } from "next"

import { PdfToWordConverter } from "@/components/pdf-to-word-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToWordSeo from "@/seo/pdf-to-word.json"

export const metadata: Metadata = buildMetadata(pdfToWordSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload PDFs for Word conversion",
    description: "Start every PDF to DOCX workflow with clean previews and descriptive filenames.",
    steps: [
      "Drag your PDF into the Upload panel or tap to browse. Rename the source file with keywords like brand-style-guide.pdf before converting.",
      "Verify the inline preview loads locally so you can confirm page count, orientation, and color accuracy.",
      "Keep files under 20 MB for faster processing. Split massive brochures into smaller chunks if you see slowdowns.",
    ],
    helper: "Exporting the original PDF at 150–300 DPI ensures the Word output retains sharp imagery and typography.",
  },
  {
    title: "Convert PDF to Word with layout fidelity",
    description: "Run the docx pipeline that preserves page design while surfacing editable text.",
    steps: [
      "Click Convert to Word; the tool renders each PDF page into high-resolution canvases inside a DOCX shell.",
      "Watch the Conversion status card—once the spinner stops, you’ll see confirmation plus a note about how many pages rendered.",
      "If an error occurs, ensure the PDF isn’t password protected and try exporting a fresh copy from your design tool or scanner.",
    ],
    helper: "The converter keeps layout exact, while the text preview gives you copy you can quickly edit or translate.",
  },
  {
    title: "Download DOCX files and copy text",
    description: "Deliver editable files to clients, legal teams, or LMS platforms.",
    steps: [
      "Use Download .docx to grab the converted file with a descriptive name like pitch-deck-2026.docx.",
      "Share the Word file via email, Slack, or SharePoint without worrying about PDF viewers on the recipient side.",
      "Need just the copy? Use the text preview panel and Copy button to grab the extracted content for CMS or CRM updates.",
    ],
    helper: "Store both the original PDF and the new DOCX in your DAM so creative teams can trace changes over time.",
  },
  {
    title: "Troubleshoot conversion hiccups",
    description: "Solve common PDF-to-Word issues without leaving the browser.",
    steps: [
      "If colors look off, ensure your PDF uses sRGB assets; re-export from InDesign or Figma with RGB settings enabled.",
      "When handwriting or annotations vanish, flatten the PDF layers before uploading so they’re baked into each page.",
      "Use Clear to reset cached previews when processing multiple documents in a row—this frees memory and avoids mix-ups.",
    ],
    helper: "All conversions run server-side but the files are discarded right after processing, keeping sensitive decks secure.",
  },
]

export default function PdfToWordPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToWordSeo.structuredData} />
      <PdfToWordConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF to Word workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized playbook to upload PDFs, convert them into pixel-perfect DOCX files, and export editable text for blogs,
                legal reviews, and brand kits—all without leaving the browser.
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
      </PdfToWordConverter>
    </main>
  )
}
