import React from "react"

import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

export default function Contact() {
  return (
    <>
      <SiteNavigation title="TextExtract" />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-muted/30">
          <PageContainer className="py-16 space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Need a hand?</p>
            <h1 className="text-4xl font-semibold md:text-5xl">Talk with the TextExtract team</h1>
            <p className="max-w-3xl text-muted-foreground">
              Whether you are debugging an OCR run, requesting a feature, or preparing a security review, we respond within one business
              day. Share as much detail as you can so we can replicate your workspace setup.
            </p>
          </PageContainer>
        </section>

        <PageContainer className="py-16 space-y-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/80 p-6">
              <h2 className="text-xl font-semibold">Product & support</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Send logs, screenshots, or the file you are processing so we can reproduce the issue on our internal TextExtract suite.
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-medium text-foreground">Email</p>
                <a href="mailto:support@textextract.ai" className="text-primary underline-offset-4 hover:underline">
                  support@textextract.ai
                </a>
                <p className="text-muted-foreground">Support hours: Monday–Friday, 9am–6pm UTC</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/80 p-6">
              <h2 className="text-xl font-semibold">Sales & partnerships</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Need higher rate limits, dedicated OCR workers, or an embedded toolkit? Let us know how many operators you expect.
              </p>
              <div className="mt-4 space-y-1 text-sm">
                <p className="font-medium text-foreground">Email</p>
                <a href="mailto:partners@textextract.ai" className="text-primary underline-offset-4 hover:underline">
                  partners@textextract.ai
                </a>
                <p className="text-muted-foreground">Enterprise responses within 24 hours.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-6">
            <h2 className="text-lg font-semibold">Status & community</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to <a href="https://status.textextract.ai" className="text-primary underline-offset-4 hover:underline">status.textextract.ai</a> for uptime alerts. Join our private Slack if you need shared channels for shipping research drops or automation scripts.
            </p>
          </div>
        </PageContainer>
      </main>
      <SiteFooter />
    </>
  )
}
