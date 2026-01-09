import type { Metadata } from "next"

import { Base64Tool } from "@/components/base64-tool"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import base64Seo from "@/seo/base64.json"

export const metadata: Metadata = buildMetadata(base64Seo)

export default function Base64Page() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={base64Seo.structuredData} />
      <Base64Tool>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Base64 Encode/Decode workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Encode text to Base64 or decode Base64 back to human‑readable text online. This SEO‑friendly guide covers safe UTF‑8 handling,
                data URL prefixes, and common troubleshooting for copy/paste payloads.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Enter text or Base64",
                  description: "Start with clean input to avoid decoding issues.",
                  steps: [
                    "Paste plain text to Encode, or a Base64 string to Decode.",
                    "The tool automatically strips data URL prefixes like data:text/plain;base64, when decoding.",
                    "Use Sample to see the expected structure before running your own values.",
                  ],
                  helper: "Whitespace is ignored during decoding; long values can include line breaks.",
                },
                {
                  title: "Encode to Base64 (UTF‑8)",
                  description: "Safely convert any text—including emoji and non‑Latin characters—into Base64.",
                  steps: [
                    "Click Encode to transform the input string using UTF‑8, then copy or download the result.",
                    "Use the encoded value in environment variables, headers, or debugging snippets.",
                    "For images or files, consider your browser’s copy limits—very large strings can be unwieldy.",
                  ],
                  helper: "Encoding uses TextEncoder under the hood for cross‑browser consistency.",
                },
                {
                  title: "Decode Base64 to text",
                  description: "Recover human‑readable content from Base64.",
                  steps: [
                    "Paste a Base64 string or an entire data URL and click Decode.",
                    "If the output looks garbled, confirm the original was UTF‑8 text—not a binary file.",
                    "Use Download to save the decoded text as a .txt file.",
                  ],
                  helper: "For binary data (images, PDFs), you’ll need a different tool that reconstructs files from Base64.",
                },
                {
                  title: "Copy & Download",
                  description: "Move results into your IDE, tickets, or docs instantly.",
                  steps: [
                    "Use Copy to place outputs on the clipboard for quick sharing.",
                    "Click Download to save base64-output.txt when you need an artifact for review.",
                    "Reset to clear sensitive values from the UI when finished.",
                  ],
                  helper: "All processing happens locally in the browser—no data leaves your device.",
                },
                {
                  title: "Troubleshooting",
                  description: "Fix common Base64 errors quickly.",
                  steps: [
                    "Ensure your input is text. Binary‑derived Base64 won’t decode to readable characters.",
                    "Remove accidental spaces or URL‑encoded characters (%2B for +, %2F for /).",
                    "Check for truncated strings—Base64 length must be a multiple of 4 (padding with = if needed).",
                  ],
                  helper: "When exchanging values over URLs, use URL‑safe Base64 or URL‑encode the output to preserve + and /.",
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
      </Base64Tool>
    </main>
  )
}
