"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { FileText, ImageIcon, Loader2, Sparkles, Download, X } from "lucide-react"
import JSZip from "jszip"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

const PDF_SCALE = 1.5
const PDF_WORKER_SRC = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString()

interface PageImage {
  page: number
  url: string
  width: number
  height: number
}

type RasterFormat = "png" | "jpg"

type HeroContent = {
  badge: string
  title: string
  description: string
}

type PdfToImageConverterProps = {
  children?: React.ReactNode
  format: RasterFormat
  hero: HeroContent
  navTitle?: string
}

export function PdfToImageConverter({ children, format, hero, navTitle }: PdfToImageConverterProps) {
  const [pdfName, setPdfName] = useState<string>("")
  const [images, setImages] = useState<PageImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  const formatLabel = format.toUpperCase()
  const fileExtension = format === "jpg" ? "jpg" : "png"
  const mimeType = format === "jpg" ? "image/jpeg" : "image/png"

  const resetState = useCallback(() => {
    setPdfName("")
    setImages([])
    setError(null)
  }, [])

  const handlePdfUpload = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }

    setPdfName(file.name)
    setImages([])
    setError(null)
    setIsProcessing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")

      if (typeof window !== "undefined" && pdfjs.GlobalWorkerOptions.workerSrc !== PDF_WORKER_SRC) {
        // Tell pdf.js where to load its module worker so we avoid fake-worker fallbacks.
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC
      }

      const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const pageImages: PageImage[] = []

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber)
        const viewport = page.getViewport({ scale: PDF_SCALE })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        if (!context) {
          throw new Error("Unable to create canvas context.")
        }

        canvas.width = viewport.width
        canvas.height = viewport.height

        const renderContext = { canvasContext: context, viewport, canvas }
        await page.render(renderContext).promise

        const dataUrl = format === "jpg" ? canvas.toDataURL(mimeType, 0.92) : canvas.toDataURL(mimeType)
        pageImages.push({
          page: pageNumber,
          url: dataUrl,
          width: canvas.width,
          height: canvas.height,
        })
        page.cleanup()
      }

      setImages(pageImages)
    } catch (err) {
      console.error(err)
      setError("Failed to convert PDF pages. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [format, mimeType])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) {
        void handlePdfUpload(file)
      }
    },
    [handlePdfUpload],
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        void handlePdfUpload(file)
      }
    },
    [handlePdfUpload],
  )

  const handleDownload = useCallback(
    (imageUrl: string, pageNumber: number) => {
      const link = document.createElement("a")
      link.href = imageUrl
      const safeName = pdfName ? pdfName.replace(/\.pdf$/i, "") : "page"
      link.download = `${safeName}-page-${pageNumber}.${fileExtension}`
      link.click()
    },
    [fileExtension, pdfName],
  )

  const handleDownloadAll = useCallback(async () => {
    if (!images.length || isDownloadingAll) {
      return
    }

    try {
      setIsDownloadingAll(true)
      const zip = new JSZip()
      const safeName = pdfName ? pdfName.replace(/\.pdf$/i, "") : "export"

      await Promise.all(
        images.map(async (image) => {
          const response = await fetch(image.url)
          const blob = await response.blob()
          zip.file(`${safeName}-page-${image.page}.${fileExtension}`, blob)
        }),
      )

      const archive = await zip.generateAsync({ type: "blob" })
      const downloadUrl = URL.createObjectURL(archive)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `${safeName}-pages.zip`
      link.click()
      URL.revokeObjectURL(downloadUrl)
    } catch (zipError) {
      console.error(zipError)
      setError("Failed to create ZIP. Please try again.")
    } finally {
      setIsDownloadingAll(false)
    }
  }, [fileExtension, images, isDownloadingAll, pdfName])

  const handleClear = useCallback(() => {
    resetState()
  }, [resetState])

  return (
    <div className="min-h-screen">
      <SiteNavigation title={navTitle ?? `PDF to ${formatLabel}`} />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm mb-6">
              <Sparkles className="size-3.5" />
              <span>{hero.badge}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-balance">{hero.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{hero.description}</p>
          </div>

          <GlowCard tone="emerald" className="max-w-5xl mx-auto p-6 md:p-8">
            <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium flex items-center gap-2">
                  <FileText className="size-4" />
                  Upload PDF
                </h2>
                {pdfName && (
                  <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <label
                className={`relative flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground hover:bg-muted/50"
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
                <input type="file" accept="application/pdf" onChange={handleFileSelect} className="sr-only" />
                <ImageIcon className={`size-10 mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium">
                  {isDragging ? "Drop your PDF here" : pdfName ? pdfName : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Max 20 MB • Outputs {formatLabel} files</p>
              </label>
            </div>

            <div className="relative min-h-[200px] rounded-lg bg-muted border border-border p-4">
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Rendering pages...</span>
                </div>
              )}
              {error ? (
                <p className="text-destructive text-sm">{error}</p>
              ) : images.length ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="font-medium">Converted pages ({images.length})</span>
                    <Button
                      size="sm"
                      disabled={isDownloadingAll}
                      onClick={() => {
                        void handleDownloadAll()
                      }}
                    >
                      {isDownloadingAll ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Download className="size-4 mr-2" />}
                      Download all
                    </Button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {images.map((image) => (
                      <div key={image.page} className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Page {image.page}</span>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(image.url, image.page)}>
                            <Download className="size-4 mr-1" />
                            {formatLabel}
                          </Button>
                        </div>
                        <div className="border border-border rounded-lg overflow-hidden bg-background">
                          <img src={image.url} alt={`PDF page ${image.page}`} className="w-full h-auto" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(image.width)} × {Math.round(image.height)} px
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="size-10 mb-2 opacity-50" />
                  <p className="text-sm">Your converted images will appear here</p>
                </div>
              )}
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
