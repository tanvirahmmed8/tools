import type { Metadata } from "next"

import { PdfRearrangeConverter } from "@/components/pdf-rearrange-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import rearrangePdfPagesSeo from "@/seo/rearrange-pdf-pages.json"

export const metadata: Metadata = buildMetadata(rearrangePdfPagesSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Audit the storyline first",
    description: "Confirm how the narrative should unfold before you begin dragging pages around.",
    steps: [
      "Skim page thumbnails in your PDF viewer and jot the sections that feel out of place.",
      "Note the target order on paper or in a doc so you can compare after exporting.",
      "Flag non-negotiable sections (legal, appendix) that must stay grouped even if they move.",
    ],
    helper: "If the deck is still changing, lock a version number in the filename before you reorder anything.",
  },
  {
    title: "Drag with intention",
    description: "Use named sequences so reviewers understand why the order shifted.",
    steps: [
      "Batch slides by narrative zone (setup, insight, plan) before dragging to minimize back-and-forth.",
      "When moving executive summaries to the front, keep supporting data close so questions are easy to answer.",
      "Reserve the last few slots for appendix or troubleshooting slides that can be skipped live.",
    ],
    helper: "Tell stakeholders which slide numbers changed so they can update speaker notes quickly.",
  },
  {
    title: "Validate the exported PDF",
    description: "Never ship a rearranged doc without skimming it start to finish.",
    steps: [
      "Open the downloaded PDF in a fresh viewer (or browser tab) to catch caching issues.",
      "Check the page order list in the tool — it should match the agenda you wrote earlier.",
      "If the file is larger than expected, run it through PDF Compress before sending externally.",
    ],
    helper: "Store the original order in your DMS so you can revert instantly if leadership changes direction.",
  },
  {
    title: "Share context with recipients",
    description: "A quick note prevents people from referencing old slide numbers.",
    steps: [
      "List the new sections or page ranges in your email or chat summary.",
      "If you locked the PDF afterwards, include the password (delivered via a separate channel).",
      "Highlight any slides that moved to backup so presenters know what to skip live.",
    ],
    helper: "Add a changelog line to your project tracker so others know the deck was resequenced.",
  },
]

export default function RearrangePdfPagesPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={rearrangePdfPagesSeo.structuredData} />
      <PdfRearrangeConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Checklist for resequencing PDF pages</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Keep cross-functional teams aligned when you rescript presentations. This field guide covers planning, drag-and-drop best practices, QA, and stakeholder messaging.
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
      </PdfRearrangeConverter>
    </main>
  )
}
