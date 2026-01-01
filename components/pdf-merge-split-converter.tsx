"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, FileText, Layers, Loader2, Sparkles, Upload, X, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { mergePdfs, splitPdf } from "@/app/actions"

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
  for (let i = 0; i < length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

type SplitResult = { totalPages: number; parts: { fileName: string; pdfBase64: string }[] }

type Tab = "merge" | "split"

export function PdfMergeSplitConverter() {
  const [tab, setTab] = useState<Tab>("merge")

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const [mergedUrl, setMergedUrl] = useState<string | null>(null)
  const [mergedFileName, setMergedFileName] = useState("merged.pdf")

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null)
  const [splitPdfName, setSplitPdfName] = useState("")
  const [ranges, setRanges] = useState<string>("")
  const [isSplitting, setIsSplitting] = useState(false)
  const [splitResults, setSplitResults] = useState<SplitResult | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl)
    }
  }, [mergedUrl])

  const resetError = () => setError(null)

  // Merge handlers
  const handleMergeDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files).filter((f) => f.type === PDF_MIME)
    if (!files.length) return
    resetError()
    setMergeFiles((prev) => [...prev, ...files])
  }, [])

  const handleMergeFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((f) => f.type === PDF_MIME)
    if (!files.length) return
    resetError()
    setMergeFiles((prev) => [...prev, ...files])
  }, [])

  const removeMergeFile = (index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveMergeFile = (index: number, dir: -1 | 1) => {
    setMergeFiles((prev) => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  const canMerge = mergeFiles.length >= 2 && !isMerging

  const handleMerge = useCallback(async () => {
    if (mergeFiles.length < 2) {
      setError("Add at least two PDFs to merge.")
      return
    }
    setIsMerging(true)
    setError(null)
    try {
      const list = await Promise.all(mergeFiles.map((f) => fileToBase64(f)))
      const result = await mergePdfs(list)
      setMergedFileName(result.fileName)
      setMergedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(base64ToBlob(result.pdfBase64, PDF_MIME))
      })
    } catch (e) {
      console.error(e)
      setError("Merge failed. Please try again.")
    } finally {
      setIsMerging(false)
    }
  }, [mergeFiles])

  const downloadMerged = () => {
    if (!mergedUrl) return
    const a = document.createElement("a")
    a.href = mergedUrl
    a.download = mergedFileName
    a.click()
  }

  // Split handlers
  const handleSplitDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && file.type === PDF_MIME) {
      setSplitFile(file)
      setSplitPdfName(file.name)
      resetError()
      setSplitResults(null)
    }
  }, [])

  const handleSplitFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === PDF_MIME) {
      setSplitFile(file)
      setSplitPdfName(file.name)
      resetError()
      setSplitResults(null)
    }
  }, [])

  const canSplit = !!splitFile && !isSplitting

  const handleSplit = useCallback(async () => {
    if (!splitFile) return
    setIsSplitting(true)
    setError(null)
    try {
      const b64 = await fileToBase64(splitFile)
      const result = await splitPdf(b64, { ranges: ranges.trim() })
      setSplitResults(result)
    } catch (e) {
      console.error(e)
      setError("Split failed. Check your range format and try again.")
    } finally {
      setIsSplitting(false)
    }
  }, [splitFile, ranges])

  const downloadPart = (part: { fileName: string; pdfBase64: string }) => {
    const url = URL.createObjectURL(base64ToBlob(part.pdfBase64, PDF_MIME))
    const a = document.createElement("a")
    a.href = url
    a.download = part.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const headerTitle = useMemo(() => (tab === "merge" ? "PDF Merge" : "PDF Split"), [tab])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="PDF Merge / Split" />
      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <Sparkles className="size-4" />
            <span>PDF merge & split</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
              {headerTitle} files in seconds
            </h1>
            <p className="text-lg text-muted-foreground">
              Combine multiple PDFs into one or split a PDF by pages or ranges. All processing happens on-device.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-4">
        <PageContainer>
          <div className="mb-4 flex gap-2">
            <Button variant={tab === "merge" ? "default" : "outline"} onClick={() => setTab("merge")}>
              Merge PDFs
            </Button>
            <Button variant={tab === "split" ? "default" : "outline"} onClick={() => setTab("split")}>
              Split PDF
            </Button>
          </div>

          {tab === "merge" ? (
            <GlowCard tone="iris" className="p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Upload className="size-4" />
                      Add PDFs (2+)
                    </h2>
                    {mergeFiles.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setMergeFiles([])} className="text-muted-foreground">
                        <X className="mr-1 size-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <label
                    className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-all duration-200 ${
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false)
                    }}
                    onDrop={handleMergeDrop}
                  >
                    <input type="file" multiple accept="application/pdf" onChange={handleMergeFileSelect} className="sr-only" />
                    <FileText className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-medium">
                      {isDragging ? "Drop your PDFs here" : "Drag & drop or click to browse"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Supports PDFs up to 20 MB each</p>
                  </label>

                  {mergeFiles.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium">Order</p>
                      <ul className="space-y-2">
                        {mergeFiles.map((f, i) => (
                          <li key={i} className="flex items-center justify-between gap-2 rounded border border-border/60 bg-background p-2 text-sm">
                            <span className="truncate">{i + 1}. {f.name}</span>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" onClick={() => moveMergeFile(i, -1)} title="Move up">
                                <ArrowUp className="size-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => moveMergeFile(i, 1)} title="Move down">
                                <ArrowDown className="size-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => removeMergeFile(i)} title="Remove">
                                <X className="size-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Merge status</p>
                        <p className="text-lg font-semibold">{mergeFiles.length ? `${mergeFiles.length} files ready` : "No PDFs selected"}</p>
                      </div>
                      <Button onClick={handleMerge} disabled={!canMerge}>
                        {isMerging ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Layers className="mr-2 size-4" />}
                        {isMerging ? "Merging" : "Merge PDFs"}
                      </Button>
                    </div>
                    {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                    {mergedUrl && !error && !isMerging && (
                      <p className="mt-3 text-sm text-muted-foreground">Merge complete. Download your PDF below.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Merged PDF download</p>
                        <p className="text-xs text-muted-foreground">{mergedUrl ? mergedFileName : "Merge to enable download"}</p>
                      </div>
                      <Button onClick={downloadMerged} disabled={!mergedUrl || isMerging}>
                        <Download className="mr-2 size-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          ) : (
            <GlowCard tone="rose" className="p-6 md:p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Upload className="size-4" />
                      Upload PDF
                    </h2>
                    {splitFile && (
                      <Button variant="ghost" size="sm" onClick={() => { setSplitFile(null); setSplitPdfName(""); setSplitResults(null) }} className="text-muted-foreground">
                        <X className="mr-1 size-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <label
                    className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-all duration-200 ${
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
                    onDrop={handleSplitDrop}
                  >
                    <input type="file" accept="application/pdf" onChange={handleSplitFileSelect} className="sr-only" />
                    <FileText className={`mb-3 size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-medium">{isDragging ? "Drop your PDF here" : splitPdfName || "Drag & drop or click to browse"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Supports PDFs up to 20 MB</p>
                  </label>
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                    <label className="block text-sm font-medium">Page ranges (optional)</label>
                    <input
                      type="text"
                      value={ranges}
                      onChange={(e) => setRanges(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. 1-3,5,7"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to split every page into its own PDF.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Split status</p>
                        <p className="text-lg font-semibold">{splitFile ? splitPdfName : "No PDF selected"}</p>
                      </div>
                      <Button onClick={handleSplit} disabled={!canSplit}>
                        {isSplitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Layers className="mr-2 size-4" />}
                        {isSplitting ? "Splitting" : "Split PDF"}
                      </Button>
                    </div>
                    {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                    {splitResults && !error && !isSplitting && (
                      <p className="mt-3 text-sm text-muted-foreground">Split complete. Download your parts below.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Outputs</p>
                        <p className="text-xs text-muted-foreground">{splitResults ? `${splitResults.parts.length} file(s)` : "Split to see outputs"}</p>
                      </div>
                    </div>
                    {splitResults && (
                      <ul className="mt-3 space-y-2">
                        {splitResults.parts.map((p, i) => (
                          <li key={i} className="flex items-center justify-between gap-2 rounded border border-border/60 bg-background p-2 text-sm">
                            <span className="truncate">{p.fileName}</span>
                            <Button size="sm" onClick={() => downloadPart(p)}>
                              <Download className="mr-2 size-4" />
                              Download
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </GlowCard>
          )}
        </PageContainer>
      </section>
    </div>
  )
}
