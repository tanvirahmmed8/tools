import type { Metadata } from "next"

import { HashGenerator } from "@/components/hash-generator"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import hashSeo from "@/seo/hash-generator.json"

export const metadata: Metadata = buildMetadata(hashSeo)

export default function HashGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={hashSeo.structuredData} />
      <HashGenerator>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Hash Generator workflow guide (MD5 & SHA‑256)</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Create MD5 and SHA‑256 hashes online and copy/download results in hex or Base64. This SEO‑friendly guide covers best practices
                for checksums, data integrity, and audit trails.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Paste input text",
                  description: "Start with plain UTF‑8 text for reliable digests.",
                  steps: [
                    "Paste a string from your logs, config, or API client into the input field.",
                    "Avoid trailing spaces or unseen characters when reproducing checksums.",
                    "Use Sample to test with a known phrase and verify expected hashes.",
                  ],
                  helper: "Hashing is deterministic: the same input yields the same digest every time.",
                },
                {
                  title: "Pick algorithm and output format",
                  description: "Choose MD5 for legacy checks, SHA‑256 for modern integrity checks.",
                  steps: [
                    "Select SHA‑256 for security‑sensitive validations; MD5 is included for compatibility.",
                    "Switch Output to hex or Base64 depending on the system you paste into.",
                    "Click Generate hash to compute the digest in your browser.",
                  ],
                  helper: "MD5 is not collision‑resistant—avoid it for passwords or signatures.",
                },
                {
                  title: "Copy & Download",
                  description: "Move digests into tickets, scripts, or manifests instantly.",
                  steps: [
                    "Use Copy to place the digest on your clipboard for quick pasting.",
                    "Download hash.txt to attach to change requests or release notes.",
                    "Clear to wipe sensitive input/output from the UI when done.",
                  ],
                  helper: "All hashing is performed locally—no data is sent to a server.",
                },
                {
                  title: "Use cases & best practices",
                  description: "Apply digests where they add value.",
                  steps: [
                    "Checksums for file downloads: publish SHA‑256 alongside artifacts.",
                    "Data integrity in pipelines: compare digests before and after transforms.",
                    "Audit trails: store hashes of config or content to detect changes.",
                  ],
                  helper: "For password storage, use slow KDFs (bcrypt, scrypt, Argon2) instead of plain hashes.",
                },
                {
                  title: "Troubleshooting",
                  description: "Resolve common hashing problems quickly.",
                  steps: [
                    "Mismatched hashes: confirm no hidden characters or different line endings (CRLF vs. LF).",
                    "Unexpected Base64: ensure correct alphabet and padding; some systems use URL‑safe variants.",
                    "Re‑generate after normalizing whitespace or converting to UTF‑8.",
                  ],
                  helper: "If you hash files, ensure consistent byte streams—newline conversions alter digests.",
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
      </HashGenerator>
    </main>
  )
}
