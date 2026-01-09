import type { Metadata } from "next"

import { UrlEncodeDecode } from "@/components/url-encode-decode"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import urlEncodeDecodeSeo from "@/seo/url-encode-decode.json"

export const metadata: Metadata = buildMetadata(urlEncodeDecodeSeo)

export default function UrlEncodeDecodePage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={urlEncodeDecodeSeo.structuredData} />
      <UrlEncodeDecode>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">URL Encode/Decode workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly guide to encode URI components or full URLs, handle + for spaces, and fix common decoding problems.
                Perfect for query strings, webhooks, and API clients that expect percent‑encoding.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Choose mode: component vs. full URL",
                  description: "Pick the right encoder for the job.",
                  steps: [
                    "Use Component (encodeURIComponent) for query values, path segments, and form fields.",
                    "Use Full URL (encodeURI) to keep reserved characters like : / ? # & intact in the base URL.",
                    "Toggle + for spaces when your system expects application/x-www-form-urlencoded semantics.",
                  ],
                  helper: "Most bugs come from using encodeURI where encodeURIComponent is required for values.",
                },
                {
                  title: "Encode text safely",
                  description: "Prevent broken links and malformed query strings.",
                  steps: [
                    "Paste raw text or an unencoded URL parameter, select Component mode, and click Encode.",
                    "Copy the result for use in redirects, webhooks, or app links.",
                    "Keep UTF‑8 characters intact—percent encoding preserves emoji and non‑Latin scripts.",
                  ],
                  helper: "For complex objects, stringify to JSON, then encode the string before passing as a value.",
                },
                {
                  title: "Decode values for readability",
                  description: "Recover human‑readable strings from encoded inputs.",
                  steps: [
                    "Paste an encoded value or full URL and click Decode.",
                    "If spaces appear as +, enable the + for spaces toggle before decoding.",
                    "Download the decoded text for logs, tickets, or documentation.",
                  ],
                  helper: "Double‑encoded inputs may require decoding more than once—decode cautiously.",
                },
                {
                  title: "Fix common errors",
                  description: "Resolve typical encoding/decoding pitfalls quickly.",
                  steps: [
                    "Invalid URI component: ensure the input isn’t partially encoded or missing % escapes.",
                    "Mixed encodings: standardize on UTF‑8 and avoid manual replacements.",
                    "Preserve reserved characters in URLs by using encodeURI for the base and encodeURIComponent for values.",
                  ],
                  helper: "Avoid encoding the entire URL multiple times—encode only values you add.",
                },
                {
                  title: "Publishing checklist",
                  description: "Ship robust links and integrations.",
                  steps: [
                    "Verify query strings decode correctly on the server.",
                    "Test links in multiple browsers and devices.",
                    "Document expected encoding rules for your API or app to prevent regressions.",
                  ],
                  helper: "Pair with JSON Formatter to prepare payloads before encoding.",
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
      </UrlEncodeDecode>
    </main>
  )
}
