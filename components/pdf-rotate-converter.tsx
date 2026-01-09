"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { PDFDocument } from "pdf-lib"
import { Download, Loader2, RotateCcw, RotateCw, Sparkles, Upload, X } from "lucide-react"
import * as pdfjsLib from "pdfjs-dist"

import { rotatePdfPages } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

const PDF_MIME = "application/pdf"
const ROTATION_OPTIONS = [0, 90, 180, 270] as const
;(pdfjsLib as any).GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs"

type PdfRotateConverterProps = {
  children?: ReactNode
}

type RotationInstruction = { page: number; rotation: number }

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

const normalizeRotation = (angle: number) => ((angle % 360) + 360) % 360

export function PdfRotateConverter({ children }: PdfRotateConverterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [pageRotations, setPageRotations] = useState<number[]>([])
  const [thumbs, setThumbs] = useState<string[]>([])
  const [resultRotations, setResultRotations] = useState<RotationInstruction[]>([])
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState("rotated-document.pdf")
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
    setResultRotations([])
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setResultFileName("rotated-document.pdf")
  }, [])

  const hydratePdfState = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()
    if (!totalPages) {
      throw new Error("This PDF appears to be empty. Upload a file with at least one page.")
    }
    setPageCount(totalPages)
    setPageRotations(Array.from({ length: totalPages }, () => 0))
    setPdfBase64(await fileToBase64(file))

    // Render thumbnails with PDF.js
    const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const newThumbs: string[] = []
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 0.3 })
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      await page.render({ canvasContext: ctx, viewport }).promise
      newThumbs.push(canvas.toDataURL("image/png"))
    }
    setThumbs(newThumbs)
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== PDF_MIME) {
        setError("Please upload a PDF file under 20 MB.")
        return
      }
      try {
        await hydratePdfState(file)
        setSelectedFile(file)
        setPdfName(file.name)
        setError(null)
        resetResults()
      } catch (loadError) {
        console.error(loadError)
        const message = loadError instanceof Error ? loadError.message : "Unable to read the PDF."
        setError(message)
        setSelectedFile(null)
        setPdfBase64(null)
        setPageRotations([])
        setPageCount(null)
      }
    },
    [hydratePdfState, resetResults],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) {
        void handleFile(file)
      }
    },
    [handleFile],
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        void handleFile(file)
      }
    },
    [handleFile],
  )

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPdfName("")
    setPageCount(null)
    setPdfBase64(null)
    setPageRotations([])
    setResultRotations([])
    setError(null)
    resetResults()
  }, [resetResults])

  const updatePageRotation = useCallback((index: number, rotation: number) => {
    setPageRotations((current) => {
      const next = [...current]
      next[index] = normalizeRotation(rotation)
      return next
    })
  }, [])

  const rotatePage = useCallback((index: number, delta: number) => {
    setPageRotations((current) => {
      const next = [...current]
      next[index] = normalizeRotation((next[index] ?? 0) + delta)
      return next
    })
  }, [])

  const rotateAll = useCallback((delta: number) => {
    setPageRotations((current) => current.map((angle) => normalizeRotation(angle + delta)))
  }, [])

  const clearAllRotations = useCallback(() => {
    setPageRotations((current) => current.map(() => 0))
    setResultRotations([])
  }, [])

  const pendingRotations = useMemo(() => {
    return pageRotations
      .map((rotation, index) => ({ page: index + 1, rotation }))
      .filter((entry) => entry.rotation !== 0)
  }, [pageRotations])

  const handleRotate = useCallback(async () => {
    if (!pdfBase64) {
      setError("Upload a PDF before rotating pages.")
      return
    }
    if (!pendingRotations.length) {
      setError("Choose at least one page and rotation direction before exporting.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await rotatePdfPages(pdfBase64, { rotations: pendingRotations })
      setResultFileName(result.fileName)
      setResultRotations(result.rotations)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (rotationError) {
      console.error(rotationError)
      const message = rotationError instanceof Error ? rotationError.message : "Failed to rotate the selected pages."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [pdfBase64, pendingRotations, resetResults])

  const downloadRotatedPdf = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = resultFileName
    link.click()
  }, [resultFileName, resultUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Rotate PDF Pages" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Fix sideways pages</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Rotate single PDF pages before you send the deck</h1>
            <p className="text-lg text-muted-foreground">
              Drag in the PDF, pick the slides that need to face the right direction, and export a polished file without re-opening desktop software.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="amber" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left column: upload and global actions */}
              <div className="space-y-4">
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
                  <RotateCw className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB • loads every page for rotation</p>
                </label>
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm font-semibold">Global actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => rotateAll(-90)} disabled={!pageRotations.length}>
                      <RotateCcw className="mr-1 size-4" /> Rotate all 90° CCW
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => rotateAll(90)} disabled={!pageRotations.length}>
                      <RotateCw className="mr-1 size-4" /> Rotate all 90° CW
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearAllRotations} disabled={!pendingRotations.length}>Reset all</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Rotations happen instantly in the browser.</p>
                </div>
              </div>

              {/* Right column: status, grid thumbnails, and download */}
              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rotation status</p>
                      <p className="text-lg font-semibold">{pdfName || "No PDF selected"}</p>
                      {pageCount ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pageCount} total pages • {pendingRotations.length} queued rotation{pendingRotations.length === 1 ? "" : "s"}
                        </p>
                      ) : null}
                    </div>
                    <Button onClick={handleRotate} disabled={!pendingRotations.length || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      {isProcessing ? "Exporting" : "Rotate pages"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                </div>
                <div className="rounded-xl border border-border bg-background/90 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Click a page to rotate 90°</p>
                    <span className="text-xs text-muted-foreground">{pageRotations.length ? `${pageRotations.length} pages` : "Waiting for PDF"}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {thumbs.length ? (
                      thumbs.map((src, index) => (
                        <div key={index} className="relative rounded-lg border border-border">
                          <div className="absolute left-2 top-2 rounded bg-background/80 px-1 text-xs">{index + 1}</div>
                          <button type="button" className="block w-full" onClick={() => rotatePage(index, 90)} title="Click to rotate 90°">
                            <img src={src} alt={`Page ${index + 1}`} className="w-full rounded-md" />
                          </button>
                          <div className="absolute bottom-2 right-2 rounded bg-background/80 px-1 text-xs">{pageRotations[index]}°</div>
                          <div className="absolute bottom-2 left-2 inline-flex items-center gap-2">
                            <Button type="button" variant="outline" size="icon" onClick={() => rotatePage(index, -90)} className="size-8">
                              <RotateCcw className="size-4" />
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => rotatePage(index, 90)} className="size-8">
                              <RotateCw className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">Upload a PDF to see page thumbnails. Click a page to rotate 90°.</div>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Rotated PDF</p>
                      <p className="text-xs text-muted-foreground">{resultUrl ? resultFileName : "Rotate pages to enable download"}</p>
                    </div>
                    <Button onClick={downloadRotatedPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  {resultRotations.length ? (
                    <p className="text-xs text-muted-foreground">Applied rotations: {resultRotations.map((item) => `p${item.page}→${item.rotation}°`).join(", ")}</p>
                  ) : null}
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
