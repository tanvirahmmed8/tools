import type { Metadata } from "next"

import { PdfSignConverter } from "@/components/pdf-sign-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import signPdfSeo from "@/seo/sign-pdf.json"

export const metadata: Metadata = buildMetadata(signPdfSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep the contract before signing",
    description: "Confirm the PDF layout is final so every signature lands on the correct page.",
    steps: [
      "Rename the file with the deal name and version (e.g., msa-acme-v3.pdf) before importing it into the tool.",
      "Check orientation, page count, and blank pages. Use Rotate or Delete Pages if anything looks off.",
      "If the document is password-protected, unlock it first so the signer can embed the new layer.",
    ],
    helper: "Working with procurement? Keep a clean folder containing both unsigned and signed revisions for compliance.",
  },
  {
    title: "Capture or import a signature",
    description: "Use the built-in canvas for hand-written signatures or upload a transparent PNG.",
    steps: [
      "Draw with a trackpad, mouse, or stylus. The pad exports crisp, transparent strokes for top-quality overlays.",
      "Prefer a pre-approved mark? Import a PNG/JPG scan and preview it before applying.",
      "Adjust the width slider so signatures remain legible while matching the document style guide.",
    ],
    helper: "Transparent PNGs keep underlying text visible, making audits easier for finance and legal teams.",
  },
  {
    title: "Position the signature on the right page",
    description: "Choose the exact page plus vertical and horizontal anchors.",
    steps: [
      "Enter the page number that contains the signature block or acceptance language.",
      "Use the vertical (top/middle/bottom) and horizontal (left/center/right) controls to snap the signature in place.",
      "Set metadata like signer name and reason so cloud drives and CRMs surface the right context.",
    ],
    helper: "Need more granular placement? Apply the signature, review, then switch to Edit PDF for additional annotations.",
  },
  {
    title: "Export, verify, and share",
    description: "Finish the workflow without leaving the browser.",
    steps: [
      "Click Apply signature to bake the ink into the PDF. Processing stays local for speed and privacy.",
      "Download the new file with the auto-generated timestamped name to keep a clean audit trail.",
      "Preview the document in your preferred PDF viewer, then route it to DocuSign, email, or storage.",
    ],
    helper: "Pair this step with your playbook for notifying stakeholders once signatures land in the shared drive.",
  },
]

export default function SignPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={signPdfSeo.structuredData} />
      <PdfSignConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Sign PDF workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Plug this checklist into your approvals process to gather quick signatures, publish revisions, and keep compliance teams informed without downloading heavy desktop software.
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
      </PdfSignConverter>
    </main>
  )
}
