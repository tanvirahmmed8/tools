import React from "react"

import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

const disclaimerPoints = [
  {
    title: "No legal or compliance advice",
    body:
      "Outputs from TextExtract are generated for informational use only. They do not constitute legal, financial, or regulatory advice and should be reviewed by qualified professionals before distribution.",
  },
  {
    title: "You control your data",
    body:
      "Uploaded files stay in your browser session unless you choose to export or share them. Always verify downloaded results before forwarding them to colleagues, clients, or partners.",
  },
  {
    title: "Third-party assets",
    body:
      "When you import fonts, images, or PDFs that belong to third parties, make sure you have the rights to process and share that content. TextExtract assumes you obtained the proper permissions.",
  },
]

const responsibilities = [
  "Confirm that generated text, barcodes, or conversions meet the accuracy thresholds required by your organization.",
  "Maintain backups of critical documents before running destructive edits or automated pipelines.",
  "Follow local laws and corporate policies when processing personal data, health records, or financial statements.",
]

const contactOptions = [
  {
    label: "Security inquiries",
    email: "security@textextract.ai",
  },
  {
    label: "Compliance reviews",
    email: "compliance@textextract.ai",
  },
  {
    label: "General support",
    email: "support@textextract.ai",
  },
]

export default function DisclaimerPage() {
  return (
    <>
      <SiteNavigation title="TextExtract" />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/30">
          <PageContainer className="py-16 space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Transparency first</p>
            <h1 className="text-4xl font-semibold md:text-5xl">TextExtract service disclaimer</h1>
            <p className="max-w-3xl text-muted-foreground">
              Please read this disclaimer carefully before using TextExtract products. Using the suite means you accept these conditions and
              understand your responsibilities when processing sensitive documents.
            </p>
          </PageContainer>
        </section>

        <PageContainer className="py-16 space-y-12">
          <div className="grid gap-6 md:grid-cols-3">
            {disclaimerPoints.map((point) => (
              <div key={point.title} className="rounded-2xl border border-border bg-card/80 p-6">
                <h2 className="text-lg font-semibold">{point.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{point.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6">
            <h2 className="text-xl font-semibold">Your responsibilities</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
              {responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card/80 p-6">
            <h2 className="text-lg font-semibold">Questions?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you have concerns about data handling, acceptable use, or security practices, reach out to our team. We respond within
              one business day and can provide supporting documentation for audits.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {contactOptions.map((option) => (
                <div key={option.email} className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{option.label}</p>
                  <a href={`mailto:${option.email}`} className="mt-2 block text-sm font-medium text-primary underline-offset-4 hover:underline">
                    {option.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  )
}
