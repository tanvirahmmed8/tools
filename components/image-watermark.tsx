"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { Download, Image as ImageIcon, Loader2, RefreshCcw, Sparkles } from "lucide-react"
import JSZip from "jszip"

interface ImageItem {
  file: File
  url: string
  outUrl?: string
  outName?: string
}

type Position = "top-left" | "top-right" | "center" | "bottom-left" | "bottom-right"
type Mode = "text" | "image"

export function ImageWatermark() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [text, setText] = useState("© Your Brand")
  const [color, setColor] = useState("rgba(255,255,255,0.8)")
  const [fontSize, setFontSize] = useState(36)
  const [position, setPosition] = useState<Position>("bottom-right")
  const [opacity, setOpacity] = useState(80) // 0-100
  const [margin, setMargin] = useState(24)
  const [shadow, setShadow] = useState(true)
  const [mode, setMode] = useState<Mode>("text")
  const [wmUrl, setWmUrl] = useState<string | null>(null)
  const [wmName, setWmName] = useState<string>("")
  const [wmScale, setWmScale] = useState(20)
  useEffect(() => () => { if (wmUrl) URL.revokeObjectURL(wmUrl) }, [wmUrl])

  useEffect(() => () => { items.forEach((i) => URL.revokeObjectURL(i.url)) }, [items])

  const addFiles = useCallback((files: File[]) => {
    const accepted = files.filter((f) => f.type.startsWith("image/"))
    if (!accepted.length) {
      setError("Please add image files.")
      return
    }
    const newItems = accepted.map((f) => ({ file: f, url: URL.createObjectURL(f) }))
    setItems((prev) => [...prev, ...newItems])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault(); setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []))
  }, [addFiles])

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url))
    items.forEach((i) => i.outUrl && URL.revokeObjectURL(i.outUrl))
    setItems([])
    setError(null)
  }

  const remove = (idx: number) => {
    setItems((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[idx].url)
      if (next[idx].outUrl) URL.revokeObjectURL(next[idx].outUrl as string)
      next.splice(idx, 1)
      return next
    })
  }

  const drawWatermark = async (srcUrl: string, name: string): Promise<{ url: string; name: string }> => {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = reject
      im.src = srcUrl
    })
    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported")

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const alpha = Math.max(0, Math.min(1, opacity / 100))
    let x = margin
    let y = canvas.height - margin

    if (mode === "image" && wmUrl) {
      const wmImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image()
        im.onload = () => resolve(im)
        im.onerror = reject
        im.src = wmUrl
      })
      const targetWidth = Math.max(1, Math.round((wmScale / 100) * canvas.width))
      const scale = targetWidth / (wmImg.naturalWidth || wmImg.width || 1)
      const w = targetWidth
      const h = Math.round((wmImg.naturalHeight || wmImg.height || 1) * scale)

      switch (position) {
        case "top-left":
          x = margin
          y = margin
          break
        case "top-right":
          x = canvas.width - margin - w
          y = margin
          break
        case "center":
          x = (canvas.width - w) / 2
          y = (canvas.height - h) / 2
          break
        case "bottom-left":
          x = margin
          y = canvas.height - margin - h
          break
        case "bottom-right":
        default:
          x = canvas.width - margin - w
          y = canvas.height - margin - h
      }
      ctx.globalAlpha = alpha
      ctx.drawImage(wmImg, x, y, w, h)
    } else {
      ctx.fillStyle = color
      ctx.textBaseline = "bottom"
      const px = Math.max(8, Math.min(256, fontSize))
      ctx.font = `${px}px sans-serif`
      const textMetrics = ctx.measureText(text)
      const textWidth = textMetrics.width
      const textHeight = px

      switch (position) {
        case "top-left":
          x = margin
          y = margin + textHeight
          break
        case "top-right":
          x = canvas.width - margin - textWidth
          y = margin + textHeight
          break
        case "center":
          x = (canvas.width - textWidth) / 2
          y = (canvas.height + textHeight) / 2
          break
        case "bottom-left":
          x = margin
          y = canvas.height - margin
          break
        case "bottom-right":
        default:
          x = canvas.width - margin - textWidth
          y = canvas.height - margin
      }

      if (shadow) {
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.shadowColor = "rgba(0,0,0,0.6)"
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 2
        ctx.fillText(text, x, y)
        ctx.restore()
      }

      ctx.fillStyle = color
      ctx.globalAlpha = alpha
      ctx.fillText(text, x, y)
    }

    const outUrl = canvas.toDataURL("image/png")
    const outName = name.replace(/\.[^.]+$/, "") + "-watermarked.png"
    return { url: outUrl, name: outName }
  }

  const processAll = useCallback(async () => {
    if (!items.length) return
    setIsProcessing(true)
    setError(null)
    try {
      const processed = await Promise.all(
        items.map(async (it) => {
          const { url, name } = await drawWatermark(it.url, it.file.name)
          return { ...it, outUrl: url, outName: name }
        })
      )
      setItems(processed)
    } catch (e) {
      console.error(e)
      setError("Failed to watermark images. Try different settings.")
    } finally {
      setIsProcessing(false)
    }
  }, [items, text, color, fontSize, position, opacity, margin, shadow, mode, wmUrl, wmScale])

  const downloadOne = (it: ImageItem) => {
    if (!it.outUrl) return
    const a = document.createElement("a")
    a.href = it.outUrl
    a.download = it.outName || "watermarked.png"
    a.click()
  }

  const downloadZip = async () => {
    const ready = items.filter((i) => i.outUrl)
    if (!ready.length) return
    const zip = new JSZip()
    ready.forEach((i, idx) => {
      const base64 = (i.outUrl as string).split(",")[1] ?? ""
      const name = i.outName || `image-${idx + 1}.png`
      zip.file(name, base64, { base64: true })
    })
    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "watermarked-images.zip"
    a.click()
    URL.revokeObjectURL(url)
  }

  const canProcess = items.length > 0 && !isProcessing
  const anyReady = useMemo(() => items.some((i) => i.outUrl), [items])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Image Watermark" />
      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Watermark images</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Protect images with text or PNG watermarks</h1>
            <p className="text-lg text-muted-foreground">Add a text watermark or overlay a transparent PNG logo. Control position, size, color, and opacity.</p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="teal" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <ImageIcon className="size-4" />
                    Add Images
                  </h2>
                  {items.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                      <RefreshCcw className="mr-1 size-4" />
                      Clear
                    </Button>
                  )}
                </div>

                <label
                  className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-all duration-200 ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                  onDrop={handleDrop}
                >
                  <input type="file" multiple accept="image/*" onChange={handleSelect} className="sr-only" />
                  <ImageIcon className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your images here" : "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Supports PNG, JPG, and more</p>
                </label>

                {items.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4 max-h-[360px] overflow-auto">
                    <p className="text-sm font-medium">Selected</p>
                    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {items.map((it, i) => (
                        <li key={i} className="rounded border border-border/60 bg-background p-2 text-xs">
                          <img src={it.url} className="aspect-square w-full rounded object-cover" alt="preview" />
                          <div className="mt-2 truncate" title={it.file.name}>{it.file.name}</div>
                          {it.outUrl ? (
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" onClick={() => downloadOne(it)} className="w-full">
                                <Download className="mr-2 size-4" />
                                Download
                              </Button>
                            </div>
                          ) : null}
                          <div className="mt-1 text-muted-foreground truncate" title={it.outName || ""}>{it.outName || ""}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Watermark type</label>
                      <div className="flex gap-2">
                        <Button type="button" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>Text</Button>
                        <Button type="button" variant={mode === "image" ? "default" : "outline"} onClick={() => setMode("image")}>PNG Image</Button>
                      </div>
                    </div>

                    {mode === "text" ? (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">Watermark text</label>
                          <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="© Your Brand" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Font size (px)</label>
                          <input type="number" min={8} max={256} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value || "36", 10))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Color</label>
                          <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="rgba(255,255,255,0.8) or #ffffff" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                            Add shadow for contrast
                          </label>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">PNG watermark image</label>
                          <div className="flex items-center gap-3">
                            <input type="file" accept="image/png,image/webp,image/svg+xml" onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (!f) return
                              if (wmUrl) URL.revokeObjectURL(wmUrl)
                              setWmUrl(URL.createObjectURL(f))
                              setWmName(f.name)
                            }} />
                          </div>
                          {wmUrl && (
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              <img src={wmUrl} alt="watermark" className="h-8 w-auto rounded border border-border bg-white" />
                              <span className="truncate">{wmName}</span>
                              <Button size="sm" variant="ghost" onClick={() => { if (wmUrl) URL.revokeObjectURL(wmUrl); setWmUrl(null); setWmName("") }}>Remove</Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Scale: {wmScale}% of image width</label>
                          <input type="range" min={5} max={100} value={wmScale} onChange={(e) => setWmScale(parseInt(e.target.value, 10))} className="w-full" />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opacity: {opacity}%</label>
                      <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(parseInt(e.target.value, 10))} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Position</label>
                      <select value={position} onChange={(e) => setPosition(e.target.value as Position)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="top-left">Top left</option>
                        <option value="top-right">Top right</option>
                        <option value="center">Center</option>
                        <option value="bottom-left">Bottom left</option>
                        <option value="bottom-right">Bottom right</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Margin (px)</label>
                      <input type="number" min={0} max={512} value={margin} onChange={(e) => setMargin(parseInt(e.target.value || "24", 10))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button onClick={processAll} disabled={!canProcess}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      {isProcessing ? "Applying" : "Apply Watermark"}
                    </Button>
                    <Button variant="outline" onClick={downloadZip} disabled={!anyReady}>Download all (ZIP)</Button>
                  </div>

                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                </div>
              </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>
      <SiteFooter />
    </div>
  )
}
