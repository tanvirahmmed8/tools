"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Loader2, MinusCircle, Palette, PenSquare, Plus, Sparkles, Type, Upload, X } from "lucide-react"

import { editPdf } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"
import { cn } from "@/lib/utils"

const PDF_MIME = "application/pdf"
const COLOR_PRESETS = ["#111827", "#2563eb", "#7c3aed", "#0f766e", "#dc2626", "#f97316"] as const
const POSITIONS = [
  { label: "Top", value: "top" },
  { label: "Middle", value: "middle" },
  { label: "Bottom", value: "bottom" },
] as const
const ALIGNMENTS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
] as const

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Unable to read the selected file."))
    reader.readAsDataURL(file)
  })

const base64ToBlob = (base64: string, mimeType: string) => {
  const binary = atob(base64)
  const length = binary.length
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

type TextBlock = {
  id: string
  page: string
  text: string
  position: (typeof POSITIONS)[number]["value"]
  align: (typeof ALIGNMENTS)[number]["value"]
  fontSize: number
  color: string
}

type PdfEditConverterProps = {
  children?: ReactNode
}

const createBlock = (overrides?: Partial<TextBlock>): TextBlock => ({
  id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
  page: "1",
  text: "",
  position: "top",
  align: "left",
  fontSize: 16,
  color: "#111827",
  ...overrides,
})

export function PdfEditConverter({ children }: PdfEditConverterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([createBlock()])
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState("edited-document.pdf")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl)
      }
    }
  }, [resultUrl])

  const resetResults = useCallback(() => {
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setResultFileName("edited-document.pdf")
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file.type !== PDF_MIME) {
      setError("Please upload a PDF file under 20 MB.")
      return
    }
    setSelectedFile(file)
    setPdfName(file.name)
    setPageCount(null)
    setError(null)
    resetResults()
    // Page count detection requires pdf-lib on the server; keep UI flexible and rely on validation there
  }, [resetResults])

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPdfName("")
    setTextBlocks([createBlock()])
    setTitle("")
    setAuthor("")
    setError(null)
    resetResults()
  }, [resetResults])

  const updateBlock = useCallback((id: string, patch: Partial<TextBlock>) => {
    setTextBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)))
  }, [])

  const addBlock = useCallback(() => {
    setTextBlocks((current) => [...current, createBlock({ page: current.length ? String(current.length + 1) : "1" })])
  }, [])

  const removeBlock = useCallback((id: string) => {
    setTextBlocks((current) => (current.length === 1 ? current : current.filter((block) => block.id !== id)))
  }, [])

  const filledBlocks = useMemo(() => textBlocks.filter((block) => block.text.trim().length), [textBlocks])

  const handleEdit = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload the PDF you want to edit.")
      return
    }
    if (!filledBlocks.length) {
      setError("Add at least one text block with content before exporting.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const base64 = await fileToBase64(selectedFile)
      const payload = filledBlocks.map((block) => ({
        page: Number(block.page),
        text: block.text.trim(),
        position: block.position,
        align: block.align,
        fontSize: block.fontSize,
        color: block.color,
      }))

      const metadata = {
        title: title.trim() || undefined,
        author: author.trim() || undefined,
      }

      const result = await editPdf(base64, { edits: payload, metadata })
      setPageCount(result.totalPages ?? null)
      setResultFileName(result.fileName)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (editError) {
      console.error(editError)
      const message = editError instanceof Error ? editError.message : "Failed to edit the PDF."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [author, filledBlocks, resetResults, selectedFile, title])

  const downloadEditedPdf = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = resultFileName
    link.click()
  }, [resultFileName, resultUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Edit PDF" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Lightweight PDF markup</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Add notes, headers, or quick fixes to any PDF</h1>
            <p className="text-lg text-muted-foreground">
              Drop a PDF, stack text blocks across pages, tweak colors, and refresh metadata — all without leaving the browser.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="magenta" className="p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Upload className="size-4" />
                    Upload PDF
                  </h2>
                  {selectedFile && (
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
                      <X className="mr-1 size-4" />
                      Clear
                    </Button>
                  )}
                </div>

                <label
                  className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-all duration-200 ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    setIsDragging(false)
                  }}
                  onDrop={handleDrop}
                >
                  <input type="file" accept={PDF_MIME} onChange={handleFileSelect} className="sr-only" />
                  <PenSquare className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB • edits stay on-device</p>
                </label>

                <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">Document title (optional)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. Q1 Partner Brief"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Author (optional)</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(event) => setAuthor(event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Team or owner name"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Text blocks</p>
                    <Button variant="outline" size="sm" onClick={addBlock} className="gap-1">
                      <Plus className="size-4" />
                      Add block
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Each block can target a different page, position, alignment, and color.</p>
                </div>

                <div className="space-y-3">
                  {textBlocks.map((block, index) => (
                    <div key={block.id} className="rounded-xl border border-border bg-background/80 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Block {index + 1}</p>
                        <button
                          type="button"
                          className={cn("text-xs text-muted-foreground", textBlocks.length === 1 && "opacity-50 cursor-not-allowed")}
                          onClick={() => removeBlock(block.id)}
                          disabled={textBlocks.length === 1}
                        >
                          <MinusCircle className="mr-1 inline size-3.5" />Remove
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Page</label>
                          <input
                            type="number"
                            min={1}
                            value={block.page}
                            onChange={(event) => updateBlock(block.id, { page: event.target.value })}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Font size</label>
                          <input
                            type="number"
                            min={8}
                            max={48}
                            value={block.fontSize}
                            onChange={(event) => updateBlock(block.id, { fontSize: Number(event.target.value) })}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</label>
                          <select
                            value={block.position}
                            onChange={(event) => updateBlock(block.id, { position: event.target.value as TextBlock["position"] })}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {POSITIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Alignment</label>
                          <select
                            value={block.align}
                            onChange={(event) => updateBlock(block.id, { align: event.target.value as TextBlock["align"] })}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            {ALIGNMENTS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">Color</label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={cn(
                                  "size-7 rounded-full border border-border",
                                  block.color === color ? "ring-2 ring-offset-2 ring-primary" : "opacity-70 hover:opacity-100"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => updateBlock(block.id, { color })}
                              >
                                <span className="sr-only">{color}</span>
                              </button>
                            ))}
                            <label className="inline-flex size-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                              <Palette className="size-3" />
                              <input
                                type="color"
                                value={block.color}
                                onChange={(event) => updateBlock(block.id, { color: event.target.value })}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <Type className="size-3.5" />
                          Text
                        </label>
                        <textarea
                          value={block.text}
                          onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                          rows={3}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Add notes, headers, or inline comments..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Edit status</p>
                      <p className="text-lg font-semibold">{pdfName || "No PDF selected"}</p>
                      {pageCount ? (
                        <p className="mt-1 text-xs text-muted-foreground">{pageCount} total pages</p>
                      ) : null}
                    </div>
                    <Button onClick={handleEdit} disabled={!selectedFile || !filledBlocks.length || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      {isProcessing ? "Applying" : "Export edits"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {resultUrl && !error && !isProcessing && (
                    <p className="mt-3 text-sm text-muted-foreground">Edits applied. Download the updated PDF below.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Edited PDF</p>
                      <p className="text-xs text-muted-foreground">
                        {resultUrl ? resultFileName : "Export edits to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadEditedPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  {filledBlocks.length ? (
                    <p className="text-xs text-muted-foreground">Active blocks: {filledBlocks.length}</p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Need advanced layout edits?</p>
                  <p className="mt-2">
                    Use text blocks for lightweight annotations. For structural changes (tables, media, or merges), pair this tool with Rearrange, Rotate, or Unlock to keep your workflow fast.
                  </p>
                </div>
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
