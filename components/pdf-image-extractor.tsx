"use client"

import type { ReactNode } from "react"
import { useCallback, useMemo, useState } from "react"
import { Download, Filter, ImageDown, ImageIcon, Loader2, Sparkles, Upload, X } from "lucide-react"
import JSZip from "jszip"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"
import { cn } from "@/lib/utils"

const PDF_MIME = "application/pdf"
const PDF_WORKER_SRC = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString()

type ExtractedImage = {
  id: string
  page: number
  index: number
  width: number
  height: number
  dataUrl: string
  source: "xobject" | "inline"
}

type PdfImageExtractorProps = {
  children?: ReactNode
}

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs")

type PdfJsImageLike = HTMLCanvasElement | ImageData | {
  width: number
  height: number
  data?: Uint8Array | Uint8ClampedArray
  kind?: number
  bitmap?: ImageBitmap
}

const makeId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

async function loadPdfJs(): Promise<PdfJsModule> {
  const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as PdfJsModule
  if (typeof window !== "undefined") {
    const workerSrc = (pdfjs.GlobalWorkerOptions?.workerSrc as string | undefined) ?? ""
    if (!workerSrc || workerSrc !== PDF_WORKER_SRC) {
      pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC
    }
  }
  return pdfjs
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext("2d")
  return context ? { canvas, context } : null
}

function rgbaFromBinary(imgData: { data?: Uint8Array | Uint8ClampedArray; width: number; height: number; kind?: number }, pdfjs: PdfJsModule) {
  const { data, width, height, kind } = imgData
  if (!data || !width || !height) {
    return null
  }
  const totalPixels = width * height
  const rgba = new Uint8ClampedArray(totalPixels * 4)

  if (!kind || kind === pdfjs.ImageKind.RGBA_32BPP) {
    const input = data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data)
    if (input.length !== totalPixels * 4) {
      return null
    }
    rgba.set(input)
    return rgba
  }

  if (kind === pdfjs.ImageKind.RGB_24BPP) {
    let srcIndex = 0
    for (let i = 0; i < totalPixels; i += 1) {
      rgba[i * 4] = data[srcIndex++] ?? 0
      rgba[i * 4 + 1] = data[srcIndex++] ?? 0
      rgba[i * 4 + 2] = data[srcIndex++] ?? 0
      rgba[i * 4 + 3] = 255
    }
    return rgba
  }

  if (kind === pdfjs.ImageKind.GRAYSCALE_1BPP) {
    let pixelIndex = 0
    for (let byteIndex = 0; byteIndex < data.length && pixelIndex < totalPixels; byteIndex += 1) {
      const currentByte = data[byteIndex]
      for (let bit = 7; bit >= 0 && pixelIndex < totalPixels; bit -= 1) {
        const isWhite = (currentByte >> bit) & 1
        const value = isWhite ? 255 : 0
        const offset = pixelIndex * 4
        rgba[offset] = value
        rgba[offset + 1] = value
        rgba[offset + 2] = value
        rgba[offset + 3] = 255
        pixelIndex += 1
      }
    }
    return rgba
  }

  return null
}

function convertImageLikeToDataUrl(image: PdfJsImageLike | null, pdfjs: PdfJsModule) {
  if (!image) return null

  if (typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement) {
    return { dataUrl: image.toDataURL("image/png"), width: image.width, height: image.height }
  }

  if (typeof ImageData !== "undefined" && image instanceof ImageData) {
    const canvasBundle = createCanvas(image.width, image.height)
    if (!canvasBundle) return null
    canvasBundle.context.putImageData(image, 0, 0)
    return { dataUrl: canvasBundle.canvas.toDataURL("image/png"), width: image.width, height: image.height }
  }

  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    const canvasBundle = createCanvas(image.width, image.height)
    if (!canvasBundle) return null
    canvasBundle.context.drawImage(image, 0, 0)
    return { dataUrl: canvasBundle.canvas.toDataURL("image/png"), width: image.width, height: image.height }
  }

  if (typeof image === "object" && "bitmap" in image && image.bitmap) {
    const bitmap = image.bitmap as ImageBitmap
    const canvasBundle = createCanvas(bitmap.width, bitmap.height)
    if (!canvasBundle) return null
    canvasBundle.context.drawImage(bitmap, 0, 0)
    return { dataUrl: canvasBundle.canvas.toDataURL("image/png"), width: bitmap.width, height: bitmap.height }
  }

  if (typeof image === "object" && "data" in image && image.data) {
    const { width, height } = image
    const canvasBundle = createCanvas(width, height)
    if (!canvasBundle) return null
    const rgba = rgbaFromBinary(image, pdfjs)
    if (!rgba) return null
    const imageData = new ImageData(rgba, width, height)
    canvasBundle.context.putImageData(imageData, 0, 0)
    return { dataUrl: canvasBundle.canvas.toDataURL("image/png"), width, height }
  }

  return null
}

async function warmupPage(page: any) {
  const viewport = page.getViewport({ scale: 0.01 })
  const canvasBundle = createCanvas(viewport.width || 1, viewport.height || 1)
  if (!canvasBundle) return
  try {
    await page.render({ canvasContext: canvasBundle.context, viewport }).promise
  } catch (renderError) {
    console.warn("PDF render warmup failed", renderError)
  }
}

function waitForObject(page: any, objId: string) {
  return new Promise<PdfJsImageLike | null>((resolve) => {
    let settled = false
    const finish = (value: PdfJsImageLike | null) => {
      if (!settled) {
        settled = true
        resolve(value)
      }
    }

    try {
      const immediate = page.objs.get(objId, (data: PdfJsImageLike) => finish(data))
      if (immediate) {
        finish(immediate as PdfJsImageLike)
        return
      }
    } catch (error) {
      console.warn("Unable to resolve image object", objId, error)
      finish(null)
      return
    }

    setTimeout(() => finish(null), 1500)
  })
}

export function PdfImageExtractor({ children }: PdfImageExtractorProps) {
  const [pdfName, setPdfName] = useState("")
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [images, setImages] = useState<ExtractedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState("")
  const [isZipping, setIsZipping] = useState(false)

  const reset = useCallback(() => {
    setPdfName("")
    setPageCount(null)
    setImages([])
    setError(null)
    setStatus("")
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== PDF_MIME) {
        setError("Please upload a PDF file under 20 MB.")
        return
      }

      reset()
      setPdfName(file.name)
      setIsProcessing(true)
      setError(null)
      setStatus("Loading PDF...")

      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfjs = await loadPdfJs()
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        setPageCount(pdf.numPages)

        const extracted: ExtractedImage[] = []

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          setStatus(`Scanning page ${pageNumber} of ${pdf.numPages}`)
          const page = await pdf.getPage(pageNumber)
          const operatorList = await page.getOperatorList()
          const xObjectIds = new Set<string>()
          const inlineImages: PdfJsImageLike[] = []

          for (let i = 0; i < operatorList.fnArray.length; i += 1) {
            const fnId = operatorList.fnArray[i]
            const args = operatorList.argsArray[i]
            if (!args) continue

            if (fnId === pdfjs.OPS.paintImageXObject || fnId === pdfjs.OPS.paintImageXObjectRepeat) {
              const candidate = args[0]
              if (typeof candidate === "string") {
                xObjectIds.add(candidate)
              }
            } else if (fnId === pdfjs.OPS.paintInlineImageXObject || fnId === pdfjs.OPS.paintInlineImageXObjectGroup) {
              if (args[0]) {
                inlineImages.push(args[0] as PdfJsImageLike)
              }
            }
          }

          await warmupPage(page)

          let sequence = 1
          for (const objId of xObjectIds) {
            const resolved = await waitForObject(page, objId)
            const converted = convertImageLikeToDataUrl(resolved, pdfjs)
            if (converted) {
              extracted.push({
                id: `${pageNumber}-${sequence}-${objId}`,
                page: pageNumber,
                index: sequence,
                width: converted.width,
                height: converted.height,
                dataUrl: converted.dataUrl,
                source: "xobject",
              })
              sequence += 1
            }
          }

          inlineImages.forEach((inlineImage, inlineIndex) => {
            const converted = convertImageLikeToDataUrl(inlineImage, pdfjs)
            if (converted) {
              extracted.push({
                id: `${pageNumber}-inline-${inlineIndex}-${makeId()}`,
                page: pageNumber,
                index: sequence + inlineIndex,
                width: converted.width,
                height: converted.height,
                dataUrl: converted.dataUrl,
                source: "inline",
              })
            }
          })

          page.cleanup()
        }

        if (!extracted.length) {
          setError("No embedded raster images were detected inside this PDF.")
        }
        setImages(extracted)
        setStatus("Finished scanning")
      } catch (err) {
        console.error(err)
        setError("Failed to extract images from this PDF. Try a different file or re-export the document.")
      } finally {
        setIsProcessing(false)
        setStatus("")
      }
    },
    [reset],
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
    reset()
  }, [reset])

  const handleDownloadSingle = useCallback((image: ExtractedImage) => {
    const anchor = document.createElement("a")
    anchor.href = image.dataUrl
    const safeName = pdfName ? pdfName.replace(/\.pdf$/i, "") : "pdf"
    anchor.download = `${safeName}-page-${image.page}-img-${image.index}.png`
    anchor.click()
  }, [pdfName])

  const handleDownloadAll = useCallback(async () => {
    if (!images.length || isZipping) return
    setIsZipping(true)
    try {
      const zip = new JSZip()
      const safeName = pdfName ? pdfName.replace(/\.pdf$/i, "") : "pdf"
      await Promise.all(
        images.map(async (image, idx) => {
          const response = await fetch(image.dataUrl)
          const blob = await response.blob()
          zip.file(`${safeName}-page-${image.page}-img-${idx + 1}.png`, blob)
        }),
      )
      const archive = await zip.generateAsync({ type: "blob" })
      const downloadUrl = URL.createObjectURL(archive)
      const anchor = document.createElement("a")
      anchor.href = downloadUrl
      anchor.download = `${safeName}-images.zip`
      anchor.click()
      URL.revokeObjectURL(downloadUrl)
    } catch (zipError) {
      console.error(zipError)
      setError("Unable to create ZIP archive. Please try again.")
    } finally {
      setIsZipping(false)
    }
  }, [images, isZipping, pdfName])

  const pagesWithImages = useMemo(() => {
    const set = new Set<number>()
    images.forEach((image) => set.add(image.page))
    return set.size
  }, [images])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Extract PDF Images" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/40">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Pull every embedded image</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Extract images straight from any PDF</h1>
            <p className="text-lg text-muted-foreground">
              Upload a PDF, let the analyzer scan each page, and download every embedded PNG/JPG at its original resolution.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="cobalt" className="p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Upload className="size-4" />
                    Upload PDF
                  </h2>
                  {pdfName ? (
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
                      <X className="mr-1 size-4" />
                      Clear
                    </Button>
                  ) : null}
                </div>

                <label
                  className={cn(
                    "relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-all duration-200",
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40",
                  )}
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
                  <ImageIcon className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB • Processes entirely in your browser</p>
                </label>

                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Images found</p>
                      <p className="text-2xl font-semibold">{images.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Pages scanned</p>
                      <p className="text-2xl font-semibold">{pageCount ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Pages w/ images</p>
                      <p className="text-2xl font-semibold">{pagesWithImages}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-background/80 px-4 py-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Status</p>
                    <p>{isProcessing ? status || "Analyzing PDF" : error ? "Needs attention" : images.length ? "Ready to download" : "Awaiting upload"}</p>
                  </div>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Filter className="size-4" />
                    Best results
                  </div>
                  <ul className="mt-3 space-y-2 text-xs">
                    <li>Use the Edit PDF tool first to rotate or cleanup pages before extracting assets.</li>
                    <li>Scans exported at 300 DPI preserve sharp logos and product photos.</li>
                    <li>Inline vector art and gradients remain part of the PDF and will not export as raster images.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Extracted images</p>
                    <p className="text-xs text-muted-foreground">
                      {images.length ? `${images.length} assets ready` : "Images will appear after processing"}
                    </p>
                  </div>
                  <Button onClick={() => { void handleDownloadAll() }} disabled={!images.length || isProcessing || isZipping}>
                    {isZipping ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
                    Download all
                  </Button>
                </div>

                <div className="max-h-[520px] overflow-auto rounded-xl border border-border bg-background/80 p-4">
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <p className="text-sm">{status || "Extracting images..."}</p>
                    </div>
                  ) : images.length ? (
                    <div className="grid gap-4">
                      {images.map((image, idx) => (
                        <div key={image.id} className="rounded-lg border border-border/80 bg-muted/20 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                            <span>
                              Page {image.page} • Image {image.index}
                            </span>
                            <span className="text-muted-foreground capitalize">{image.source === "inline" ? "inline" : "embedded"}</span>
                          </div>
                          <div className="mt-3 rounded-md border border-border bg-background p-2">
                            <img src={image.dataUrl} alt={`Extracted PDF image ${idx + 1}`} className="mx-auto max-h-60 w-auto" />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>
                              {Math.round(image.width)} × {Math.round(image.height)} px
                            </span>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadSingle(image)}>
                              <ImageDown className="mr-1 size-4" />
                              PNG
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <ImageDown className="size-10" />
                      <p className="text-sm">Drop a PDF to surface every embedded image.</p>
                    </div>
                  )}
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
