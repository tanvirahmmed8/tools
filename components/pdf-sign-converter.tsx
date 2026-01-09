"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Download, ImageDown, Loader2, PenLine, PenSquare, Sparkles, Undo2, Upload, X } from "lucide-react"

import { signPdf } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"
import { cn } from "@/lib/utils"

const PDF_MIME = "application/pdf"
const IMAGE_ACCEPT = "image/png,image/jpeg"
const CANVAS_WIDTH = 560
const CANVAS_HEIGHT = 220

const POSITION_OPTIONS = [
  { label: "Top", value: "top" },
  { label: "Middle", value: "middle" },
  { label: "Bottom", value: "bottom" },
] as const

const ALIGN_OPTIONS = [
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

type PdfSignConverterProps = {
  children?: ReactNode
}

type SignatureSource = "canvas" | "upload" | null

export function PdfSignConverter({ children }: PdfSignConverterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const signatureInputRef = useRef<HTMLInputElement | null>(null)
  const isDrawingRef = useRef(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [page, setPage] = useState("1")
  const [position, setPosition] = useState<(typeof POSITION_OPTIONS)[number]["value"]>("bottom")
  const [align, setAlign] = useState<(typeof ALIGN_OPTIONS)[number]["value"]>("right")
  const [signatureWidth, setSignatureWidth] = useState(200)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [signatureLabel, setSignatureLabel] = useState("")
  const [signatureSource, setSignatureSource] = useState<SignatureSource>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [signedBy, setSignedBy] = useState("")
  const [reason, setReason] = useState("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState("signed-document.pdf")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDraggingPdf, setIsDraggingPdf] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = window.devicePixelRatio ?? 1
    canvas.width = CANVAS_WIDTH * ratio
    canvas.height = CANVAS_HEIGHT * ratio
    canvas.style.width = `${CANVAS_WIDTH}px`
    canvas.style.height = `${CANVAS_HEIGHT}px`
    const context = canvas.getContext("2d")
    if (!context) return
    context.scale(ratio, ratio)
    context.lineCap = "round"
    context.lineJoin = "round"
    context.lineWidth = 2.4
    context.strokeStyle = "#0f172a"
    canvas.style.touchAction = "none"
  }, [])

  useEffect(() => () => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl)
    }
  }, [resultUrl])

  const resetResults = useCallback(() => {
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setResultFileName("signed-document.pdf")
    setPageCount(null)
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file.type !== PDF_MIME) {
      setError("Please upload a PDF file under 20 MB.")
      return
    }
    setSelectedFile(file)
    setPdfName(file.name)
    setError(null)
    resetResults()
  }, [resetResults])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDraggingPdf(false)
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const clearPdf = useCallback(() => {
    setSelectedFile(null)
    setPdfName("")
    setPage("1")
    resetResults()
  }, [resetResults])

  const captureCanvasSignature = useCallback(() => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL("image/png")
    setSignatureDataUrl(dataUrl)
    setSignatureLabel("Canvas signature")
    setSignatureSource("canvas")
  }, [])

  const getCanvasPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const ratio = canvas.width / rect.width
    return {
      x: (event.clientX - rect.left) * ratio,
      y: (event.clientY - rect.top) * ratio,
    }
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    event.preventDefault()
    const context = canvasRef.current.getContext("2d")
    const point = getCanvasPoint(event)
    if (!context || !point) return
    context.beginPath()
    context.moveTo(point.x, point.y)
    isDrawingRef.current = true
  }, [getCanvasPoint])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return
    event.preventDefault()
    const context = canvasRef.current.getContext("2d")
    const point = getCanvasPoint(event)
    if (!context || !point) return
    context.lineTo(point.x, point.y)
    context.stroke()
  }, [getCanvasPoint])

  const finishDrawing = useCallback((event?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return
    if (event) {
      event.preventDefault()
    }
    const context = canvasRef.current.getContext("2d")
    if (!context) return
    context.closePath()
    isDrawingRef.current = false
    captureCanvasSignature()
  }, [captureCanvasSignature])

  const clearSignaturePad = useCallback(() => {
    if (!canvasRef.current) return
    const context = canvasRef.current.getContext("2d")
    if (!context) return
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    if (signatureSource === "canvas") {
      setSignatureDataUrl(null)
      setSignatureLabel("")
      setSignatureSource(null)
    }
  }, [signatureSource])

  const handleSignatureUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!/image\/(png|jpeg|jpg)/i.test(file.type)) {
      setError("Upload a PNG or JPG signature image.")
      event.target.value = ""
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setSignatureDataUrl(result)
      setSignatureLabel(file.name)
      setSignatureSource("upload")
      setError(null)
    }
    reader.onerror = () => setError("Unable to load the signature image.")
    reader.readAsDataURL(file)
    event.target.value = ""
  }, [])

  const clearUploadedSignature = useCallback(() => {
    if (signatureSource !== "upload") return
    setSignatureDataUrl(null)
    setSignatureLabel("")
    setSignatureSource(null)
    if (signatureInputRef.current) {
      signatureInputRef.current.value = ""
    }
  }, [signatureSource])

  const hasSignature = useMemo(() => Boolean(signatureDataUrl), [signatureDataUrl])

  const handleSign = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload the PDF you want to sign.")
      return
    }
    if (!hasSignature || !signatureDataUrl) {
      setError("Draw or upload a signature before applying it to the PDF.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const pdfBase64 = await fileToBase64(selectedFile)
      const pageNumber = Math.max(1, Number(page) || 1)
      const metadata = {
        title: title.trim() || undefined,
        author: author.trim() || undefined,
        signedBy: signedBy.trim() || undefined,
        reason: reason.trim() || undefined,
      }

      const result = await signPdf(pdfBase64, {
        signature: signatureDataUrl,
        page: pageNumber,
        position,
        align,
        width: signatureWidth,
        metadata,
      })

      setPageCount(result.totalPages ?? null)
      setResultFileName(result.fileName)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (signError) {
      console.error(signError)
      const message = signError instanceof Error ? signError.message : "Failed to sign the PDF."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [align, author, hasSignature, page, position, reason, resetResults, selectedFile, signatureDataUrl, signatureWidth, signedBy, title])

  const downloadSignedPdf = useCallback(() => {
    if (!resultUrl) return
    const anchor = document.createElement("a")
    anchor.href = resultUrl
    anchor.download = resultFileName
    anchor.click()
  }, [resultFileName, resultUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Sign PDF" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/40">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-1 text-sm text-secondary-foreground">
            <PenSquare className="size-4" />
            <span>Hand-written style signatures</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Sign PDFs in the browser</h1>
            <p className="text-lg text-muted-foreground">
              Draw or upload a signature, pick the destination page, and export a ready-to-share PDF in under a minute.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="teal" className="p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Upload className="size-4" />
                    Upload PDF
                  </h2>
                  {selectedFile ? (
                    <Button variant="ghost" size="sm" onClick={clearPdf} className="text-muted-foreground">
                      <X className="mr-1 size-4" />
                      Clear
                    </Button>
                  ) : null}
                </div>

                <label
                  className={cn(
                    "relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-all duration-200",
                    isDraggingPdf ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40",
                  )}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDraggingPdf(true)
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault()
                    setIsDraggingPdf(false)
                  }}
                  onDrop={handleDrop}
                >
                  <input type="file" accept={PDF_MIME} onChange={handleFileSelect} className="sr-only" />
                  <Upload className={`mb-3 size-8 ${isDraggingPdf ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDraggingPdf ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB · stays on-device</p>
                </label>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="e.g., Q1 Partnership"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Author</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(event) => setAuthor(event.target.value)}
                        placeholder="Ops team or owner"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signer name</label>
                      <input
                        type="text"
                        value={signedBy}
                        onChange={(event) => setSignedBy(event.target.value)}
                        placeholder="e.g., Ava Patel"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signing reason</label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Approval, receipt, confirmation"
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Placement</p>
                    {pageCount ? (
                      <span className="text-xs text-muted-foreground">{pageCount} total pages</span>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Page number</label>
                      <input
                        type="number"
                        min={1}
                        value={page}
                        onChange={(event) => setPage(event.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Signature width</label>
                      <div className="mt-1 flex items-center gap-3">
                        <input
                          type="range"
                          min={80}
                          max={360}
                          step={5}
                          value={signatureWidth}
                          onChange={(event) => setSignatureWidth(Number(event.target.value))}
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">{signatureWidth}px</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Vertical position</label>
                      <select
                        value={position}
                        onChange={(event) => setPosition(event.target.value as (typeof POSITION_OPTIONS)[number]["value"])}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {POSITION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground">Horizontal alignment</label>
                      <select
                        value={align}
                        onChange={(event) => setAlign(event.target.value as (typeof ALIGN_OPTIONS)[number]["value"])}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {ALIGN_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Need extra adjustments? Pair this signer with Rotate, Delete Pages, or Edit PDF for final polishing.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Signature pad</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={clearSignaturePad} className="text-muted-foreground">
                        <Undo2 className="mr-1 size-4" />
                        Clear pad
                      </Button>
                      <label className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-1 text-xs text-muted-foreground cursor-pointer">
                        <ImageDown className="size-3.5" />
                        Import
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept={IMAGE_ACCEPT}
                          onChange={handleSignatureUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/40">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      className="h-[220px] w-full cursor-crosshair bg-background"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={finishDrawing}
                      onPointerLeave={finishDrawing}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use a trackpad, mouse, or stylus for the smoothest ink. Transparent backgrounds keep signatures crisp on export.
                  </p>
                  {signatureSource === "upload" ? (
                    <Button variant="ghost" size="sm" onClick={clearUploadedSignature} className="mt-2 text-muted-foreground">
                      <X className="mr-1 size-4" />
                      Remove uploaded signature
                    </Button>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Signature preview</p>
                      <p className="text-xs text-muted-foreground">{signatureLabel || "Draw or import a signature to preview"}</p>
                    </div>
                    <PenLine className="size-5 text-muted-foreground" />
                  </div>
                  <div className="mt-3 rounded-lg border border-dashed border-border bg-background/80 p-4 text-center">
                    {signatureDataUrl ? (
                      <img src={signatureDataUrl} alt="Signature preview" className="mx-auto max-h-32 object-contain" />
                    ) : (
                      <div className="text-xs text-muted-foreground">No signature yet</div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/90 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Status</p>
                      <p className="text-xs text-muted-foreground">
                        {pdfName ? `Ready to sign ${pdfName}` : "Upload a PDF to get started"}
                      </p>
                    </div>
                    <Button onClick={handleSign} disabled={!selectedFile || !hasSignature || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      {isProcessing ? "Applying" : "Apply signature"}
                    </Button>
                  </div>
                  {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  {resultUrl && !error && !isProcessing ? (
                    <p className="text-xs text-muted-foreground">Signature added. Download the updated PDF below.</p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Signed PDF</p>
                      <p className="text-xs text-muted-foreground">
                        {resultUrl ? resultFileName : "Run Apply signature to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadSignedPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download
                    </Button>
                  </div>
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
