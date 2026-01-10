import type { Metadata } from "next"

import { WhatsAppQrGenerator } from "@/components/whatsapp-qr-generator"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import whatsappQrSeo from "@/seo/whatsapp-qr-generator.json"

export const metadata: Metadata = buildMetadata(whatsappQrSeo)

export default function WhatsAppQrGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={whatsappQrSeo.structuredData} />
      <WhatsAppQrGenerator>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">WhatsApp QR Code Generator workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Create WhatsApp QR codes that open chats to a phone number with a pre‑filled message. This SEO‑friendly guide covers number
                formatting, message encoding, printing best practices, and common troubleshooting.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Enter the phone number in international format",
                  description: "Use your full country code so WhatsApp routes correctly.",
                  steps: [
                    "Type the phone number with country code (e.g., +8801XXXXXXXXX).",
                    "Remove spaces and punctuation; the generator keeps only digits for wa.me.",
                    "For testing, open the link below the form to confirm it launches WhatsApp.",
                  ],
                  helper: "Numbers must include country code—local formats without country code may fail on some devices.",
                },
                {
                  title: "Add an optional pre‑filled message",
                  description: "Save recipients time and standardize outreach.",
                  steps: [
                    "Write a short, friendly message; the tool URL‑encodes it automatically.",
                    "Keep messages concise for small QR prints and fast loading.",
                    "Use placeholders (like your name or order ID) if you plan to print multiple variants.",
                  ],
                  helper: "Avoid long URLs or tracking parameters—smaller codes scan more reliably.",
                },
                {
                  title: "Generate, copy, and download",
                  description: "Get a shareable PNG and a clickable wa.me link.",
                  steps: [
                    "Click Generate QR to render a 480px PNG; preview updates instantly.",
                    "Use Copy link to place the wa.me URL on your clipboard.",
                    "Download PNG to add the code to flyers, business cards, or emails.",
                  ],
                  helper: "High‑contrast (black on white) codes produce the most reliable scans.",
                },
                {
                  title: "Printing & placement tips",
                  description: "Make QR scans effortless in the real world.",
                  steps: [
                    "Print at least 2–3 cm (≈1 in) wide; increase size for posters or storefronts.",
                    "Place codes where lighting is good and phones can approach straight‑on.",
                    "Avoid glossy laminates that create glare; matte finishes scan better.",
                  ],
                  helper: "Test with both iOS and Android; some camera apps cache failed scans.",
                },
                {
                  title: "Troubleshooting",
                  description: "Fix common WhatsApp QR issues quickly.",
                  steps: [
                    "Blank chat or error page: verify the number includes country code and is active on WhatsApp.",
                    "Message not appearing: ensure the text is short and contains only standard characters.",
                    "Slow to scan: increase code size, boost contrast, or shorten the message.",
                  ],
                  helper: "When in doubt, share the wa.me link directly via chat or SMS.",
                },
              ].map((section) => (
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
                  <p className="mt-4 rounded-md border border-dashed border-border/80 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    {section.helper}
                  </p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </WhatsAppQrGenerator>
    </main>
  )
}
