import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, FileText, ImageIcon, Images, Layers, QrCode, Ruler, ScanBarcode, Shield, Sparkles, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteNavigation } from "@/components/site-navigation"
import { StructuredDataScript } from "@/components/structured-data"
import { PageContainer } from "@/components/page-container"
import { buildMetadata } from "@/lib/seo"
import homeSeo from "@/seo/home.json"

const featureCards = [
  {
    title: "Image to Text",
    description: "Paste or drop screenshots, handwritten notes, and slides to grab clean, editable text instantly.",
    href: "/image-to-text",
    badge: "Vision AI",
    icon: ImageIcon,
  },
  {
    title: "PDF to Text",
    description: "Extract paragraphs, headings, and bullets from dense PDFs while preserving the reading order.",
    href: "/pdf-to-text",
    badge: "Multi-page",
    icon: FileText,
  },
  {
    title: "PDF to Images",
    description: "Render every PDF page as a crisp PNG that is ready for decks, help centers, or submissions.",
    href: "/pdf-to-image",
    badge: "High fidelity",
    icon: Images,
  },
  {
    title: "QR Toolkit",
    description: "Decode QR snapshots or generate brand-new QR codes with full on-device privacy.",
    href: "/qr-tools",
    badge: "QR codes",
    icon: QrCode,
  },
  {
    title: "Barcode Toolkit",
    description: "Scan CODE128, EAN, or UPC barcodes and publish fresh labels for SKUs and shipments.",
    href: "/barcode-tools",
    badge: "Barcodes",
    icon: ScanBarcode,
  },
  {
    title: "Image Resizer",
    description: "Resize assets to exact pixels and add rounded corners for thumbnails, banners, or product shots.",
    href: "/image-resizer",
    badge: "Canvas tools",
    icon: Ruler,
  },
]

const highlights = [
  {
    title: "Private by design",
    description: "Files are processed ephemerally. Nothing is stored once your extraction finishes.",
    icon: Shield,
  },
  {
    title: "Launch-ready outputs",
    description: "Get structured text, page-level exports, and shareable assets without extra cleanup.",
    icon: Layers,
  },
  {
    title: "AI speed",
    description: "Optimized GPT-4o pipelines finish most jobs in under ten seconds.",
    icon: Zap,
  },
]

const workflow = [
  {
    title: "Choose a workspace",
    body: "Pick Image to Text, PDF to Text, or PDF to Images depending on the asset you have on hand.",
  },
  {
    title: "Drop your file",
    body: "Drag and drop, paste, or browse. Every uploader supports drag states, file validation, and previews.",
  },
  {
    title: "Ship the result",
    body: "Copy text, download PNGs, or zip entire batches. Outputs stay local until you decide to share.",
  },
]

export const metadata: Metadata = buildMetadata(homeSeo)

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={homeSeo.structuredData} />
      <SiteNavigation />

      <section className="relative border-b border-border bg-gradient-to-b from-background via-background to-muted/40">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-3.5" />
            <span>Built for operators & researchers</span>
          </div>
          <div className="mt-8 max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
              The fastest way to turn unstructured files into usable text and imagery
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              TextExtract AI bundles six production-ready utilities so your team can switch between OCR, PDF parsing,
              barcode workflows, image resizing, and exporting without learning new tools.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/image-to-text">
                  Launch Image to Text
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#features">
                  Explore feature cards
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      <section id="features" className="py-16 md:py-24">
        <PageContainer>
          <div className="mb-10 flex flex-col gap-3 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Choose a workflow</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Feature cards that drop you directly into the right tool</h2>
          <p className="text-muted-foreground md:text-lg">
            Each workspace is tuned for a specific job, from OCR to rendering entire decks.
          </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="flex flex-col gap-4 border-border/60 bg-card/70 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{feature.badge}</p>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <Button asChild variant="ghost" className="px-0 text-primary hover:text-primary">
                    <Link href={feature.href}>
                      Open workspace
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </Card>
              )
            })}
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-border bg-card/40">
        <PageContainer className="grid gap-8 py-16 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Why teams switch</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Operational guardrails baked in</h2>
            <p className="text-muted-foreground">
              The suite is intentionally minimal: consistent drop zones, copy-ready outputs, and no surprise limits. Bring your
              own workflow automation on top.
            </p>
          </div>
          <div className="grid gap-4">
            {highlights.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="flex items-start gap-4 border-border/60 bg-background/70 p-5">
                  <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </PageContainer>
      </section>

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Three-step flow</p>
          <h2 className="text-3xl font-semibold md:text-4xl">From upload to export in minutes</h2>
          <p className="text-muted-foreground md:text-lg">
            Every product in the suite follows the same structure so you never have to re-learn a UI.
          </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflow.map((step, index) => (
              <Card key={step.title} className="relative h-full border-border/60 bg-card/60 p-6">
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-muted/40">
        <PageContainer className="flex flex-col gap-6 py-12 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Ready to build</p>
          <h2 className="text-3xl font-semibold md:text-4xl">Pick a card and start extracting</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            TextExtract AI stays lightweight, secure, and fast. Whether you are triaging a research drop or prepping a deck,
            there is a workspace that gets you there faster.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/image-to-text">
                Launch Image to Text
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pdf-to-text">
                Try PDF to Text
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </main>
  )
}
