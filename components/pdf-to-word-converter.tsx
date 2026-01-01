"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Download, FileOutput, FileText, Loader2, Sparkles, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { convertPdfToWord } from "@/app/actions"

const WORD_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

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

type PdfToWordConverterProps = {
  children?: ReactNode
}

export function PdfToWordConverter({ children }: PdfToWordConverterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [wordUrl, setWordUrl] = useState<string | null>(null)
  const [wordFileName, setWordFileName] = useState("textextract-doc.docx")
  const [textPreview, setTextPreview] = useState("")
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
      if (wordUrl) {
        URL.revokeObjectURL(wordUrl)
      }
    }
  }, [pdfPreviewUrl, wordUrl])

  const resetArtifacts = useCallback(() => {
    setTextPreview("")
    setError(null)
    setCopied(false)
    setWordUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setPageCount(null)
  }, [])

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
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

  const handleConvert = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload a PDF before converting.")
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const base64 = await fileToBase64(selectedFile)
      const result = await convertPdfToWord(base64)

      setTextPreview(result.text)
      setWordFileName(result.fileName)
      setWordUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.docxBase64, WORD_MIME))
      })
      setPageCount(result.pageCount ?? null)
    } catch (conversionError) {
      console.error(conversionError)
      setError("Conversion failed. Please try again or use a different PDF.")
      setPageCount(null)
    } finally {
      setIsConverting(false)
    }
  }, [selectedFile])

  const handleCopy = useCallback(async () => {
    if (!textPreview) return
    try {
      await navigator.clipboard.writeText(textPreview)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (copyError) {
      console.error(copyError)
      setError("Copy failed. Please copy the text manually.")
    }
  }, [textPreview])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPdfName("")
    setPdfPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    resetArtifacts()
  }, [resetArtifacts])

  const downloadWord = useCallback(() => {
    if (!wordUrl) return
    const link = document.createElement("a")
    link.href = wordUrl
    link.download = wordFileName
    link.click()
  }, [wordFileName, wordUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="PDF to Word" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Document conversion</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
              Create a pixel-perfect Word twin of your PDF
            </h1>
            <p className="text-lg text-muted-foreground">
              Every page is rendered at high resolution and placed into Word, so colors, layout, and typography stay intact.
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

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Keeps original layout, color, and typography.</li>
                  <li>• Ideal for branded decks, invoices, and brochures.</li>
                  <li>• Extracted text preview stays available for quick edits.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Conversion status</p>
                      <p className="text-lg font-semibold">{selectedFile ? pdfName || "Ready to convert" : "No PDF selected"}</p>
                      {typeof pageCount === "number" && !isConverting && !error && (
                        <p className="mt-1 text-xs text-muted-foreground">{pageCount} page{pageCount === 1 ? "" : "s"} rendered at full fidelity.</p>
                      )}
                    </div>
                    <Button onClick={handleConvert} disabled={!selectedFile || isConverting}>
                      {isConverting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileOutput className="mr-2 size-4" />}
                      {isConverting ? "Converting" : "Convert to Word"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {wordUrl && !error && !isConverting && (
                    <p className="mt-3 text-sm text-muted-foreground">Conversion complete. Download your .docx below.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Word download</p>
                      <p className="text-xs text-muted-foreground">
                        {wordUrl ? wordFileName : "Convert a PDF to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadWord} disabled={!wordUrl || isConverting}>
                      <Download className="mr-2 size-4" />
                      Download .docx
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    We flatten every PDF page into a high-res canvas inside Word for exact visual parity. Use the text preview below if
                    you need editable copy.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="size-4" />
                      Extracted text preview
                    </h3>
                    {textPreview && (
                      <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground">
                        {copied ? (
                          <>
                            <Check className="mr-1 size-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 size-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="min-h-[220px] rounded-xl border border-border bg-background/80 p-4 text-sm">
                    {textPreview ? (
                      <p className="whitespace-pre-wrap font-mono leading-relaxed">{textPreview}</p>
                    ) : (
                      <p className="text-muted-foreground">Convert a PDF to preview the extracted text.</p>
                    )}
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
