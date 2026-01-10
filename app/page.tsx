import type { Metadata } from "next"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight, ArrowUpDown, ExternalLink, FileOutput, FileText, Hash as HashIcon, ImageDown, Images, KeyRound, Layers, LockKeyhole, PenSquare, QrCode, RotateCw, Ruler, ScanBarcode, Shield, Signature, Sparkles, SwatchBook, Trash2, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { SiteNavigation } from "@/components/site-navigation"
import { StructuredDataScript } from "@/components/structured-data"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { buildMetadata } from "@/lib/seo"
import { toneStyles, type ToneKey } from "@/lib/tones"
import homeSeo from "@/seo/home.json"

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
    title: "PDF Merge",
    description: "Combine multiple PDFs into a single document and reorder before exporting — all on-device.",
    href: "/pdf-merge",
    badge: "Reorder pages",
    icon: Layers,
    category: "PDF Suite",
    tone: "iris",
  },
  {
    title: "PDF Split",
    description: "Upload a PDF and extract specific pages or ranges into fresh files without leaving your browser.",
    href: "/pdf-split",
    badge: "Extract ranges",
    icon: FileText,
    category: "PDF Suite",
    tone: "rose",
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
    title: "Delete PDF Pages",
    description: "Remove outdated or sensitive PDF pages without disturbing the remaining layout or metadata.",
    href: "/delete-pdf-pages",
    badge: "Page cleanup",
    icon: Trash2,
    category: "PDF Suite",
    tone: "teal",
  },
  {
    title: "Protect PDF Password",
    description: "Encrypt PDFs with open and owner passwords plus shareable permission presets.",
    href: "/protect-pdf-password",
    badge: "Password lock",
    icon: LockKeyhole,
    category: "PDF Suite",
    tone: "iris",
  },
  {
    title: "Rearrange PDF Pages",
    description: "Drag page chips to match your storyline before exporting the PDF.",
    href: "/rearrange-pdf-pages",
    badge: "Drag reorder",
    icon: ArrowUpDown,
    category: "PDF Suite",
    tone: "cobalt",
  },
  {
    title: "Rotate PDF Pages",
    description: "Fix sideways scans by rotating individual pages 90° at a time.",
    href: "/rotate-pdf-pages",
    badge: "Fix orientation",
    icon: RotateCw,
    category: "PDF Suite",
    tone: "rose",
  },
  {
    title: "Unlock PDF",
    description: "Remove open passwords so printers, OCR, and e-sign tools accept the file.",
    href: "/unlock-pdf",
    badge: "Password removal",
    icon: KeyRound,
    category: "PDF Suite",
    tone: "teal",
  },
  {
    title: "Edit PDF",
    description: "Overlay headers, review notes, or disclaimers on any PDF and refresh metadata before sharing.",
    href: "/edit-pdf",
    badge: "Text overlays",
    icon: PenSquare,
    category: "PDF Suite",
    tone: "magenta",
  },
  {
    title: "Sign PDF",
    description: "Draw or upload a signature, drop it on the right page, and export a ready-to-share PDF.",
    href: "/sign-pdf",
    badge: "Signature pad",
    icon: Signature,
    category: "PDF Suite",
    tone: "emerald",
  },
  {
    title: "Extract PDF Images",
    description: "Scan PDFs for embedded PNGs/JPGs and download every asset as standalone PNGs or a ZIP.",
    href: "/extract-pdf-images",
    badge: "Asset scrape",
    icon: ImageDown,
    category: "PDF Suite",
    tone: "teal",
  },
  {
    title: "PDF to PNG",
    description: "Render every PDF page as a lossless PNG with transparent backgrounds intact for decks or LMS uploads.",
    href: "/pdf-to-png",
    badge: "Lossless PNG",
    icon: Images,
    category: "PDF Suite",
    tone: "emerald",
  },
  {
    title: "PDF to JPG",
    description: "Export PDFs as lightweight JPGs that load fast inside galleries, CRMs, or client previews.",
    href: "/pdf-to-jpg",
    badge: "Lightweight JPG",
    icon: Images,
    category: "PDF Suite",
    tone: "sunset",
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
    title: "Add PDF Watermark",
    description: "Overlay text or PNG logos across one or all pages and export a branded PDF.",
    href: "/pdf-watermark",
    badge: "Text/Logo",
    icon: Shield,
    category: "PDF Suite",
    tone: "teal",
  },
  {
    title: "Add Page Numbers",
    description: "Insert header or footer numbers with templates like ‘Page {n} of {total}’.",
    href: "/pdf-page-numbers",
    badge: "Header/Footer",
    icon: HashIcon,
    category: "PDF Suite",
    tone: "violet",
  },
  {
    title: "Webpage to PDF",
    description: "Convert any public URL into a printer‑ready PDF with JS hydration and brand styles.",
    href: "/webpage-to-pdf",
    badge: "From URL",
    icon: ExternalLink,
    category: "PDF Suite",
    tone: "cobalt",
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
    title: "Wi‑Fi QR Generator",
    description: "Create scannable Wi‑Fi QR codes (WPA/WEP/Open) so guests can join without typing.",
    href: "/wifi-qr-generator",
    badge: "Wi‑Fi QR",
    icon: QrCode,
    category: "Scanner Ops",
    tone: "violet",
  },
  {
    title: "WhatsApp QR Generator",
    description: "Build QR links that open WhatsApp chats with pre‑filled messages.",
    href: "/whatsapp-qr-generator",
    badge: "WhatsApp",
    icon: QrCode,
    category: "Scanner Ops",
    tone: "rose",
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
  // Dev tools
  {
    title: "Word Counter",
    description: "Count words, characters, sentences, paragraphs, and reading time in real‑time.",
    href: "/word-counter",
    badge: "Copy length",
    icon: FileText,
    category: "Dev Tools",
    tone: "sunset",
  },
  {
    title: "Character Counter",
    description: "Measure characters with/without spaces, lines, and UTF‑8 bytes for platform limits.",
    href: "/character-counter",
    badge: "Char limits",
    icon: Ruler,
    category: "Dev Tools",
    tone: "lime",
  },
  {
    title: "Case Converter",
    description: "Convert text to UPPERCASE, lowercase, or Title Case for headlines and UI labels.",
    href: "/case-converter",
    badge: "Casing",
    icon: PenSquare,
    category: "Dev Tools",
    tone: "magenta",
  },
  {
    title: "JSON Formatter",
    description: "Pretty‑print, validate, and minify JSON with copy/download actions.",
    href: "/json-formatter",
    badge: "Pretty‑print",
    icon: FileText,
    category: "Dev Tools",
    tone: "emerald",
  },
  {
    title: "Base64 Encode/Decode",
    description: "Encode UTF‑8 text to Base64 or decode Base64 back to readable strings.",
    href: "/base64",
    badge: "Base64",
    icon: SwatchBook,
    category: "Dev Tools",
    tone: "amber",
  },
  {
    title: "URL Encode/Decode",
    description: "Percent‑encode URI components or full URLs and fix +/space handling.",
    href: "/url-encode-decode",
    badge: "Encoding",
    icon: ExternalLink,
    category: "Dev Tools",
    tone: "rose",
  },
  {
    title: "UUID Generator",
    description: "Generate batches of secure RFC 4122 UUIDv4 identifiers in uppercase or compact form.",
    href: "/uuid-generator",
    badge: "Identifiers",
    icon: HashIcon,
    category: "Dev Tools",
    tone: "teal",
  },
  {
    title: "Hash Generator",
    description: "Create MD5 or SHA‑256 hashes and copy/download in hex or Base64.",
    href: "/hash-generator",
    badge: "Checksums",
    icon: Shield,
    category: "Dev Tools",
    tone: "slate",
  },
  {
    title: "Markdown to HTML",
    description: "Convert Markdown into sanitized HTML with headings, lists, links, and code blocks.",
    href: "/markdown-to-html",
    badge: "Markdown",
    icon: FileText,
    category: "Dev Tools",
    tone: "violet",
  },
]

const highlights: Array<{ title: string; description: string; icon: LucideIcon; tone: ToneKey }> = [
  {
    title: "Private by design",
    description: "Files are processed ephemerally. Nothing is stored once your extraction finishes.",
    icon: Shield,
    tone: "emerald",
  },
  {
    title: "Launch-ready outputs",
    description: "Get structured text, page-level exports, and shareable assets without extra cleanup.",
    icon: Layers,
    tone: "cobalt",
  },
  {
    title: "AI speed",
    description: "Optimized GPT-4o pipelines finish most jobs in under ten seconds.",
    icon: Zap,
    tone: "magenta",
  },
]

const workflow: Array<{ title: string; body: string; tone: ToneKey }> = [
  {
    title: "Choose a workspace",
    body: "Pick Image to Text, PDF to Text, or PDF to PNG/JPG depending on the asset you have on hand.",
    tone: "iris",
  },
  {
    title: "Drop your file",
    body: "Drag and drop, paste, or browse. Every uploader supports drag states, file validation, and previews.",
    tone: "sunset",
  },
  {
    title: "Ship the result",
    body: "Copy text, download PNGs, or zip entire batches. Outputs stay local until you decide to share.",
    tone: "teal",
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
              TextExtract AI bundles over twenty production-ready utilities so your team can switch between OCR, PDF parsing,
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
                <GlowCard key={feature.title} tone={feature.tone} className="h-full">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-2xl p-3 ${tone.iconBg}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${tone.badge}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">{feature.category}</p>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/80">{feature.description}</p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="w-fit gap-2 rounded-full border border-white/15 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
                  >
                    <Link href={feature.href}>
                      Open workspace
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </GlowCard>
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
              const tone = toneStyles[item.tone]
              return (
                <GlowCard key={item.title} tone={item.tone} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-2xl p-3 ${tone.iconBg}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-white/80">{item.description}</p>
                    </div>
                  </div>
                </GlowCard>
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
              <GlowCard key={step.title} tone={step.tone} className="p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-sm font-semibold">
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-white/80">{step.body}</p>
              </GlowCard>
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
      <SiteFooter />
    </main>
  )
}
