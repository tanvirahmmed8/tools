"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { Download, FileMinus2, FileText, Loader2, Sparkles, Trash2, Upload, X } from "lucide-react"

import { deletePdfPages } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

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

type PdfDeletePagesConverterProps = {
  children?: ReactNode
}

export function PdfDeletePagesConverter({ children }: PdfDeletePagesConverterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pagesInput, setPagesInput] = useState("")
  const [removedPages, setRemovedPages] = useState<number[]>([])
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [remainingPages, setRemainingPages] = useState<number | null>(null)
  const [resultFileName, setResultFileName] = useState("cleaned-document.pdf")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
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
    setRemovedPages([])
    setPageCount(null)
    setRemainingPages(null)
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setResultFileName("cleaned-document.pdf")
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
    setPagesInput("")
    setError(null)
    resetResults()
  }, [resetResults])

  const handleDeletePages = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload a PDF before deleting pages.")
      return
    }
    if (!pagesInput.trim()) {
      setError("Enter the page numbers you want to delete, e.g., 2-4,7.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const base64 = await fileToBase64(selectedFile)
      const result = await deletePdfPages(base64, { pages: pagesInput })
      setRemovedPages(result.removedPages)
      setPageCount(result.totalPages)
      setRemainingPages(result.remainingPages)
      setResultFileName(result.fileName)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (deletionError) {
      console.error(deletionError)
      const message = deletionError instanceof Error ? deletionError.message : "Failed to delete selected pages."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [pagesInput, resetResults, selectedFile])

  const downloadCleanPdf = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = resultFileName
    link.click()
  }, [resultFileName, resultUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Delete PDF Pages" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Precise page cleanup</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
              Delete unwanted PDF pages before you share
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a PDF, list the pages you want to drop, and download a cleaner file that keeps the original order and layout.
            </p>
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
                  <FileText className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">
                    {isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Supports PDFs up to 20 MB</p>
                </label>

                <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                  <label className="block text-sm font-medium">Pages to delete</label>
                  <input
                    type="text"
                    value={pagesInput}
                    onChange={(event) => setPagesInput(event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 2-4,6,9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use commas to separate values and hyphens for ranges. The remaining pages stay in their original order.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Delete status</p>
                      <p className="text-lg font-semibold">{pdfName || "No PDF selected"}</p>
                      {pageCount ? (
                        <p className="mt-1 text-xs text-muted-foreground">{pageCount} total page{pageCount === 1 ? "" : "s"}</p>
                      ) : null}
                    </div>
                    <Button onClick={handleDeletePages} disabled={!selectedFile || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />} 
                      {isProcessing ? "Processing" : "Delete pages"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {resultUrl && !error && !isProcessing && (
                    <p className="mt-3 text-sm text-muted-foreground">Cleanup complete. Download your PDF below.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Clean PDF download</p>
                      <p className="text-xs text-muted-foreground">
                        {resultUrl ? resultFileName : "Delete pages to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadCleanPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  {remainingPages !== null && (
                    <p className="text-xs text-muted-foreground">
                      Remaining pages: {remainingPages} • Removed pages: {removedPages.length}
                    </p>
                  )}
                  {removedPages.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Removed pages</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {removedPages.map((page) => (
                          <span key={page} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
                            <FileMinus2 className="size-3.5" />
                            Page {page}
                          </span>
                        ))}
                      </div>
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
