"use client"

import { useCallback, useEffect, useState } from "react"
import { FileText, Download, Loader2, Sparkles, Upload, X, FileOutput } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { compressPdf } from "@/app/actions"

const PDF_MIME = "application/pdf"

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

export function PdfCompressConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedFileName, setCompressedFileName] = useState("compressed.pdf")
  const [isCompressing, setIsCompressing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl)
      }
    }
  }, [pdfPreviewUrl, compressedUrl])

  const resetArtifacts = useCallback(() => {
    setError(null)
    setCompressedUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file.type !== PDF_MIME) {
      setError("Please upload a PDF file (under 20 MB).")
      return
    }
    setSelectedFile(file)
    setPdfName(file.name)
    resetArtifacts()
    const previewUrl = URL.createObjectURL(file)
    setPdfPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return previewUrl
    })
  }, [resetArtifacts])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleCompress = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload a PDF before compressing.")
      return
    }
    setIsCompressing(true)
    setError(null)
    try {
      const base64 = await fileToBase64(selectedFile)
      const result = await compressPdf(base64)
      setCompressedFileName(result.fileName)
      setCompressedUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (compressionError) {
      console.error(compressionError)
      setError("Compression failed. Please try again or use a different PDF.")
    } finally {
      setIsCompressing(false)
    }
  }, [selectedFile])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPdfName("")
    setPdfPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    resetArtifacts()
  }, [resetArtifacts])

  const downloadCompressed = useCallback(() => {
    if (!compressedUrl) return
    const link = document.createElement("a")
    link.href = compressedUrl
    link.download = compressedFileName
    link.click()
  }, [compressedFileName, compressedUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="PDF Compress" />
      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>PDF compression</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
              Shrink your PDF files instantly
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a PDF, compress it with one click, and download a smaller file for easier sharing and storage.
            </p>
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
                  <input type="file" accept="application/pdf" onChange={handleFileSelect} className="sr-only" />
                  <FileText className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">
                    {isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Supports PDFs up to 20 MB</p>
                </label>
                {pdfPreviewUrl && (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-medium">Preview</p>
                    <iframe src={pdfPreviewUrl} title="PDF preview" className="h-48 w-full rounded border border-border bg-white" />
                    <p className="text-xs text-muted-foreground">Preview uses your local file and never leaves the browser.</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Compression status</p>
                      <p className="text-lg font-semibold">{selectedFile ? pdfName || "Ready to compress" : "No PDF selected"}</p>
                    </div>
                    <Button onClick={handleCompress} disabled={!selectedFile || isCompressing}>
                      {isCompressing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileOutput className="mr-2 size-4" />}
                      {isCompressing ? "Compressing" : "Compress PDF"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {compressedUrl && !error && !isCompressing && (
                    <p className="mt-3 text-sm text-muted-foreground">Compression complete. Download your PDF below.</p>
                  )}
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Compressed PDF download</p>
                      <p className="text-xs text-muted-foreground">
                        {compressedUrl ? compressedFileName : "Compress a PDF to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadCompressed} disabled={!compressedUrl || isCompressing}>
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
