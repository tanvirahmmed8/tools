"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Check, Download, ExternalLink, FileText, Link2, Loader2, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

type WebpageToPdfProps = {
  children?: ReactNode
}

export function WebpageToPdf({ children }: WebpageToPdfProps) {
  const [url, setUrl] = useState("")
  const [format, setFormat] = useState("A4")
  const [landscape, setLandscape] = useState(false)
  const [printBackground, setPrintBackground] = useState(true)
  const [margin, setMargin] = useState("default") // default | none
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const canConvert = useMemo(() => isValidHttpUrl(url), [url])

  const reset = useCallback(() => {
    setUrl("")
    setFormat("A4")
    setLandscape(false)
    setPrintBackground(true)
    setMargin("default")
    setError(null)
    setDownloaded(false)
  }, [])

  const convert = useCallback(async () => {
    if (!canConvert) {
      setError("Enter a valid http(s) URL.")
      return
    }
    setIsProcessing(true)
    setError(null)
    setDownloaded(false)
    try {
      const res = await fetch("/api/webpage-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format, landscape, printBackground, margin }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Request failed (${res.status})`)
      }
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download = "webpage.pdf"
      a.click()
      URL.revokeObjectURL(objectUrl)
      setDownloaded(true)
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : "Failed to convert webpage to PDF")
    } finally {
      setIsProcessing(false)
    }
  }, [canConvert, url, format, landscape, printBackground, margin])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Webpage to PDF" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Link2 className="size-4" />
              <span>PDF utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Convert a webpage URL to PDF</h1>
            <p className="text-lg text-muted-foreground">Enter a URL and download a printer-friendly PDF. Rendering happens server-side for accuracy.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="azure" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <ExternalLink className="size-4" />
                    Webpage URL
                  </h2>
                  {(url || error || downloaded) && (
                    <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
                      <RefreshCcw className="size-4" />
                      Reset
                    </Button>
                  )}
                </div>

                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Page size</span>
                    <select
                      className="rounded-md border border-border bg-background px-2 py-2"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="size-4" checked={landscape} onChange={(e) => setLandscape(e.target.checked)} />
                    <span>Landscape</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="size-4" checked={printBackground} onChange={(e) => setPrintBackground(e.target.checked)} />
                    <span>Print background</span>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Margins</span>
                    <select
                      className="rounded-md border border-border bg-background px-2 py-2"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                    >
                      <option value="default">Default</option>
                      <option value="none">None</option>
                    </select>
                  </label>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button onClick={convert} disabled={!canConvert || isProcessing} className="w-full justify-center">
                  {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  {isProcessing ? "Rendering PDF" : "Download PDF"}
                </Button>
                {downloaded && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4" /> Download started</p>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="font-medium flex items-center gap-2">
                  <FileText className="size-4" />
                  Tips
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Some pages adapt their layout for printing; enable Print background for branding colors.</li>
                  <li>Pages behind logins or with heavy client-side rendering may not render fully.</li>
                  <li>Try switching between A4/Letter and portrait/landscape for better pagination.</li>
                </ul>
              </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      {children}
      <SiteFooter />
    </div>
  )
}
