import React from "react"

import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

const policySections = [
  {
    title: "What we collect",
    body:
      "When you upload files into TextExtract we process them ephemerally in memory. We store basic telemetry (browser, feature used, duration) to detect abuse and improve performance. No file contents or extracted text are persisted after the browser tab closes.",
  },
  {
    title: "How processing works",
    body:
      "Image and PDF jobs are handled by isolated workers hosted in the same region as your browser session. Workers only keep files for the lifetime of the request. If you opt in to autosave, results are encrypted at rest using customer-managed keys.",
  },
  {
    title: "Third-party services",
    body:
      "We rely on Vercel for hosting, Upstash for rate limiting, and Sentry for crash reports. These vendors see IP addresses and request metadata but never receive uploaded files or extracted text.",
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <SiteNavigation title="TextExtract" />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/30">
          <PageContainer className="py-16 space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Updated January 2026</p>
            <h1 className="text-4xl font-semibold md:text-5xl">TextExtract Privacy Policy</h1>
            <p className="max-w-3xl text-muted-foreground">
              We built TextExtract so sensitive decks, invoices, or lab notes never have to leave your browser. This policy explains what
              information we do (and do not) collect when you use our OCR, conversion, and barcode tools.
            </p>
          </PageContainer>
        </section>

        <PageContainer className="py-16 space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            {policySections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border bg-card/80 p-6">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6 space-y-4">
            <h2 className="text-xl font-semibold">Your choices</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Disable telemetry entirely via the “Privacy first” toggle inside Settings → Privacy.</li>
              <li>Request a signed data-processing agreement by emailing security@textextract.ai.</li>
              <li>Export an audit trail showing who ran each conversion in your workspace.</li>
            </ul>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  )
}
