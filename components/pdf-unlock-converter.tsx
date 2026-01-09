"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { Download, KeyRound, Loader2, LockOpen, Sparkles, Upload, X } from "lucide-react"

import { unlockPdf } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

const PDF_MIME = "application/pdf"

type PdfUnlockConverterProps = {
  children?: ReactNode
}

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

export function PdfUnlockConverter({ children }: PdfUnlockConverterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [password, setPassword] = useState("")
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState("unlocked-document.pdf")
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
    setResultUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setResultFileName("unlocked-document.pdf")
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== PDF_MIME) {
        setError("Please upload a PDF file under 20 MB.")
        return
      }
      setSelectedFile(file)
      setPdfName(file.name)
      setError(null)
      resetResults()
    },
    [resetResults],
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
    setPassword("")
    setError(null)
    resetResults()
  }, [resetResults])

  const handleUnlock = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload the locked PDF to continue.")
      return
    }
    if (!password.trim()) {
      setError("Enter the password used to open this PDF.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const base64 = await fileToBase64(selectedFile)
      const result = await unlockPdf(base64, { password })
      setResultFileName(result.fileName)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (unlockError) {
      console.error(unlockError)
      const message = unlockError instanceof Error ? unlockError.message : "Failed to unlock the PDF."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [password, resetResults, selectedFile])

  const downloadUnlockedPdf = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = resultFileName
    link.click()
  }, [resultFileName, resultUrl])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Unlock PDF" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Remove PDF passwords</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Unlock PDFs before sending or archiving</h1>
            <p className="text-lg text-muted-foreground">
              Drop the secured PDF, provide the open password once, and export a clean copy without enforcement so printers, OCR, or e-sign tools stop complaining.
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
                    Upload locked PDF
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
                  <LockOpen className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB • tested with user-password protected PDFs</p>
                </label>

                <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                  <label className="block text-sm font-medium">Open password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter the password required to open this PDF"
                  />
                  <p className="text-xs text-muted-foreground">
                    The password never leaves your browser. It is used once to decrypt the file locally.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">When to unlock</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Prep PDFs for e-sign workflows that reject encrypted uploads.</li>
                    <li>Feed decks to OCR or parsing tools that cannot enter passwords.</li>
                    <li>Archive regulatory packets without juggling shared secrets.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Unlock status</p>
                      <p className="text-lg font-semibold">{pdfName || "No PDF selected"}</p>
                      {resultUrl && !error ? (
                        <p className="mt-1 text-xs text-muted-foreground">Unlocked successfully</p>
                      ) : null}
                    </div>
                    <Button onClick={handleUnlock} disabled={!selectedFile || !password.trim() || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <KeyRound className="mr-2 size-4" />}
                      {isProcessing ? "Unlocking" : "Unlock PDF"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {resultUrl && !error && !isProcessing && (
                    <p className="mt-3 text-sm text-muted-foreground">Password removed. Download your open PDF below.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Unlocked PDF</p>
                      <p className="text-xs text-muted-foreground">
                        {resultUrl ? resultFileName : "Unlock the PDF to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadUnlockedPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  {resultUrl && (
                    <p className="text-xs text-muted-foreground">
                      Share responsibly — unlocked copies inherit the original content exactly as-is.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Need to re-lock the file later?</p>
                  <p className="mt-2">
                    Pair this workflow with Protect PDF Password to enforce a new credential before distributing external copies.
                  </p>
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
