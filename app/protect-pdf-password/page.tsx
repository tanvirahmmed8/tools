import type { Metadata } from "next"

import { PdfPasswordProtector } from "@/components/pdf-password-protector"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import protectPdfPasswordSeo from "@/seo/protect-pdf-password.json"

export const metadata: Metadata = buildMetadata(protectPdfPasswordSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep the PDF before locking it",
    description: "Clean up metadata, confirm page order, and save a backup copy before encryption.",
    steps: [
      "Rename the file with a descriptor like q3-roadmap-protect.pdf so recipients know the version they are opening.",
      "Make last-minute edits now—many viewers will block editing after you enable password protection.",
      "Export an unsecured archive copy so your team can re-encrypt it with different permissions later.",
    ],
    helper: "Password-protected PDFs cannot be previewed in some browser tabs, so add context to your share message.",
  },
  {
    title: "Set the right password tiers",
    description: "Decide who needs to open the file and who can change permissions down the road.",
    steps: [
      "Use unique open passwords per client or stakeholder group to keep sharing traceable.",
      "Store owner passwords in a secrets manager; they override every restriction and should be tightly controlled.",
      "Avoid dictionary words or project names. Mix upper/lowercase, numbers, and a symbol for best results.",
    ],
    helper: "Send the open password via a different channel (chat, SMS) so intercepted emails stay useless.",
  },
  {
    title: "Dial in granular permissions",
    description: "Decide whether viewers can print, copy, or annotate before generating the protected file.",
    steps: [
      "Disable copying when you're sharing pricing tables or confidential narrative slides.",
      "Keep printing on for executive briefings that need in-room review but toggle copying off.",
      "Enable annotations when legal teams must mark up drafts without unlocking the original asset.",
    ],
    helper: "Permissions can differ per delivery. Use the clipboard shortcut in the tool to paste settings into your brief.",
  },
  {
    title: "Troubleshoot recipient issues",
    description: "Most viewing errors boil down to mismatched passwords or unsupported readers.",
    steps: [
      "Confirm teammates are using a desktop PDF reader—mobile previews sometimes ignore owner permissions.",
      "If someone cannot open the file, regenerate it and verify you're sharing the latest password pair.",
      "Keep the service download link handy; it expires quickly, so host final files in your DMS.",
    ],
    helper: "Log which recipients received each password in case compliance needs an audit trail later.",
  },
]

export default function ProtectPdfPasswordPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={protectPdfPasswordSeo.structuredData} />
      <PdfPasswordProtector>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Playbook for password-protecting PDFs</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this checklist to lock PDFs without derailing collaboration. You will get cleaner naming, confident key handling, and troubleshooting tips your ops partners can reuse.
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
      </PdfPasswordProtector>
    </main>
  )
}
