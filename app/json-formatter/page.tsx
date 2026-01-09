import type { Metadata } from "next"

import { JsonFormatter } from "@/components/json-formatter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import jsonFormatterSeo from "@/seo/json-formatter.json"

export const metadata: Metadata = buildMetadata(jsonFormatterSeo)

export default function JsonFormatterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={jsonFormatterSeo.structuredData} />
      <JsonFormatter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">JSON Formatter & Validator workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly guide to pretty‑print JSON, validate syntax, minify payloads, and copy or download results. Ideal for API
                responses, config files, and logs when you need clean, readable JSON online.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Paste raw JSON",
                  description: "Start by dropping unformatted or compact JSON into the input.",
                  steps: [
                    "Paste a response body from your REST or GraphQL client, or upload content from logs.",
                    "Remove trailing commas and comments—standard JSON syntax is required for validation.",
                    "Use the Sample button to see expected structure if you’re unsure.",
                  ],
                  helper: "The validator highlights parse errors so you can correct braces, brackets, and quotes quickly.",
                },
                {
                  title: "Pretty‑print with custom indentation",
                  description: "Make nested objects and arrays readable for debugging and code review.",
                  steps: [
                    "Choose 2 or 4 spaces, or Tab, then click Format to pretty‑print JSON with consistent structure.",
                    "Scan keys, arrays, and deeply nested objects without losing track of levels.",
                    "Switch back to 2‑space indent for compact yet readable diffs in PRs.",
                  ],
                  helper: "Pretty‑printed JSON is easier to diff in version control and to share in documentation.",
                },
                {
                  title: "Minify for transport and storage",
                  description: "Shrink payloads for cookies, localStorage, or network requests.",
                  steps: [
                    "Click Minify to collapse whitespace while preserving valid JSON.",
                    "Copy the compact string for use in headers, query params, or environment variables.",
                    "Download formatted.json for archiving or pasting into tooling.",
                  ],
                  helper: "Minified JSON saves space but is hard to read—re‑format when debugging.",
                },
                {
                  title: "Copy and download results",
                  description: "Move clean JSON into your IDE, ticket, or docs instantly.",
                  steps: [
                    "Use Copy in the Output panel to place the result on your clipboard.",
                    "Download as formatted.json to attach to tickets or share with teammates.",
                    "Re‑run Format or Minify as needed—no server uploads, all processing stays in your browser.",
                  ],
                  helper: "Local processing keeps sensitive payloads private during validation and formatting.",
                },
                {
                  title: "Troubleshooting syntax errors",
                  description: "Resolve common JSON parse errors quickly.",
                  steps: [
                    "Ensure all keys use double quotes and commas separate properties.",
                    "Remove comments (// or /* */)—they’re not valid in JSON.",
                    "Validate special characters are escaped (\" \n \t) and strings are properly closed.",
                  ],
                  helper: "If a third‑party dump isn’t valid JSON, convert it to JSON5 elsewhere, then paste clean JSON here.",
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
      </JsonFormatter>
    </main>
  )
}
