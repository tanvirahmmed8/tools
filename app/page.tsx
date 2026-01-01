import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, FileOutput, FileText, Images, Layers, QrCode, Ruler, ScanBarcode, Shield, Sparkles, SwatchBook, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteNavigation } from "@/components/site-navigation"
import { StructuredDataScript } from "@/components/structured-data"
import { PageContainer } from "@/components/page-container"
import { buildMetadata } from "@/lib/seo"
import homeSeo from "@/seo/home.json"

const toneStyles = {
  iris: {
    glow: "from-[#8b5cf6]/40 via-transparent to-transparent",
    iconBg: "bg-[#8b5cf6]/15 text-[#f5f3ff]",
    badge: "text-[#c4b5fd]",
    aura: "bg-[#8b5cf6]/35",
  },
  rose: {
    glow: "from-[#fb7185]/35 via-transparent to-transparent",
    iconBg: "bg-[#fb7185]/15 text-[#ffe4e6]",
    badge: "text-[#fecdd3]",
    aura: "bg-[#fb7185]/30",
  },
  azure: {
    glow: "from-[#38bdf8]/35 via-transparent to-transparent",
    iconBg: "bg-[#38bdf8]/15 text-[#e0f2fe]",
    badge: "text-[#bae6fd]",
    aura: "bg-[#38bdf8]/30",
  },
  emerald: {
    glow: "from-[#34d399]/35 via-transparent to-transparent",
    iconBg: "bg-[#34d399]/15 text-[#d1fae5]",
    badge: "text-[#a7f3d0]",
    aura: "bg-[#34d399]/30",
  },
  amber: {
    glow: "from-[#fbbf24]/35 via-transparent to-transparent",
    iconBg: "bg-[#fbbf24]/15 text-[#fef3c7]",
    badge: "text-[#fde68a]",
    aura: "bg-[#fbbf24]/30",
  },
  magenta: {
    glow: "from-[#ec4899]/35 via-transparent to-transparent",
    iconBg: "bg-[#ec4899]/15 text-[#fdf2f8]",
    badge: "text-[#fbcfe8]",
    aura: "bg-[#ec4899]/30",
  },
  cobalt: {
    glow: "from-[#4b70ff]/35 via-transparent to-transparent",
    iconBg: "bg-[#4b70ff]/15 text-[#eff4ff]",
    badge: "text-[#c7d2fe]",
    aura: "bg-[#4b70ff]/30",
  },
  lime: {
    glow: "from-[#a3e635]/30 via-transparent to-transparent",
    iconBg: "bg-[#a3e635]/15 text-[#ecfccb]",
    badge: "text-[#d9f99d]",
    aura: "bg-[#a3e635]/25",
  },
  sunset: {
    glow: "from-[#fb923c]/35 via-transparent to-transparent",
    iconBg: "bg-[#fb923c]/15 text-[#fff1e6]",
    badge: "text-[#fed7aa]",
    aura: "bg-[#fb923c]/30",
  },
  teal: {
    glow: "from-[#2dd4bf]/35 via-transparent to-transparent",
    iconBg: "bg-[#2dd4bf]/15 text-[#d5f5ef]",
    badge: "text-[#99f6e4]",
    aura: "bg-[#2dd4bf]/30",
  },
  violet: {
    glow: "from-[#c084fc]/35 via-transparent to-transparent",
    iconBg: "bg-[#c084fc]/15 text-[#f5e1ff]",
    badge: "text-[#e9d5ff]",
    aura: "bg-[#c084fc]/30",
  },
  slate: {
    glow: "from-[#94a3b8]/35 via-transparent to-transparent",
    iconBg: "bg-[#94a3b8]/15 text-[#f1f5f9]",
    badge: "text-[#cbd5f5]",
    aura: "bg-[#94a3b8]/25",
  },
} as const

type ToneKey = keyof typeof toneStyles

interface FeatureCardConfig {
  title: string
  description: string
  href: string
  badge: string
  icon: LucideIcon
  category: string
  tone: ToneKey
}

const featureCards: FeatureCardConfig[] = [
  {
    title: "PDF Merge / Split",
    description: "Combine multiple PDFs into one or split a PDF by pages or ranges — all on-device.",
    href: "/pdf-merge-split",
    badge: "Reorder pages",
    icon: Layers,
    category: "PDF Suite",
    tone: "iris",
  },
  {
    title: "PDF Compress",
    description: "Shrink PDF file size by compressing images and optimizing content for faster sharing and uploads.",
    href: "/pdf-compress",
    badge: "Reduce size",
    icon: Sparkles,
    category: "PDF Suite",
    tone: "rose",
  },
  {
    title: "PDF to Text",
    description: "Extract paragraphs, headings, and bullets from dense PDFs while preserving the reading order.",
    href: "/pdf-to-text",
    badge: "Multi-page",
    icon: FileText,
    category: "PDF Suite",
    tone: "azure",
  },
  {
    title: "PDF to Images",
    description: "Render every PDF page as a crisp PNG that is ready for decks, help centers, or submissions.",
    href: "/pdf-to-image",
    badge: "High fidelity",
    icon: Images,
    category: "PDF Suite",
    tone: "emerald",
  },
  {
    title: "PDF to Word",
    description: "Upload a PDF and download an editable DOCX that keeps paragraphs, spacing, and headings intact.",
    href: "/pdf-to-word",
    badge: "DOCX export",
    icon: FileOutput,
    category: "PDF Suite",
    tone: "amber",
  },
  {
    title: "Image to Text",
    description: "Paste or drop screenshots, handwritten notes, and slides to grab clean, editable text instantly.",
    href: "/image-to-text",
    badge: "Vision AI",
    icon: Zap,
    category: "Image Studio",
    tone: "magenta",
  },
  {
    title: "Image to PDF",
    description: "Combine PNG/JPG images into a single PDF. Reorder pages before exporting.",
    href: "/image-to-pdf",
    badge: "Image → PDF",
    icon: Layers,
    category: "Image Studio",
    tone: "cobalt",
  },
  {
    title: "Image Resizer",
    description: "Resize assets to exact pixels and add rounded corners for thumbnails, banners, or product shots.",
    href: "/image-resizer",
    badge: "Canvas tools",
    icon: Ruler,
    category: "Image Studio",
    tone: "lime",
  },
  {
    title: "Image Converter",
    description: "Turn PNGs into JPGs, WEBP, GIF, or AVIF files without leaving the browser.",
    href: "/image-converter",
    badge: "Format lab",
    icon: SwatchBook,
    category: "Image Studio",
    tone: "sunset",
  },
  {
    title: "Image Watermark",
    description: "Add text watermarks to images with position, size, color, and opacity controls.",
    href: "/image-watermark",
    badge: "Protect assets",
    icon: Shield,
    category: "Image Studio",
    tone: "teal",
  },
  {
    title: "QR Toolkit",
    description: "Decode QR snapshots or generate brand-new QR codes with full on-device privacy.",
    href: "/qr-tools",
    badge: "QR codes",
    icon: QrCode,
    category: "Scanner Ops",
    tone: "violet",
  },
  {
    title: "Barcode Toolkit",
    description: "Scan CODE128, EAN, or UPC barcodes and publish fresh labels for SKUs and shipments.",
    href: "/barcode-tools",
    badge: "Barcodes",
    icon: ScanBarcode,
    category: "Scanner Ops",
    tone: "slate",
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
              TextExtract AI bundles eight production-ready utilities so your team can switch between OCR, PDF parsing,
              barcode workflows, media conversions, and exporting without relearning interfaces.
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon
              const tone = toneStyles[feature.tone]

              return (
                <Card
                  key={feature.title}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-[#090f1c] p-6 text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.9)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300 group-hover:opacity-100 ${tone.glow}`}
                  />
                  <div
                    className={`pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full opacity-60 blur-3xl ${tone.aura}`}
                  />
                  <div className="relative z-10 flex items-start justify-between">
                    <div className={`rounded-2xl p-3 transition duration-300 ${tone.iconBg}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${tone.badge}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <div className="relative z-10 mt-6 space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">{feature.category}</p>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="relative z-10 mt-6 w-fit gap-2 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
                  >
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
