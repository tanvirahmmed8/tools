import type { Metadata } from "next"

import { PdfUnlockConverter } from "@/components/pdf-unlock-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import unlockPdfSeo from "@/seo/unlock-pdf.json"

export const metadata: Metadata = buildMetadata(unlockPdfSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Identify why you are unlocking",
    description: "Knowing the downstream workflow helps you decide whether to keep, rotate, or re-lock later.",
    steps: [
      "List the systems that reject locked PDFs (OCR, printers, signing portals, archives).",
      "Confirm that compliance or legal teams approve removing the password for this specific use case.",
      "Decide whether you will reapply a new password before shipping externally.",
    ],
    helper: "If you just need temporary access, delete the unlocked copy once the automation finishes running.",
  },
  {
    title: "Gather the right password",
    description: "The tool removes passwords only when you already know the existing open credential.",
    steps: [
      "Pull the latest password from your vault or status sheet to avoid trial-and-error.",
      "Double-check case sensitivity—typos are the most common failure mode for unlock workflows.",
      "Have a fallback owner who can reissue credentials if you are still blocked.",
    ],
    helper: "The password never leaves the browser, but keep it out of screen recordings or live demos.",
  },
  {
    title: "Unlock and test",
    description: "Always verify the exported file before sharing or feeding it into another system.",
    steps: [
      "Open the unlocked PDF in a fresh tab to confirm it no longer requests a password.",
      "If you plan to run OCR or parsing, drag the unlocked file into those workspaces immediately.",
      "Rename the file with a suffix like -unlocked.pdf so teammates know which version is safe for tooling.",
    ],
    helper: "Consider pairing the unlocked copy with a Protect PDF Password run that uses a shared client credential.",
  },
  {
    title: "Communicate version changes",
    description: "Let stakeholders know you removed the password so they update their processes accordingly.",
    steps: [
      "Add a line to your project tracker or changelog describing why the PDF was unlocked.",
      "If third parties receive the file, remind them not to forward the unlocked copy unless authorized.",
      "For regulated content, archive both locked and unlocked versions in your DMS with timestamps.",
    ],
    helper: "Store audit notes about who requested the unlock so compliance reviews are painless later.",
  },
]

export default function UnlockPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={unlockPdfSeo.structuredData} />
      <PdfUnlockConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Protocol for removing PDF passwords safely</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                This playbook keeps ops, compliance, and automation teams aligned whenever you need to decrypt a PDF for tooling or delivery.
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
      </PdfUnlockConverter>
    </main>
  )
}
