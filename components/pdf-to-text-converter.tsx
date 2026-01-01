"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { FileText, Copy, Check, Loader2, Shield, Layers, Sparkles, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { extractTextFromPdf } from "@/app/actions"

export function PdfToTextConverter() {
  const [pdfName, setPdfName] = useState<string>("")
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl)
      }
    }
  }, [pdfPreviewUrl])

  const resetState = useCallback(() => {
    setPdfName("")
    setExtractedText("")
    setError(null)
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl(null)
    }
  }, [pdfPreviewUrl])

  const processPdf = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.")
      return
    }

    setError(null)
    setPdfName(file.name)
    const objectUrl = URL.createObjectURL(file)
    setPdfPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return objectUrl
    })

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string) ?? ""
      const payload = base64.includes(",") ? base64.split(",")[1] ?? "" : base64

      setIsProcessing(true)
      setExtractedText("")

      try {
        const text = await extractTextFromPdf(payload)
        setExtractedText(text)
      } catch (err) {
        console.error(err)
        setError("Failed to extract text from PDF. Please try again.")
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) {
        processPdf(file)
      }
    },
    [processPdf],
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        processPdf(file)
      }
    },
    [processPdf],
  )

  const handleCopy = useCallback(async () => {
    if (!extractedText) return

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(extractedText)
      } else if (typeof window !== "undefined") {
        const textarea = document.createElement("textarea")
        textarea.value = extractedText
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      } else {
        throw new Error("Clipboard API not available")
      }

      setError(null)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text", err)
      setError("Copy failed. Please copy the text manually.")
    }
  }, [extractedText])

  const handleClear = useCallback(() => {
    resetState()
  }, [resetState])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="PDF Text Extractor" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm mb-6">
            <Sparkles className="size-3.5" />
            <span>Multi-page aware AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-balance">Extract searchable text from any PDF</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Upload handbooks, invoices, lecture notes, or contracts and receive clean, ready-to-use text in seconds.
          </p>
          </div>

          <GlowCard tone="azure" className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium flex items-center gap-2">
                  <Upload className="size-4" />
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
                <Upload className={`size-10 mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium">
                  {isDragging ? "Drop your PDF here" : pdfName ? pdfName : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Supports PDFs up to 20 MB</p>
              </label>

              {pdfPreviewUrl && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2">
                  <p className="font-medium">Preview</p>
                  <iframe src={pdfPreviewUrl} className="w-full h-48 rounded border border-border bg-white" title="PDF preview" />
                  <p className="text-xs text-muted-foreground">
                    Preview uses your local file and never leaves the browser.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium flex items-center gap-2">
                  <FileText className="size-4" />
                  Extracted Text
                </h2>
                {extractedText && (
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
                    {copied ? (
                      <>
                        <Check className="size-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="relative min-h-[200px] md:min-h-[280px] rounded-lg bg-muted border border-border p-4 overflow-auto">
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Reading PDF...</span>
                  </div>
                )}

                {error ? (
                  <p className="text-destructive text-sm">{error}</p>
                ) : extractedText ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {extractedText}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="size-10 mb-2 opacity-50" />
                    <p className="text-sm">Upload a PDF to see extracted text</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      <section className="border-t border-border bg-card/50">
        <PageContainer className="py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Layers className="size-5" />}
              title="Understands layout"
              description="Keeps headings, bullet lists, and tables intact for easier editing."
            />
            <FeatureCard
              icon={<Shield className="size-5" />}
              title="Secure processing"
              description="Files are processed server-side and never stored once extraction is done."
            />
            <FeatureCard
              icon={<Sparkles className="size-5" />}
              title="AI accuracy"
              description="Powered by GPT-4o to read dense reports, scans, and forms."
            />
          </div>
        </PageContainer>
      </section>

      <footer className="border-t border-border">
        <PageContainer className="py-8 text-center text-sm text-muted-foreground">
          <p>Switch back to the <a href="/" className="text-foreground underline-offset-4 underline">image converter</a> anytime.</p>
        </PageContainer>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center size-12 rounded-xl bg-secondary text-foreground">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
