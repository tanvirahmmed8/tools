import type { Metadata } from "next"

import { ImageResizer } from "@/components/image-resizer"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import imageResizerSeo from "@/seo/image-resizer.json"

export const metadata: Metadata = buildMetadata(imageResizerSeo)

type ManualSection = {
  title: string
  description: string
  steps: string[]
  helper?: string
}

const manualSections: ManualSection[] = [
  {
    title: "Upload images to the online resizer",
    description: "Kick off every resize workflow with a crisp preview, automatic dimension detection, and SEO-friendly filenames.",
    steps: [
      "Open the instant image resizer, drag PNG, JPG, WEBP, HEIC, or GIF files into the Drop Zone, or tap to browse from your camera roll.",
      "Let the app detect natural width × height so you always start from the original resolution before cropping or scaling.",
      "Rename the download slug (for example hero-banner-2024.png) so every exported asset keeps keyword-rich metadata for ecommerce and blog uploads.",
    ],
    helper: "Higher-resolution uploads (2000 px+) produce sharper downsized assets for Shopify, Amazon, Etsy, and social platforms.",
  },
  {
    title: "Resize photos for social media and ecommerce",
    description: "Use presets to hit Instagram, TikTok, YouTube, and marketplace dimensions without manual math.",
    steps: [
      "Pick a quick size like Square 1080, Story 1080×1920, or Slide 1920×1080 to auto-fill width, height, and optional corner radius.",
      "Toggle Lock aspect ratio if you want proportional scaling; disable it when you need pixel-perfect banners or ad variants.",
      "Adjust the width and height fields manually for Shopify PDP / PLP thumbnails, Amazon A+ content, or Google Display Ads.",
    ],
    helper: "Staying under 200 KB for social posts and under 100 KB for thumbnails usually keeps Core Web Vitals in the green.",
  },
  {
    title: "Crop, reframe, and round corners",
    description: "Fine-tune focus with the drag-to-move cropper and add brand-ready rounded edges before download.",
    steps: [
      "Drag inside the highlighted crop area to reposition the focal point, or pull the handles to trim unused background space.",
      "Use the corner radius slider to generate perfect circles for avatars or subtle rounded rectangles for UI screenshots.",
      "Watch the live PNG preview update on the checkerboard background to confirm transparency and composition before exporting.",
    ],
    helper: "For circle avatars, set the preset to 1080 Circle, then nudge the crop so eyes sit on the upper third line.",
  },
  {
    title: "Export transparent PNGs without compression loss",
    description: "Download production-ready assets that stay sharp across CMS, product detail pages, and slide decks.",
    steps: [
      "Click Download once the renderer finishes; the tool exports a clean PNG that keeps transparency and color accuracy.",
      "Use the checker background to validate that rounded corners or background removals output true alpha channels.",
      "If a button is disabled or you change your mind, tap Start over to clear cached data and restart a new resizing session instantly.",
    ],
    helper: "Everything renders locally in the browser—no uploads to third-party servers, no queue, and no file size limits beyond device memory.",
  },
]

export default function ImageResizerPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={imageResizerSeo.structuredData} />
      <ImageResizer>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Image Resizer playbook</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Follow this SEO-optimized guide to master the online image resizer, social media resize presets, and transparent PNG exporter.
                Each workflow helps marketers, designers, and ecommerce teams ship lightning-fast visuals that keep Core Web Vitals and keyword rankings high.
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
      </ImageResizer>
    </main>
  )
}
