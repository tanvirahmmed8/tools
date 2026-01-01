import type { Metadata } from "next"

import { ImageWatermark } from "@/components/image-watermark"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageWatermarkSeo from "@/seo/image-watermark.json"

export const metadata: Metadata = buildMetadata(imageWatermarkSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload photos to the watermark generator",
    description: "Kick off your online image watermark workflow with clean previews and organized filenames.",
    steps: [
      "Drag PNG, JPG, or product mockups into the Add Images panel or tap to browse from your device or cloud drive.",
      "Review the thumbnails to confirm orientation and lighting. Rename files with SEO-friendly slugs like summer-lookbook-01.png before exporting.",
      "Use Clear when you need to restart a batch—perfect for Etsy shops, Amazon listings, and press kits.",
    ],
    helper: "High-resolution uploads (2000 px or larger) produce sharper branded assets after watermarking.",
  },
  {
    title: "Choose text or PNG watermark styles",
    description: "Control every detail of your watermark for brand consistency across marketplaces and blogs.",
    steps: [
      "Select Text when you need a fast © Brand Name overlay. Customize font size, color, opacity, and optional drop shadow for contrast.",
      "Switch to PNG Image to import a transparent logo, then adjust scale, position, and margins to match your grid or template.",
      "Preview the watermark settings on a sample image to ensure legibility on both dark and light backgrounds.",
    ],
    helper: "Set opacity between 50–80% for social posts so the watermark stays visible without overpowering the photography.",
  },
  {
    title: "Apply watermarks and download assets",
    description: "Batch watermark entire folders of lifestyle images, mockups, or product renders in one click.",
    steps: [
      "Click Apply Watermark to process every selected image using the current settings. Progress indicators show when each file finishes.",
      "Download individual images as soon as they are ready, or choose Download all (ZIP) for a single archive you can send to clients or upload to Shopify.",
      "Save files with consistent naming conventions (brand-product-watermarked.png) to boost DAM searchability and SEO metadata.",
    ],
    helper: "Need a second variant? Tweak the settings and re-run Apply Watermark—there is no queue or file limit inside the browser.",
  },
  {
    title: "Troubleshoot transparency, logos, and batches",
    description: "Resolve the most common issues without leaving the online watermark tool.",
    steps: [
      "If a PNG watermark looks blurry, upload a higher-resolution logo or increase the Scale percentage until edges sharpen.",
      "For text overlays that disappear on bright scenes, enable the shadow toggle or switch to a darker RGBA color.",
      "When large batches stall, split uploads into sets of 50 images or fewer to keep memory usage low on older laptops.",
    ],
    helper: "All processing runs locally. Refreshing the page clears previews and temporary URLs but never uploads your assets to a server.",
  },
]

export default function ImageWatermarkPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageWatermarkSeo.structuredData} />
      <ImageWatermark>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Image watermark workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO-optimized playbook to brand every photo with text or PNG logos. Protect Etsy listings, Shopify catalogs,
                agency mockups, and lookbooks right in the browser while keeping filenames keyword-rich for search.
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
      </ImageWatermark>
    </main>
  )
}
