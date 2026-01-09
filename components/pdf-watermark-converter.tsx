"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { Check, Download, FileText, Image as ImageIcon, Loader2, RefreshCcw, Type } from "lucide-react"
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib"

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

type PositionPreset = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"

type Mode = "text" | "image"

type PdfWatermarkConverterProps = { children?: ReactNode }

export function PdfWatermarkConverter({ children }: PdfWatermarkConverterProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")

  const [mode, setMode] = useState<Mode>("text")
  // Text options
  const [wmText, setWmText] = useState("CONFIDENTIAL")
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState("#111827")
  const [textOpacity, setTextOpacity] = useState(0.15)
  const [rotation, setRotation] = useState(45)
  const [position, setPosition] = useState<PositionPreset>("center")

  // Image options
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgOpacity, setImgOpacity] = useState(0.15)
  const [imgScale, setImgScale] = useState(60) // percent of page width

  const [allPages, setAllPages] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setDone(false), [mode, wmText, fontSize, textColor, textOpacity, rotation, position, imgFile, imgOpacity, imgScale, allPages, pdfFile])

  const canProcess = useMemo(() => {
    if (!pdfFile) return false
    if (mode === "text") return wmText.trim().length > 0
    return !!imgFile
  }, [pdfFile, mode, wmText, imgFile])

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

  const handleImgSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please upload a PNG/JPG watermark image.")
      return
    }
    setImgFile(file)
    setError(null)
  }, [])

  const applyWatermark = useCallback(async () => {
    if (!pdfFile) return

    setIsProcessing(true)
    setError(null)
    setDone(false)

    try {
      const pdfBytes = await fileToArrayBuffer(pdfFile)
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // Prepare resources
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
      let embeddedImage: any = null
      if (mode === "image" && imgFile) {
        const imgBytes = await fileToArrayBuffer(imgFile)
        if (imgFile.type.includes("png")) embeddedImage = await pdfDoc.embedPng(imgBytes)
        else embeddedImage = await pdfDoc.embedJpg(imgBytes)
      }

      const pages = pdfDoc.getPages()
      const applyTo = allPages ? pages : [pages[0]]

      for (const page of applyTo) {
        const { width, height } = page.getSize()

        if (mode === "text") {
          const color = hexToRgb1(textColor)
          const textWidth = helvetica.widthOfTextAtSize(wmText, fontSize)
          const textHeight = helvetica.heightAtSize(fontSize)

          let x = (width - textWidth) / 2
          let y = (height - textHeight) / 2

          if (position !== "center") {
            const pad = 24
            if (position === "top-left") { x = pad; y = height - textHeight - pad }
            if (position === "top-right") { x = width - textWidth - pad; y = height - textHeight - pad }
            if (position === "bottom-left") { x = pad; y = pad }
            if (position === "bottom-right") { x = width - textWidth - pad; y = pad }
          }

          page.drawText(wmText, {
            x,
            y,
            size: fontSize,
            font: helvetica,
            color: rgb(color.r, color.g, color.b),
            opacity: textOpacity,
            rotate: degrees(rotation),
          })
        } else if (mode === "image" && embeddedImage) {
          const imgW = embeddedImage.width
          const imgH = embeddedImage.height
          const scale = Math.max(0.02, Math.min(3, (imgScale / 100) * (width / imgW)))
          const drawW = imgW * scale
          const drawH = imgH * scale

          let x = (width - drawW) / 2
          let y = (height - drawH) / 2

          const pad = 24
          if (position === "top-left") { x = pad; y = height - drawH - pad }
          if (position === "top-right") { x = width - drawW - pad; y = height - drawH - pad }
          if (position === "bottom-left") { x = pad; y = pad }
          if (position === "bottom-right") { x = width - drawW - pad; y = pad }

          page.drawImage(embeddedImage, {
            x,
            y,
            width: drawW,
            height: drawH,
            opacity: imgOpacity,
            rotate: degrees(rotation),
          })
        }
      }

      const outBytes = await pdfDoc.save()
      const baseBuffer = (outBytes as Uint8Array).buffer as ArrayBuffer
      const copy = baseBuffer.slice(outBytes.byteOffset, outBytes.byteOffset + outBytes.byteLength)
      const blob = new Blob([copy], { type: "application/pdf" })
      const name = pdfName ? pdfName.replace(/\.pdf$/i, "") + "-watermarked.pdf" : "watermarked.pdf"
      downloadBlob(name, blob)
      setDone(true)
    } catch (e) {
      console.error(e)
      setError("Failed to apply watermark. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [pdfFile, mode, imgFile, allPages, wmText, fontSize, textColor, textOpacity, rotation, position, imgOpacity, imgScale, pdfName])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Add PDF Watermark" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Type className="size-4" />
              <span>PDF utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Add text or image watermark to a PDF</h1>
            <p className="text-lg text-muted-foreground">Overlay a semi-transparent text or PNG logo across one or all pages, then download the result.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="slate" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left: Inputs */}
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
                  <label className="flex items-center gap-2">
                    <input type="radio" name="mode" checked={mode === "text"} onChange={() => setMode("text")} />
                    <span>Text watermark</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="mode" checked={mode === "image"} onChange={() => setMode("image")} />
                    <span>Image watermark</span>
                  </label>
                </div>

                {mode === "text" ? (
                  <div className="space-y-3">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-muted-foreground">Text</span>
                      <input value={wmText} onChange={(e) => setWmText(e.target.value)} placeholder="CONFIDENTIAL" className="rounded-md border border-border bg-background px-3 py-2" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Font size</span>
                        <input type="number" min={8} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Opacity</span>
                        <input type="number" min={0} max={1} step={0.05} value={textOpacity} onChange={(e) => setTextOpacity(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Rotation (deg)</span>
                        <input type="number" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Color</span>
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10 rounded-md border border-border bg-background px-2" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-muted-foreground">PNG/JPG watermark image</span>
                      <input type="file" accept="image/*" onChange={handleImgSelect} className="rounded-md border border-border bg-background px-3 py-2" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Opacity</span>
                        <input type="number" min={0} max={1} step={0.05} value={imgOpacity} onChange={(e) => setImgOpacity(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Scale (% page width)</span>
                        <input type="number" min={2} max={300} value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        <span className="text-muted-foreground">Rotation (deg)</span>
                        <input type="number" min={-180} max={180} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="rounded-md border border-border bg-background px-3 py-2" />
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Position</span>
                    <select className="rounded-md border border-border bg-background px-3 py-2" value={position} onChange={(e) => setPosition(e.target.value as PositionPreset)}>
                      <option value="center">Center</option>
                      <option value="top-left">Top-left</option>
                      <option value="top-right">Top-right</option>
                      <option value="bottom-left">Bottom-left</option>
                      <option value="bottom-right">Bottom-right</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={allPages} onChange={(e) => setAllPages(e.target.checked)} />
                    <span>Apply to all pages</span>
                  </label>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button onClick={applyWatermark} disabled={!canProcess || isProcessing} className="w-full justify-center">
                  {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  {isProcessing ? "Applying watermark" : "Download watermarked PDF"}
                </Button>
                {done && <p className="text-sm text-muted-foreground flex items-center gap-2"><Check className="size-4" /> Download started</p>}
              </div>

              {/* Right: Tips */}
              <div className="space-y-4">
                <h2 className="font-medium flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Tips
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Use a transparent PNG logo for best results with image watermarks.</li>
                  <li>Keep opacity between 0.1 and 0.25 to avoid obscuring content.</li>
                  <li>Rotation at ~45° helps discourage copying while staying legible.</li>
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
