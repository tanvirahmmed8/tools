import React from "react"

import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

const clauses = [
  {
    title: "License to use TextExtract",
    description:
      "We grant you a revocable, non-transferable license to operate the TextExtract utilities for your own workflows. You may not resell direct access to our hosted tools without a reseller agreement.",
  },
  {
    title: "Acceptable use",
    description:
      "Do not upload content that violates laws, infringes IP, or contains malware. Automated scraping, rate-limit evasion, or attempts to reverse engineer proprietary models are prohibited.",
  },
  {
    title: "Service availability",
    description:
      "We target 99.5% uptime for the hosted suite. Planned maintenance windows are posted on status.textextract.ai at least 24 hours in advance.",
  },
]

export default function TermsAndConditions() {
  return (
    <>
      <SiteNavigation title="TextExtract" />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/30">
          <PageContainer className="py-16 space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Effective January 2026</p>
            <h1 className="text-4xl font-semibold md:text-5xl">TextExtract Terms & Conditions</h1>
            <p className="max-w-3xl text-muted-foreground">
              These terms govern how you access and use the TextExtract OCR, PDF, QR, and barcode utilities. By launching any workspace you
              agree to the rules below.
            </p>
          </PageContainer>
        </section>

        <PageContainer className="py-16 space-y-12">
          <div className="grid gap-6 md:grid-cols-3">
            {clauses.map((clause) => (
              <div key={clause.title} className="rounded-2xl border border-border bg-card/80 p-6">
                <h2 className="text-lg font-semibold">{clause.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{clause.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background/80 p-6">
              <h2 className="text-xl font-semibold">Payment & usage limits</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Paid plans are billed monthly in USD. Usage resets every billing cycle; unused conversions do not roll over. If you exceed
                your plan we will pause jobs until an upgrade or add-on is purchased.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6">
              <h2 className="text-xl font-semibold">Dispute resolution</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                For any dispute please email legal@textextract.ai. We will first attempt mediation; if unresolved, claims will be handled
                in the courts of Singapore under Singapore law.
              </p>
            </div>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  )
}
