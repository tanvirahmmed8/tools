"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { Check, Download, FileText, Hash, Loader2, RefreshCcw, Type } from "lucide-react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function hexToRgb1(hex: string) {
  const m = hex.replace(/#/g, "").trim()
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m
  const n = parseInt(full.slice(0, 6), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return { r: r / 255, g: g / 255, b: b / 255 }
}

function fileToArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

type PositionPreset =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right"

type PdfPageNumbersConverterProps = { children?: ReactNode }

export function PdfPageNumbersConverter({ children }: PdfPageNumbersConverterProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")

  const [startNumber, setStartNumber] = useState(1)
  const [template, setTemplate] = useState("Page {n} of {total}")
  const [fontSize, setFontSize] = useState(12)
  const [color, setColor] = useState("#111827")
  const [opacity, setOpacity] = useState(0.9)
  const [position, setPosition] = useState<PositionPreset>("bottom-center")
  const [margin, setMargin] = useState(24)

  const [isProcessing, setIsProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setDone(false), [pdfFile, startNumber, template, fontSize, color, opacity, position, margin])

  const canProcess = useMemo(() => !!pdfFile, [pdfFile])

  const handlePdfSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }
    setPdfFile(file)
    setPdfName(file.name)
    setError(null)
  }, [])

  const renderLabel = useCallback((tpl: string, n: number, total: number) => {
    return tpl.replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total))
  }, [])

  const addPageNumbers = useCallback(async () => {
    if (!pdfFile) return

    setIsProcessing(true)
    setError(null)
    setDone(false)

    try {
      const pdfBytes = await fileToArrayBuffer(pdfFile)
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

      const pages = pdfDoc.getPages()
      const total = pages.length
      const { r, g, b } = hexToRgb1(color)

      pages.forEach((page, idx) => {
        const current = startNumber + idx
        const label = renderLabel(template, current, total)
        const { width, height } = page.getSize()
        const textWidth = helvetica.widthOfTextAtSize(label, fontSize)
        const textHeight = helvetica.heightAtSize(fontSize)

        let x = margin
        let y = margin

        switch (position) {
          case "bottom-left":
            x = margin
            y = margin
            break
          case "bottom-center":
            x = (width - textWidth) / 2
            y = margin
            break
          case "bottom-right":
            x = width - textWidth - margin
            y = margin
            break
          case "top-left":
            x = margin
            y = height - textHeight - margin
            break
          case "top-center":
            x = (width - textWidth) / 2
            y = height - textHeight - margin
            break
          case "top-right":
            x = width - textWidth - margin
            y = height - textHeight - margin
            break
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font: helvetica,
          color: rgb(r, g, b),
          opacity,
        })
      })

      const outBytes = await pdfDoc.save()
      const baseBuffer = (outBytes as Uint8Array).buffer as ArrayBuffer
      const copy = baseBuffer.slice(outBytes.byteOffset, outBytes.byteOffset + outBytes.byteLength)
      const blob = new Blob([copy], { type: "application/pdf" })
      const name = pdfName ? pdfName.replace(/\.pdf$/i, "") + "-numbered.pdf" : "numbered.pdf"
      downloadBlob(name, blob)
      setDone(true)
    } catch (e) {
      console.error(e)
      setError("Failed to add page numbers. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [pdfFile, pdfName, startNumber, template, fontSize, color, opacity, position, margin, renderLabel])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Add Page Numbers" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Hash className="size-4" />
              <span>PDF utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Add page numbers to a PDF</h1>
            <p className="text-lg text-muted-foreground">Place page numbers at the top or bottom, left/center/right. Customize template, font size, color, and margins.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="slate" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <FileText className="size-4" />
                    Upload PDF
                  </h2>
                  {(pdfFile || error || done) && (
                    <Button variant="ghost" size="sm" onClick={() => { setPdfFile(null); setPdfName(""); setDone(false); setError(null) }} className="text-muted-foreground hover:text-foreground">
                      <RefreshCcw className="size-4" />
                      Reset
                    </Button>
                  )}
                </div>

                <input type="file" accept="application/pdf" onChange={handlePdfSelect} className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm" />
                {pdfName && <p className="text-xs text-muted-foreground">Selected: {pdfName}</p>}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Start number</span>
                    <input type="number" min={1} max={100000} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Font size</span>
                    <input type="number" min={6} max={48} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Color</span>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 rounded-md border border-border bg-background px-2" />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Opacity</span>
                    <input type="number" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                  </label>

                  <label className="flex flex-col gap-1 col-span-2">
                    <span className="text-muted-foreground">Template</span>
                    <input
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2"
                      placeholder="Page {n} of {total}"
                    />
                    <span className="text-xs text-muted-foreground">Use {'{n}'} for the current page number and {'{total}'} for total pages.</span>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Position</span>
                    <select className="rounded-md border border-border bg-background px-3 py-2" value={position} onChange={(e) => setPosition(e.target.value as PositionPreset)}>
                      <option value="bottom-left">Bottom-left</option>
                      <option value="bottom-center">Bottom-center</option>
                      <option value="bottom-right">Bottom-right</option>
                      <option value="top-left">Top-left</option>
                      <option value="top-center">Top-center</option>
                      <option value="top-right">Top-right</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Margin (px)</span>
                    <input type="number" min={0} max={200} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                  </label>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button onClick={addPageNumbers} disabled={!canProcess || isProcessing} className="w-full justify-center">
                  {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  {isProcessing ? "Adding numbers" : "Download numbered PDF"}
                </Button>
                {done && <p className="text-sm text-muted-foreground flex items-center gap-2"><Check className="size-4" /> Download started</p>}
              </div>

              <div className="space-y-4">
                <h2 className="font-medium flex items-center gap-2">
                  <Type className="size-4" />
                  Tips
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Use template "{`{n}`}" for simple numbering or "Page {`{n}`} of {`{total}`}" for totals.</li>
                  <li>Bottom-center is the most common placement; set margin to 24–36 for comfortable spacing.</li>
                  <li>Use opacity around 0.8–1.0 for legibility over complex pages.</li>
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
