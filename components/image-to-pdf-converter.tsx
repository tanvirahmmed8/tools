"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, FileImage, Loader2, Sparkles, Upload, X, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { imagesToPdf } from "@/app/actions"

const ACCEPTED = ["image/png", "image/jpeg"]

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
  for (let i = 0; i < length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

type ImageItem = { file: File; url: string }

export function ImageToPdfConverter() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState("images.pdf")

  useEffect(() => () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl) }, [pdfUrl])

  const addFiles = useCallback((files: File[]) => {
    const accepted = files.filter((f) => ACCEPTED.includes(f.type))
    const rejected = files.filter((f) => !ACCEPTED.includes(f.type))
    if (rejected.length) setError("Only PNG and JPG images are supported.")
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
    setItems([])
    setPdfUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null })
    setError(null)
  }

  const move = (index: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  const remove = (index: number) => {
    setItems((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].url)
      next.splice(index, 1)
      return next
    })
  }

  const canConvert = items.length > 0 && !isConverting

  const handleConvert = useCallback(async () => {
    if (!items.length) return
    setIsConverting(true)
    setError(null)
    try {
      const list = await Promise.all(items.map((i) => fileToBase64(i.file)))
      const result = await imagesToPdf(list)
      setPdfName(result.fileName)
      setPdfUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(base64ToBlob(result.pdfBase64, "application/pdf")) })
    } catch (e) {
      console.error(e)
      setError("Conversion failed. Please try again.")
    } finally {
      setIsConverting(false)
    }
  }, [items])

  const downloadPdf = () => {
    if (!pdfUrl) return
    const a = document.createElement("a")
    a.href = pdfUrl
    a.download = pdfName
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Image to PDF" />
      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Image to PDF</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Convert images to PDF</h1>
            <p className="text-lg text-muted-foreground">Add PNG or JPG images, arrange the order, and download as a single PDF.</p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <Card className="border-border/70 bg-card/90 p-6 md:p-8 shadow-xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Upload className="size-4" />
                    Add Images
                  </h2>
                  {items.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                      <X className="mr-1 size-4" />
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
                  <input type="file" multiple accept="image/png,image/jpeg" onChange={handleSelect} className="sr-only" />
                  <FileImage className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your images here" : "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Supports PNG and JPG</p>
                </label>

                {items.length > 0 && (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Order</p>
                    <ul className="space-y-2 max-h-[300px] overflow-auto pr-1">
                      {items.map((it, i) => (
                        <li key={i} className="flex items-center gap-2 rounded border border-border/60 bg-background p-2 text-sm">
                          <img src={it.url} alt="preview" className="size-10 rounded object-cover border border-border" />
                          <span className="truncate flex-1">{i + 1}. {it.file.name}</span>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => move(i, -1)} title="Move up">
                              <ArrowUp className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => move(i, 1)} title="Move down">
                              <ArrowDown className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => remove(i)} title="Remove">
                              <X className="size-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Conversion status</p>
                      <p className="text-lg font-semibold">{items.length ? `${items.length} images ready` : "No images selected"}</p>
                    </div>
                    <Button onClick={handleConvert} disabled={!canConvert}>
                      {isConverting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileImage className="mr-2 size-4" />}
                      {isConverting ? "Converting" : "Create PDF"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {pdfUrl && !error && !isConverting && (
                    <p className="mt-3 text-sm text-muted-foreground">Conversion complete. Download your PDF below.</p>
                  )}
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">PDF download</p>
                      <p className="text-xs text-muted-foreground">{pdfUrl ? pdfName : "Convert to enable download"}</p>
                    </div>
                    <Button onClick={downloadPdf} disabled={!pdfUrl || isConverting}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PageContainer>
      </section>
    </div>
  )
}
