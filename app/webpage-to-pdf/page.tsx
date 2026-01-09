import type { Metadata } from "next"

import { WebpageToPdf } from "@/components/webpage-to-pdf"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import webpageToPdfSeo from "@/seo/webpage-to-pdf.json"

export const metadata: Metadata = buildMetadata(webpageToPdfSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Prep the URL for best results",
    description: "Point the converter at a public, crawlable page and tidy the final PDF’s SEO signals.",
    steps: [
      "Paste a full http(s) URL to an article, landing page, or documentation view that doesn’t require login.",
      "Set a descriptive page title and meta tags on the source page—the PDF file name and preview often inherit this context.",
      "If the site uses dark themes, consider enabling Print background so brand colors and hero areas render faithfully.",
    ],
    helper: "Sites behind auth or heavy client-side rendering may need an alternate share link or a public preview route.",
  },
  {
    title: "Choose page size, orientation, and margins",
    description: "Match stakeholder expectations for printouts and long-form PDF reading.",
    steps: [
      "Select A4 for international print workflows or Letter for US teams; use Landscape for dashboards, charts, and wide hero sections.",
      "Keep Default margins for most blogs and docs. Switch to None when the site defines its own CSS page size or requires full-bleed.",
      "Enable Print background when the design relies on brand colors, gradient sections, or code-block shading.",
    ],
    helper: "If the site defines @page CSS, preferCSSPageSize is honored so pagination respects the author’s settings.",
  },
  {
    title: "Render JavaScript-heavy websites accurately",
    description: "Get complete, hydrated content from React/Next/Vue and lazy-loaded sections.",
    steps: [
      "Wait for the page to finish loading, then scroll the page once before export so images and infinite sections lazy-load.",
      "If something is missing, reload the page and try again with Print background on; some frameworks hide content in print media.",
      "For long single-page apps, export in Landscape or split sections later using the PDF Split tool.",
    ],
    helper: "The renderer emulates a modern desktop Chrome and waits for fonts + hydration so UI kits and icons render sharply.",
  },
  {
    title: "Export and QA the PDF",
    description: "Double-check layout, pagination, and links before sharing.",
    steps: [
      "Click Download PDF and open the file in a separate tab or viewer to skim headers, hero blocks, and tables.",
      "Spot-check internal anchors and external links—they remain clickable for most websites.",
      "If the PDF looks too dense, switch to Portrait or increase margins; for multi-page docs, consider Letter vs A4.",
    ],
    helper: "Combine with PDF Compress to shrink large, image-heavy pages before emailing or uploading to your CMS.",
  },
  {
    title: "Troubleshooting dynamic sites",
    description: "Recover missing content or blocked sections without leaving the tool.",
    steps: [
      "Pages behind login walls won’t render—use a public preview link or temporary share URL.",
      "When sticky headers overlap content, toggle Print background off or switch orientation and try again.",
      "If a widget renders blank, refresh the URL and re-run the export; some embeds require a user gesture.",
    ],
    helper: "For long reports, export the top sections first, then append with PDF Merge to keep pagination tidy.",
  },
]

export default function WebpageToPdfPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={webpageToPdfSeo.structuredData} />
      <WebpageToPdf>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Webpage to PDF workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-friendly checklist to convert any public URL into a printer‑ready PDF. These steps help JavaScript sites hydrate,
                preserve brand styles, and paginate cleanly for stakeholders and archives.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {manualSections.map((section) => (
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
                  {section.helper ? (
                    <p className="mt-4 rounded-md border border-dashed border-border/80 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                      {section.helper}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </WebpageToPdf>
    </main>
  )
}
