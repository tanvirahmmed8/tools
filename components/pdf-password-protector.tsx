"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { Download, Loader2, LockKeyhole, Shield, Sparkles, Upload, X } from "lucide-react"

import { protectPdfWithPassword } from "@/app/actions"
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

const PERMISSION_OPTIONS = [
  { label: "Allow printing", value: "print" },
  { label: "Allow copying", value: "copy" },
  { label: "Allow annotations", value: "annotate" },
]

type PdfPasswordProtectorProps = {
  children?: ReactNode
}

export function PdfPasswordProtector({ children }: PdfPasswordProtectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFileName, setResultFileName] = useState("protected-document.pdf")
  const [serviceDownloadUrl, setServiceDownloadUrl] = useState<string | null>(null)
  const [expiresOn, setExpiresOn] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [copiedPermissions, setCopiedPermissions] = useState(false)

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
    setServiceDownloadUrl(null)
    setExpiresOn(null)
    setResultFileName("protected-document.pdf")
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

  const togglePermission = useCallback((value: string) => {
    setPermissions((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]))
  }, [])

  const validatePasswords = () => {
    if (password.length < 4) {
      setError("Use at least 4 characters for the open password.")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Re-enter them to continue.")
      return false
    }
    return true
  }

  const handleProtect = useCallback(async () => {
    if (!selectedFile) {
      setError("Upload a PDF before securing it.")
      return
    }
    if (!validatePasswords()) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const base64 = await fileToBase64(selectedFile)
      const result = await protectPdfWithPassword(base64, {
        userPassword: password,
        ownerPassword: ownerPassword.trim() || undefined,
        permissions,
      })

      setResultFileName(result.fileName)
      setServiceDownloadUrl(result.downloadUrl ?? null)
      setExpiresOn(result.expiresOn ?? null)
      setResultUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
      setCopiedPermissions(false)
      setError(null)
    } catch (protectionError) {
      console.error(protectionError)
      const message = protectionError instanceof Error ? protectionError.message : "Failed to protect the PDF."
      setError(message)
      resetResults()
    } finally {
      setIsProcessing(false)
    }
  }, [ownerPassword, password, permissions, resetResults, selectedFile, validatePasswords])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setPdfName("")
    setPassword("")
    setConfirmPassword("")
    setOwnerPassword("")
    setPermissions([])
    setError(null)
    resetResults()
  }, [resetResults])

  const downloadProtectedPdf = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = resultFileName
    link.click()
  }, [resultFileName, resultUrl])

  const copyPermissions = useCallback(async () => {
    if (!permissions.length) return
    try {
      await navigator.clipboard.writeText(permissions.join(", "))
      setCopiedPermissions(true)
      setTimeout(() => setCopiedPermissions(false), 2000)
    } catch (copyError) {
      console.error(copyError)
      setError("Clipboard copy failed. Copy permissions manually instead.")
    }
  }, [permissions])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Protect PDF" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>Password-first sharing</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Add a password before sending your PDF</h1>
            <p className="text-lg text-muted-foreground">
              Enforce open passwords, optional owner controls, and granular permissions in one browser-friendly workflow.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <GlowCard tone="amber" className="p-6 md:p-8">
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
                  <LockKeyhole className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{isDragging ? "Drop your PDF here" : pdfName || "Drag & drop or click to browse"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Max 20 MB • stays on-device until protected</p>
                </label>

                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                  <div>
                    <label className="block text-sm font-medium">Open password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Minimum 4 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Repeat the password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Owner password (optional)</label>
                    <input
                      type="password"
                      value={ownerPassword}
                      onChange={(event) => setOwnerPassword(event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Needed to change permissions later"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-sm font-semibold">Fine-grained permissions</p>
                  <p className="text-xs text-muted-foreground">Choose what viewers can still do after entering the password.</p>
                  <div className="mt-3 space-y-2">
                    {PERMISSION_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={permissions.includes(option.value)}
                          onChange={() => togglePermission(option.value)}
                          className="size-4"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Protection status</p>
                      <p className="text-lg font-semibold">{pdfName || "No PDF selected"}</p>
                      {permissions.length ? (
                        <button
                          type="button"
                          className="mt-1 text-xs text-primary underline decoration-dotted"
                          onClick={copyPermissions}
                          disabled={!permissions.length}
                        >
                          {copiedPermissions ? "Copied permissions" : "Copy permissions"}
                        </button>
                      ) : null}
                    </div>
                    <Button onClick={handleProtect} disabled={!selectedFile || isProcessing}>
                      {isProcessing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Shield className="mr-2 size-4" />}
                      {isProcessing ? "Securing" : "Protect PDF"}
                    </Button>
                  </div>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                  {resultUrl && !error && !isProcessing && (
                    <p className="mt-3 text-sm text-muted-foreground">Protection complete. Download your secured PDF below.</p>
                  )}
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Protected PDF</p>
                      <p className="text-xs text-muted-foreground">
                        {resultUrl ? resultFileName : "Protect a PDF to enable download"}
                      </p>
                    </div>
                    <Button onClick={downloadProtectedPdf} disabled={!resultUrl || isProcessing}>
                      <Download className="mr-2 size-4" />
                      Download PDF
                    </Button>
                  </div>
                  {serviceDownloadUrl && (
                    <p className="text-xs text-muted-foreground break-all">
                      Cloud link: {serviceDownloadUrl}
                      {expiresOn ? ` • expires ${new Date(expiresOn).toLocaleString()}` : ""}
                    </p>
                  )}
                </div>

                {resultUrl && (
                  <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Remember:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      <li>Share the open password via a different channel than the PDF.
                      </li>
                      <li>Keep the owner password private so you can update permissions later.</li>
                      <li>Test the protected file locally before distributing it widely.</li>
                    </ul>
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
