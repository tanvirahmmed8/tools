"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Download, MousePointer2, RefreshCcw, Square, TextCursorInput, Type } from "lucide-react"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

// Lazy-load pdfjs to ensure we only touch DOM APIs in the browser
async function getPdfJs() {
  const mod: any = await import("pdfjs-dist")
  const apiVersion: string = mod.version || "4.10.38"
  mod.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${apiVersion}/build/pdf.worker.min.mjs`
  return mod
}

type Tool = "select" | "text" | "rect"

type OverlayItemBase = {
  id: string
  pageIndex: number
  x: number // in px relative to rendered viewport
  y: number // in px relative to rendered viewport (top-left origin)
}

type TextItem = OverlayItemBase & {
  kind: "text"
  text: string
  fontSize: number // px
  color: string // hex
}

type RectItem = OverlayItemBase & {
  kind: "rect"
  w: number
  h: number
  color: string // fill color
}

type Item = TextItem | RectItem

function uid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

export function PdfVisualEditor({ children }: { children?: React.ReactNode }) {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pagesRendered, setPagesRendered] = useState(0)

  const [tool, setTool] = useState<Tool>("text")
  const [color, setColor] = useState("#111827")
  const [fontSize, setFontSize] = useState(16)

  const [items, setItems] = useState<Item[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const overlayRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const viewportSizes = useRef<Map<number, { width: number; height: number }>>(new Map())

  // Drag state
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  // Load PDF via PDF.js and render to canvases
  useEffect(() => {
    let cancelled = false
    async function render() {
      if (!arrayBuffer) return
      setPagesRendered(0)
      const pdfjsLib = await getPdfJs()
      const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      if (cancelled) return
      setNumPages(pdf.numPages)

      // Clear existing
      viewportSizes.current.clear()
      overlayRefs.current.clear()
      if (containerRef.current) containerRef.current.innerHTML = ""

      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i)
        const scale = 1.3
        const viewport = page.getViewport({ scale })

        const pageWrap = document.createElement("div")
        pageWrap.className = "relative mb-6"
        pageWrap.style.width = `${viewport.width}px`
        pageWrap.style.height = `${viewport.height}px`

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`

        pageWrap.appendChild(canvas)

        // Overlay container
        const overlay = document.createElement("div")
        overlay.className = "absolute left-0 top-0"
        overlay.style.width = `${viewport.width}px`
        overlay.style.height = `${viewport.height}px`
        overlay.style.pointerEvents = "none"
        pageWrap.appendChild(overlay)

        containerRef.current?.appendChild(pageWrap)

        // Render page bitmap
        const renderTask = page.render({ canvasContext: ctx, viewport })
        await renderTask.promise

        viewportSizes.current.set(i - 1, { width: viewport.width, height: viewport.height })
        overlayRefs.current.set(i - 1, overlay)
        setPagesRendered((p) => p + 1)
      }
    }

    render().catch((e) => console.error(e))
    return () => { cancelled = true }
  }, [arrayBuffer])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== "application/pdf") return
    setFile(f)
    setFileName(f.name)
    f.arrayBuffer().then(setArrayBuffer)
    setItems([])
    setSelectedId(null)
  }, [])

  const onCanvasClick = useCallback((pageIndex: number, e: React.MouseEvent) => {
    if (tool === "select") return
    const overlay = overlayRefs.current.get(pageIndex)
    if (!overlay) return
    const rect = overlay.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (tool === "text") {
      const id = uid()
      const newItem: TextItem = { id, kind: "text", pageIndex, x, y, text: "Double-click to edit", color, fontSize }
      setItems((prev) => [...prev, newItem])
      setSelectedId(id)
    } else if (tool === "rect") {
      const id = uid()
      const w = 240, h = 40
      const newItem: RectItem = { id, kind: "rect", pageIndex, x: Math.max(0, x - w / 2), y: Math.max(0, y - h / 2), w, h, color }
      setItems((prev) => [...prev, newItem])
      setSelectedId(id)
    }
  }, [tool, color, fontSize])

  const startDrag = useCallback((id: string, pageIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const overlay = overlayRefs.current.get(pageIndex)
    if (!overlay) return
    const rect = overlay.getBoundingClientRect()
    const item = items.find((it) => it.id === id)
    if (!item) return
    const offsetX = e.clientX - rect.left - item.x
    const offsetY = e.clientY - rect.top - item.y
    dragState.current = { id, offsetX, offsetY }
    setSelectedId(id)
  }, [items])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const drag = dragState.current
      if (!drag) return
      const item = items.find((it) => it.id === drag.id)
      if (!item) return
      const overlay = overlayRefs.current.get(item.pageIndex)
      if (!overlay) return
      const rect = overlay.getBoundingClientRect()
      const nx = e.clientX - rect.left - drag.offsetX
      const ny = e.clientY - rect.top - drag.offsetY
      setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, x: Math.max(0, Math.min(nx, rect.width - ("w" in it ? it.w : 0))) , y: Math.max(0, Math.min(ny, rect.height - ("h" in it ? it.h : 0))) } as Item : it))
    }
    function onUp() { dragState.current = null }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [items])

  const updateSelected = useCallback((patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === selectedId ? ({ ...(it as any), ...(patch as any) } as Item) : it)))
  }, [selectedId])

  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId])

  const removeSelected = useCallback(() => {
    if (!selectedId) return
    setItems((prev) => prev.filter((i) => i.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const exportPdf = useCallback(async () => {
    if (!arrayBuffer) return
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    for (const it of items) {
      const page = pdfDoc.getPage(it.pageIndex)
      const { width: vw, height: vh } = viewportSizes.current.get(it.pageIndex) || { width: 1, height: 1 }
      const pageW = page.getWidth()
      const pageH = page.getHeight()
      const scaleX = pageW / vw
      const scaleY = pageH / vh
      if (it.kind === "text") {
        const x = it.x * scaleX
        const yTop = it.y * scaleY
        const y = pageH - yTop - it.fontSize // convert from top-left to bottom-left
        const { r, g, b } = hexToRgb01(it.color)
        page.drawText(it.text, { x, y, size: it.fontSize, font: helvetica, color: rgb(r, g, b) })
      } else {
        const x = it.x * scaleX
        const yTop = it.y * scaleY
        const w = it.w * scaleX
        const h = it.h * scaleY
        const y = pageH - yTop - h
        const { r, g, b } = hexToRgb01(it.color)
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(r, g, b) })
      }
    }
    const out = await pdfDoc.save()
    const baseBuffer = (out as Uint8Array).buffer as ArrayBuffer
    const copy = baseBuffer.slice(out.byteOffset, out.byteOffset + out.byteLength)
    const blob = new Blob([copy], { type: "application/pdf" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = fileName ? fileName.replace(/\.pdf$/i, "") + "-edited.pdf" : "edited.pdf"
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }, [arrayBuffer, items, fileName])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Edit PDF" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Type className="size-4" />
              <span>Visual PDF editor</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Edit PDFs visually in your browser</h1>
            <p className="text-lg text-muted-foreground">Add text, move it around, change colors, or overlay rectangles to cover and replace content. Export flattens edits into a new PDF.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="magenta" className="p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <input type="file" accept="application/pdf" onChange={onFileChange} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Button variant={tool === "select" ? "default" : "outline"} size="sm" onClick={() => setTool("select")}>
                  <MousePointer2 className="mr-1 size-4" /> Select/Move
                </Button>
                <Button variant={tool === "text" ? "default" : "outline"} size="sm" onClick={() => setTool("text")}>
                  <TextCursorInput className="mr-1 size-4" /> Add Text
                </Button>
                <Button variant={tool === "rect" ? "default" : "outline"} size="sm" onClick={() => setTool("rect")}>
                  <Square className="mr-1 size-4" /> Rectangle
                </Button>
                <label className="flex items-center gap-2 text-sm">
                  <span>Color</span>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <span>Font</span>
                  <input type="number" min={8} max={64} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-20 rounded-md border border-border bg-background px-2 py-1" />
                </label>
                <Button onClick={exportPdf} disabled={!arrayBuffer || !items.length}>
                  <Download className="mr-1 size-4" /> Export PDF
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
              <div>
                <div ref={containerRef} className="select-none" onClick={(e) => e.stopPropagation()} />
                {arrayBuffer && pagesRendered < numPages ? (
                  <p className="mt-3 text-sm text-muted-foreground">Rendering pages {pagesRendered}/{numPages}…</p>
                ) : null}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-semibold">Properties</p>
                {!selected ? (
                  <p className="mt-2 text-sm text-muted-foreground">Select an item on the page to edit its properties.</p>
                ) : selected.kind === "text" ? (
                  <div className="mt-3 space-y-3">
                    <label className="block text-xs font-medium text-muted-foreground">Text</label>
                    <textarea
                      value={selected.text}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      className="w-full rounded-md border border-border bg-background p-2 text-sm"
                      rows={4}
                    />
                    <label className="block text-xs font-medium text-muted-foreground">Font size</label>
                    <input type="number" min={8} max={64} value={selected.fontSize} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} className="w-full rounded-md border border-border bg-background p-2 text-sm" />
                    <label className="block text-xs font-medium text-muted-foreground">Color</label>
                    <input type="color" value={selected.color} onChange={(e) => updateSelected({ color: e.target.value })} />
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={removeSelected}>
                        <RefreshCcw className="mr-1 size-4" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <label className="block text-xs font-medium text-muted-foreground">Width</label>
                    <input type="number" min={5} max={2000} value={(selected as RectItem).w} onChange={(e) => updateSelected({ w: Number(e.target.value) } as any)} className="w-full rounded-md border border-border bg-background p-2 text-sm" />
                    <label className="block text-xs font-medium text-muted-foreground">Height</label>
                    <input type="number" min={5} max={2000} value={(selected as RectItem).h} onChange={(e) => updateSelected({ h: Number(e.target.value) } as any)} className="w-full rounded-md border border-border bg-background p-2 text-sm" />
                    <label className="block text-xs font-medium text-muted-foreground">Color</label>
                    <input type="color" value={selected.color} onChange={(e) => updateSelected({ color: e.target.value })} />
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={removeSelected}>
                        <RefreshCcw className="mr-1 size-4" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Render overlay items as absolutely positioned elements */}
            {items.map((it) => {
              const overlay = overlayRefs.current.get(it.pageIndex)
              if (!overlay) return null
              const style: React.CSSProperties = {
                position: "absolute",
                left: it.x,
                top: it.y,
                pointerEvents: "auto",
                cursor: tool === "select" ? "move" : "default",
                border: it.id === selectedId ? "1px dashed rgba(59,130,246,0.8)" : undefined,
                padding: it.kind === "text" ? "2px 4px" : undefined,
                background: it.kind === "rect" ? it.color : undefined,
                width: it.kind === "rect" ? (it as RectItem).w : undefined,
                height: it.kind === "rect" ? (it as RectItem).h : undefined,
                color: it.kind === "text" ? (it as TextItem).color : undefined,
                fontSize: it.kind === "text" ? (it as TextItem).fontSize : undefined,
                lineHeight: it.kind === "text" ? 1.2 : undefined,
                userSelect: "none",
              }
              const handleDown = (e: React.MouseEvent) => {
                if (tool === "select") startDrag(it.id, it.pageIndex, e)
                setSelectedId(it.id)
              }
              if (it.kind === "text") {
                return (
                  <div key={it.id} style={style} onMouseDown={handleDown} onDoubleClick={(e) => e.stopPropagation()}>
                    {(it as TextItem).text}
                  </div>
                )
              }
              return (
                <div key={it.id} style={style} onMouseDown={handleDown} />
              )
            })}

            <div className="mt-3 text-xs text-muted-foreground">
              {fileName ? `Editing: ${fileName}` : "Upload a PDF to begin."}
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      {children}
      <SiteFooter />
    </div>
  )
}

function hexToRgb01(hex: string) {
  const m = hex.replace(/#/g, "").trim()
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m
  const n = parseInt(full.slice(0, 6), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return { r: r / 255, g: g / 255, b: b / 255 }
}
