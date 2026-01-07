import React from "react"

import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

const storySections = [
  {
    title: "Our mission",
    body:
      "TextExtract exists so research teams, operators, and analysts can turn messy PDFs or screenshots into structured data without exposing sensitive content to third-party servers.",
  },
  {
    title: "Who we serve",
    body:
      "We build for compliance-heavy organizations that move fast: venture diligence teams, healthcare ops, logistics providers, and product teams publishing internal handbooks.",
  },
  {
    title: "Why browser-first",
    body:
      "Keeping processing inside the browser means no waiting on queues, no data residency surprises, and no awkward security reviews. Your files leave the device only when you decide to share the output.",
  },
]

const timeline = [
  {
    heading: "2023 — Prototype",
    copy: "Shipped the first combined OCR and PDF conversion workspace for a private beta of 40 analysts handling compliance audits.",
  },
  {
    heading: "2024 — Automation layer",
    copy: "Added batch pipelines, CSV-driven barcode generation, and webhooks so customers could bolt TextExtract onto existing workflows.",
  },
  {
    heading: "2025 — Privacy upgrades",
    copy: "Rolled out on-device rendering, self-destructing workers, and granular audit trails to satisfy banking and healthcare reviews.",
  },
]

const values = [
  {
    title: "Privacy is a feature",
    description:
      "Ephemeral processing, transparent telemetry controls, and zero surprise uploads keep procurement teams confident in every rollout.",
  },
  {
    title: "Speed helps adoption",
    description:
      "Clean UI shortcuts, reusable presets, and predictable outputs keep ops teams from bouncing back to manual exports or screenshots.",
  },
  {
    title: "Humans stay in control",
    description:
      "AI assists with extraction, but humans decide what gets published, shared, or transformed. We design every tool around that principle.",
  },
]

export default function AboutUsPage() {
  return (
    <>
      <SiteNavigation title="TextExtract" />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/30">
          <PageContainer className="py-16 space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Built for operators</p>
            <h1 className="text-4xl font-semibold md:text-5xl">Meet the team behind TextExtract</h1>
            <p className="max-w-3xl text-muted-foreground">
              We are a focused group of engineers, designers, and workflow specialists building privacy-first conversion tools for
              teams that cannot afford to leak sensitive files. Here is how we got here.
            </p>
          </PageContainer>
        </section>

        <PageContainer className="py-16 space-y-12">
          <div className="grid gap-6 md:grid-cols-3">
            {storySections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border bg-card/80 p-6">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6">
            <h2 className="text-xl font-semibold">Milestones</h2>
            <div className="mt-6 space-y-5">
              {timeline.map((item) => (
                <div key={item.heading} className="rounded-xl border border-border/70 bg-card/70 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{item.heading}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-card/80 p-6">
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  )
}
