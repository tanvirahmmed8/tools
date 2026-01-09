import type { Metadata } from "next"

import { PdfToImageConverter } from "@/components/pdf-to-image-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import pdfToJpgSeo from "@/seo/pdf-to-jpg.json"

export const metadata: Metadata = buildMetadata(pdfToJpgSeo)

const heroContent = {
  badge: "Lightweight gallery assets",
  title: "Convert PDFs into compressed JPGs",
  description: "Create fast-loading JPG versions of brochures, signed agreements, or onboarding packets without leaving the browser.",
}

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload PDFs with tidy filenames",
    description: "Organized naming conventions make the exported JPGs easier to index in DAMs and CMSs.",
    steps: [
      "Drop a PDF from desktop, cloud storage, or tablet Files panel straight into the converter.",
      "Rename the PDF with slug-ready text like onboarding-guide-2026.pdf before uploading.",
      "Keep the file under 20 MB or split massive catalogs to ensure the rendering step stays snappy.",
    ],
    helper: "Flatten transparencies or Spot colors before exporting from Illustrator to avoid unexpected background fills in JPG output.",
  },
  {
    title: "Render pages as share-ready JPGs",
    description: "Each canvas is rasterized at 1.5× scale, then encoded into a JPEG that balances clarity and size.",
    steps: [
      "Let the renderer finish—once the overlay disappears you will see every page ready for QA.",
      "Check the pixel dimensions to confirm social media or CMS requirements before downloading.",
      "Need smaller files? Re-run the export after reducing the original PDF page size or asset resolution.",
    ],
    helper: "Because everything runs locally, confidential decks and legal packets stay on-device during conversion.",
  },
  {
    title: "Download JPGs individually or in bulk",
    description: "Perfect for knowledge bases, CRM attachments, or image-only newsletters.",
    steps: [
      "Use the JPG button on any page card to grab a single asset with descriptive naming (playbook-page-05.jpg).",
      "Click Download all to package the entire set into a ZIP that you can drop into SharePoint, Box, or Notion.",
      "Share the compressed JPGs with clients who cannot open PDFs or need inline previews for approvals.",
    ],
    helper: "Archive the ZIP alongside the source PDF so your team can regenerate different formats later.",
  },
  {
    title: "Troubleshoot artifacts",
    description: "Quick fixes keep gradients, vivid colors, and signatures looking right in JPEG form.",
    steps: [
      "If gradients posterize, add a subtle noise layer before exporting the PDF, then reconvert.",
      "When colors shift, ensure the PDF assets are sRGB and re-export—JPGs assume an RGB color space.",
      "Remove passwords or flatten form fields so every element renders correctly in the JPEG pipeline.",
    ],
    helper: "The converter automatically reuses your browser cache, so hitting Clear between jobs prevents mixed results.",
  },
]

export default function PdfToJpgPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={pdfToJpgSeo.structuredData} />
      <PdfToImageConverter format="jpg" navTitle="PDF to JPG" hero={heroContent}>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">PDF to JPG workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Convert PDFs into compressed JPGs that stay faithful to the source layout while loading lightning-fast inside knowledge bases,
                email campaigns, and social carousels.
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
      </PdfToImageConverter>
    </main>
  )
}
