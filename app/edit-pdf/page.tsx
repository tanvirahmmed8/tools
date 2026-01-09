import type { Metadata } from "next"

import { PdfVisualEditor } from "@/components/pdf-visual-editor"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import editPdfSeo from "@/seo/edit-pdf.json"

export const metadata: Metadata = buildMetadata(editPdfSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep and upload your PDF",
    description: "Give the source document a clear filename and confirm page orientation before adding edits.",
    steps: [
      "Rename the PDF with descriptive context (e.g., partner-brief-q2.pdf) so the exported file is easy to track.",
      "Drag the file into the uploader or tap to browse. The tool validates PDFs up to 20 MB for snappy processing.",
      "If you need to trim, rotate, or unlock the file first, use the companion tools, then return here once the layout looks right.",
    ],
    helper: "A short, keyword-friendly filename makes it easier for sales, legal, and ops teams to locate the right revision later.",
  },
  {
    title: "Layer text blocks exactly where you need them",
    description: "Stack multiple annotations across pages and control placement, color, and typography.",
    steps: [
      "Use Add block to create callouts for different sections—headers, disclaimers, sign-offs, or timestamps.",
      "Pick the page number, choose top/middle/bottom placement, then fine-tune alignment and font size for legibility.",
      "Dial in brand-safe colors using the preset swatches or the custom color picker to match existing design systems.",
    ],
    helper: "Keep copy tight—short, skimmable lines stay crisp when exported back to PDF.",
  },
  {
    title: "Refresh PDF metadata before sharing",
    description: "Update the document title and author fields so cloud drives and search results stay accurate.",
    steps: [
      "Add a human-readable Title that surfaces in corporate drives, knowledge bases, or CRM document previews.",
      "Fill in the Author field with the team name or owner so recipients instantly understand custody.",
      "Leave either field blank if you prefer to keep the existing metadata; the editor only overwrites what you specify.",
    ],
    helper: "Consistent metadata improves discoverability across Google Drive, Notion, and SharePoint.",
  },
  {
    title: "Export, verify, and deliver",
    description: "Download the edited PDF and keep an audit trail of what changed.",
    steps: [
      "Click Export edits to apply every text block in one pass. Processing happens on-device for speed and privacy.",
      "Use the Download PDF button to save the new file. The filename includes an edited timestamp so you can track versions.",
      "Review the output in your PDF viewer. Combine it with Rotate, Delete Pages, or Unlock if stakeholders need further tweaks.",
    ],
    helper: "Store a copy of the old version in your project folder so you can compare revisions at a glance.",
  },
]

export default function EditPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={editPdfSeo.structuredData} />
      <PdfVisualEditor>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Edit PDF workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this playbook to prepare annotated PDFs in under five minutes—perfect for approvals, compliance headers, or deal handoffs without spinning up desktop software.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {manualSections.map((section) => (
                <article key={section.title} className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
                  <header>
                    <h3 className="text-xl font-semibold text-foreground">{section.title}</h3>
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
      </PdfVisualEditor>
    </main>
  )
}
