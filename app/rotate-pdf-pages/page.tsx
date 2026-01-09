import type { Metadata } from "next"

import { PdfRotateConverter } from "@/components/pdf-rotate-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import rotatePdfPagesSeo from "@/seo/rotate-pdf-pages.json"

export const metadata: Metadata = buildMetadata(rotatePdfPagesSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep the document",
    description: "Spot every sideways scan before you start rotating so you can batch the changes.",
    steps: [
      "Scroll through the PDF thumbnails and mark any pages that were scanned in landscape.",
      "Check whether the audience needs portrait or landscape for printouts—sometimes you only rotate select sections.",
      "Capture the slide numbers in a quick list so you can confirm them after exporting.",
    ],
    helper: "If the PDF is protected, unlock it first so the on-device rotation can run.",
  },
  {
    title: "Apply rotations with intent",
    description: "Mix clockwise, counterclockwise, and 180° rotations without leaving the browser.",
    steps: [
      "Use Rotate All only when the entire document was scanned sideways; otherwise target single pages.",
      "Stick to 90° increments so your viewers can still print or annotate without stretching.",
      "Reset all when you want to compare the original orientation before exporting again.",
    ],
    helper: "Share a short note in your changelog describing which sections flipped orientation for audit trails.",
  },
  {
    title: "QA the exported PDF",
    description: "Always preview the updated file so no sideways surprises slip into the final share.",
    steps: [
      "Open the download in a second tab or PDF viewer to confirm rotations saved correctly.",
      "If you rotated just a few slides, jump directly to those page numbers and skim the copy.",
      "Need to stack this with other edits? Run Delete Pages or Rearrange after rotating, then export once at the end.",
    ],
    helper: "Keep the original file in your DMS to restore orientation later if legal or ops needs it.",
  },
  {
    title: "Hand off with context",
    description: "Let reviewers know which sections changed so they update their speaking cues or bookmarks.",
    steps: [
      "Mention the affected page numbers in your email or chat summary.",
      "If the PDF moves downstream to a DRM or e-sign tool, upload the rotated copy to avoid rework.",
      "Archive the exported file with a suffix like -rotated.pdf so teammates can spot the latest version.",
    ],
    helper: "Pair this workflow with Protect PDF Password if only select recipients should open the new version.",
  },
]

export default function RotatePdfPagesPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={rotatePdfPagesSeo.structuredData} />
      <PdfRotateConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Guide to rotating PDF pages without breaking flow</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this checklist to keep investor updates, training packs, or compliance binders readable even when scans arrive sideways.
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
      </PdfRotateConverter>
    </main>
  )
}
