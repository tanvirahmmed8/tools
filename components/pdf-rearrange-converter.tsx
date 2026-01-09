"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { PDFDocument } from "pdf-lib"
import { Download, FileStack, GripVertical, Loader2, RefreshCcw, Sparkles, Upload, X } from "lucide-react"

import { rearrangePdfPages } from "@/app/actions"
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

type PdfRearrangeConverterProps = {
  children?: ReactNode
}

export function PdfRearrangeConverter({ children }: PdfRearrangeConverterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pageOrder, setPageOrder] = useState<number[]>([])
  const [resultOrder, setResultOrder] = useState<number[]>([])
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState("reordered-document.pdf")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl)
      }
    }
  }, [resultUrl])

  const resetResults = useCallback(() => {
    setResultOrder([])
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setResultFileName("reordered-document.pdf")
  }, [])

  const hydratePdfState = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = pdfDoc.getPageCount()
    if (!totalPages) {
      throw new Error("This PDF appears to be empty. Upload a file with at least one page.")
    }
    setPageCount(totalPages)
    setPageOrder(Array.from({ length: totalPages }, (_, index) => index + 1))
    setPdfBase64(await fileToBase64(file))
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
        setPageOrder([])
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
    setPageOrder([])
    setResultOrder([])
    setPdfBase64(null)
    setPageCount(null)
    setError(null)
    resetResults()
  }, [resetResults])

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setPageOrder((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const handleDragStart = (index: number) => (event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.effectAllowed = "move"
    setActiveDragIndex(index)
  }

  const handleDragEnter = (index: number) => (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault()
    if (activeDragIndex === null || activeDragIndex === index) return
    reorderPages(activeDragIndex, index)
    setActiveDragIndex(index)
  }

  const handleDragEnd = () => {
    setActiveDragIndex(null)
  }

  const handleRearrange = useCallback(async () => {
    if (!pdfBase64) {
      setError("Upload a PDF before rearranging pages.")
      return
    }
    if (!pageOrder.length) {
      setError("Load the PDF to generate a page list for sorting.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await rearrangePdfPages(pdfBase64, { order: pageOrder })
      setResultFileName(result.fileName)
      setResultOrder(result.order)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (reorderError) {
      console.error(reorderError)
      const message = reorderError instanceof Error ? reorderError.message : "Failed to rearrange the PDF."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [pageOrder, pdfBase64, resetResults])

  const downloadReorderedPdf = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = resultFileName
    link.click()
  }, [resultFileName, resultUrl])

  const restoreOriginalOrder = useCallback(() => {
    if (!pageCount) return
    setPageOrder(Array.from({ length: pageCount }, (_, index) => index + 1))
    setResultOrder([])
  }, [pageCount])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Rearrange PDF Pages" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Drag to reorder</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Shuffle PDF pages into the right order</h1>
            <p className="text-lg text-muted-foreground">
              Upload a PDF, drag each page into place, and export a clean document that matches your meeting or storyline flow.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="iris" className="p-6 md:p-8">
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
                  <FileStack className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB • generates a draggable page list</p>
                </label>

                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Tips for smooth sorting</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Drag the handle to move a page; use Restore order to undo experiments.</li>
                    <li>Group related slides (intro, metrics, appendix) before exporting.</li>
                    <li>Re-run the tool whenever stakeholders request a different storyline.</li>
                  </ul>
                </div>

                {pageOrder.length > 1 && (
                  <Button variant="outline" size="sm" onClick={restoreOriginalOrder} className="gap-2">
                    <RefreshCcw className="size-4" />
                    Restore original order
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Reorder status</p>
                      <p className="text-lg font-semibold">{pdfName || "No PDF selected"}</p>
                      {pageCount ? (
                        <p className="mt-1 text-xs text-muted-foreground">{pageCount} total pages</p>
                      ) : null}
                    </div>
                    <Button onClick={handleRearrange} disabled={!pageOrder.length || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                      {isProcessing ? "Reordering" : "Export order"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {resultUrl && !error && !isProcessing && (
                    <p className="mt-3 text-sm text-muted-foreground">New sequence ready. Download below.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-background/90 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Drag to reorder</p>
                    <span className="text-xs text-muted-foreground">{pageOrder.length ? `${pageOrder.length} pages` : "Waiting for PDF"}</span>
                  </div>
                  <ul className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-2">
                    {pageOrder.length ? (
                      pageOrder.map((pageNumber, index) => (
                        <li
                          key={pageNumber}
                          onDragEnter={handleDragEnter(index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                            activeDragIndex === index ? "border-primary bg-primary/5" : "border-border bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background"
                              draggable
                              onDragStart={handleDragStart(index)}
                            >
                              <GripVertical className="size-4" />
                            </button>
                            <div>
                              <p className="font-semibold">Page {pageNumber}</p>
                              <p className="text-xs text-muted-foreground">Position {index + 1}</p>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-xl border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
                        Upload a PDF to generate sortable page chips.
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Reordered PDF</p>
                      <p className="text-xs text-muted-foreground">
                        {resultUrl ? resultFileName : "Rearrange pages to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadReorderedPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  {resultOrder.length ? (
                    <p className="text-xs text-muted-foreground">New order: {resultOrder.join(" → ")}</p>
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
