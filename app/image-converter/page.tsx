import type { Metadata } from "next"

import { ImageFormatConverter } from "@/components/image-format-converter"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageConverterSeo from "@/seo/image-converter.json"

export const metadata: Metadata = buildMetadata(imageConverterSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload any image to the online converter",
    description: "Start every PNG to JPG, WEBP to PNG, or HEIC to PNG job with a clean preview and descriptive filename.",
    steps: [
      "Open the online image converter, drag a PNG, JPG, WEBP, GIF, AVIF, HEIC, or SVG into the Drop Zone, or tap to browse.",
      "Watch the live preview load; if you see a warning, we still attempt the conversion so you never lose momentum.",
      "Rename the base file in the File Name field so your download saves with SEO-friendly, keyword-rich text like product-sku-front.jpg.",
    ],
    helper: "For marketplace-ready listings, upload the highest-resolution source you have—downscaling later protects sharpness and color accuracy.",
  },
  {
    title: "Convert PNG to JPG, WEBP, AVIF, or BMP instantly",
    description: "Choose any target format to match ecommerce, blog, or LMS requirements.",
    steps: [
      "Select the target format dropdown and pick JPG for classic photos, WEBP or AVIF for modern compression, GIF for motion, or BMP for legacy workflows.",
      "Use the quality slider when a lossy format is selected. Aim for 75–85% when optimizing lifestyle shots, and 90%+ for UI or product detail renders.",
      "Press Convert to generate a fresh canvas, then hit Download to store the optimized PNG, JPG, WEBP, AVIF, GIF, or BMP locally.",
    ],
    helper: "Need a quick PNG to JPG converter? This workflow stays entirely in your browser—no upload limits, no file queue, no tracking.",
  },
  {
    title: "Optimize images for SEO, Core Web Vitals, and accessibility",
    description: "Pair fast formats with descriptive metadata to improve rankings and PageSpeed scores.",
    steps: [
      "Export WEBP or AVIF versions for hero banners and blog hero images to cut file sizes for Google Lighthouse and Core Web Vitals.",
      "Keep a high-quality JPG fallback for email clients and CMS templates that do not support modern formats yet.",
      "Document alt text alongside the converted file name so every upload ships with keyword-focused descriptions and ADA-friendly context.",
    ],
    helper: "Aim for sub-200 KB hero images and sub-100 KB thumbnails to stay within most ecommerce platform recommendations.",
  },
  {
    title: "Troubleshoot downloads, previews, and color shifts",
    description: "Resolve the most common PNG to JPG converter issues without leaving the page.",
    steps: [
      "If the Convert button is disabled, confirm an image is uploaded and click Clear to reset cached previews before reloading.",
      "When colors look dull, ensure the source file has an sRGB profile—Safari users can also open the View in Tab preview to confirm.",
      "If a download stalls, use the Copy URL action to open the converted file in a new tab, then save via the browser menu.",
    ],
    helper: "All processing is local, so refreshing the page wipes previews, clipboard items, and error states without touching your source file.",
  },
]

export default function ImageConverterPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageConverterSeo.structuredData} />
      <ImageFormatConverter>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Image Converter playbook</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Master the online image converter, PNG to JPG converter, and WEBP to PNG tool with this SEO-optimized workflow guide.
                Each checklist helps ecommerce, content, and marketing teams ship lightweight visuals that rank better and load faster.
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
      </ImageFormatConverter>
    </main>
  )
}
