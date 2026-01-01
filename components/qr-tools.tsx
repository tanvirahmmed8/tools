"use client"

import type { ReactNode } from "react"
import { useState, useCallback, useEffect } from "react"
import jsQR from "jsqr"
import QRCode from "qrcode"
import JSZip from "jszip"
import { Check, Copy, Download, Loader2, QrCode, RefreshCcw, ScanLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CameraScanner } from "@/components/camera-scanner"
import { GlowCard } from "@/components/ui/glow-card"
import { DropZone } from "@/components/drop-zone"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"

type QrToolsProps = {
  children?: ReactNode
}

export function QrTools({ children }: QrToolsProps) {
    // Helper to convert dataURL to File (must be inside the component for client-only use)
    function dataUrlToFile(dataUrl: string, filename: string, mimeType: string) {
      const arr = dataUrl.split(',')
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mimeType })
    }
  const [qrImagePreview, setQrImagePreview] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState("")
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [copied, setCopied] = useState(false)

  const [qrInput, setQrInput] = useState("")
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Bulk QR from CSV
  const [csvName, setCsvName] = useState("")
  const [csvRows, setCsvRows] = useState<Array<{ value: string; name?: string }>>([])
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkCount, setBulkCount] = useState(0)

  useEffect(() => {
    return () => {
      if (qrImagePreview) {
        URL.revokeObjectURL(qrImagePreview)
      }
    }
  }, [qrImagePreview])

  const resetDecode = useCallback(() => {
    setDecodedText("")
    setDecodeError(null)
    setIsDecoding(false)
    setQrImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
  }, [])

  const handleDecodeUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setDecodeError("Please upload an image that contains a QR code.")
      return
    }

    setDecodedText("")
    setDecodeError(null)
    setIsDecoding(true)

    const objectUrl = URL.createObjectURL(file)
    setQrImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return objectUrl
    })

    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext("2d")

      if (!context) {
        setDecodeError("Unable to read the QR code. Please try a different file.")
        setIsDecoding(false)
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code?.data) {
        setDecodedText(code.data)
        setDecodeError(null)
      } else {
        setDecodedText("")
        setDecodeError("No QR code detected. Try a clearer image or crop closer to the code.")
      }

      setIsDecoding(false)
    }

    image.onerror = () => {
      setDecodeError("Failed to load the image. Please try again.")
      setIsDecoding(false)
    }

    image.src = objectUrl
  }, [])

  const handleCopy = useCallback(async () => {
    if (!decodedText) return

    try {
      await navigator.clipboard.writeText(decodedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text", err)
      setDecodeError("Copy failed. Please copy the text manually.")
    }
  }, [decodedText])

  const generateQr = useCallback(async () => {
    if (!qrInput.trim()) {
      setGenerateError("Enter text or a URL to create a QR code.")
      return
    }

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const dataUrl = await QRCode.toDataURL(qrInput.trim(), {
        width: 480,
        margin: 2,
      })
      setQrImage(dataUrl)
    } catch (err) {
      console.error("Failed to generate QR code", err)
      setGenerateError("QR code generation failed. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [qrInput])

  const downloadQr = useCallback(() => {
    if (!qrImage) return

    const link = document.createElement("a")
    link.href = qrImage
    link.download = "textextract-qr.png"
    link.click()
  }, [qrImage])

  // --- CSV Bulk helpers ---
  const parseCSV = (text: string): Array<{ value: string; name?: string }> => {
    const rows: string[][] = []
    let cur: string[] = []
    let cell = ""
    let inQuotes = false
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i]
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i += 1 } else { inQuotes = false }
        } else {
          cell += ch
        }
      } else {
        if (ch === '"') inQuotes = true
        else if (ch === ',') { cur.push(cell); cell = "" }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i += 1
          cur.push(cell)
          if (cur.length > 1 || (cur.length === 1 && cur[0].trim() !== "")) rows.push(cur)
          cur = []; cell = ""
        } else cell += ch
      }
    }
    cur.push(cell)
    if (cur.length > 1 || (cur.length === 1 && cur[0].trim() !== "")) rows.push(cur)

    return rows.map((cols) => ({ value: (cols[0] ?? "").trim(), name: (cols[1] ?? "").trim() || undefined })).filter(r => r.value.length > 0)
  }

  const handleCsvFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setBulkError("Please upload a CSV file.")
      return
    }
    setBulkError(null)
    setCsvName(file.name)
    const text = await file.text()
    const rows = parseCSV(text)
    if (!rows.length) {
      setBulkError("No rows found in CSV. First column must contain the QR text.")
      setCsvRows([])
      setBulkCount(0)
      return
    }
    setCsvRows(rows)
    setBulkCount(rows.length)
  }, [])

  const handleCsvDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleCsvFile(file)
  }, [handleCsvFile])

  const handleCsvSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleCsvFile(file)
  }, [handleCsvFile])

  const generateZipFromCsv = useCallback(async () => {
    if (!csvRows.length) return
    setIsBulkGenerating(true)
    setBulkError(null)
    try {
      const zip = new JSZip()
      for (let i = 0; i < csvRows.length; i += 1) {
        const row = csvRows[i]
        const dataUrl = await QRCode.toDataURL(row.value, { width: 480, margin: 2 })
        const b64 = dataUrl.split(",")[1] ?? ""
        const filename = `${row.name || `qr-${i + 1}`}.png`
        zip.file(filename, b64, { base64: true })
      }
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = (csvName ? csvName.replace(/\.csv$/i, "") : "qrcodes") + "-qrcodes.zip"
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setBulkError("Failed to generate ZIP. Try a smaller batch or simpler values.")
    } finally {
      setIsBulkGenerating(false)
    }
  }, [csvRows, csvName])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="QR Toolkit" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <ScanLine className="size-4" />
            <span>QR code utilities</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
            Convert QR codes to text and spin up new QR codes in seconds
          </h1>
          <p className="text-lg text-muted-foreground">
            Drop any QR snapshot to read the embedded payload or type a message to generate a shareable code. Both flows are
            browser-only for complete privacy.
          </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="cobalt" className="p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Decode QR</p>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ScanLine className="size-5" />
                    QR to Text
                  </h2>
                </div>
                {qrImagePreview && (
                  <Button variant="ghost" size="sm" onClick={resetDecode} className="text-muted-foreground hover:text-foreground">
                    <RefreshCcw className="size-4" />
                    Reset
                  </Button>
                )}
              </div>

              {qrImagePreview ? (
                <div className="relative rounded-lg border border-border bg-muted/50">
                  <img src={qrImagePreview} alt="Uploaded QR code" className="w-full rounded-lg object-contain" />
                  {isDecoding && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                      <Loader2 className="size-6 animate-spin" />
                      <p className="mt-2 text-sm text-muted-foreground">Scanning QR...</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <CameraScanner
                    label="Scan QR with Camera"
                    onCapture={(dataUrl) => {
                      const arr = dataUrl.split(',');
                      const bstr = atob(arr[1]);
                      let n = bstr.length;
                      const u8arr = new Uint8Array(n);
                      while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                      }
                      const file = new File([u8arr], 'qr-capture.png', { type: 'image/png' });
                      handleDecodeUpload(file);
                    }}
                  />
                  <div className="my-2 text-center text-xs text-muted-foreground">or upload an image</div>
                  <DropZone onFileUpload={handleDecodeUpload} />
                </>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <QrCode className="size-4" />
                    Detected text
                  </h3>
                  {decodedText && (
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
                      {copied ? (
                        <>
                          <Check className="size-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="min-h-[180px] rounded-lg border border-border bg-background/70 p-4 text-sm">
                  {decodeError ? (
                    <p className="text-destructive">{decodeError}</p>
                  ) : decodedText ? (
                    <p className="whitespace-pre-wrap font-mono leading-relaxed">{decodedText}</p>
                  ) : (
                    <p className="text-muted-foreground">Upload a QR code image to reveal its contents.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Generate QR</p>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <QrCode className="size-5" />
                    Text to QR
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="qr-input" className="text-sm font-medium">
                  Message or URL
                </label>
                <textarea
                  id="qr-input"
                  className="min-h-[150px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Paste any text, deep link, or short instruction."
                  value={qrInput}
                  onChange={(event) => setQrInput(event.target.value)}
                />
                {generateError && <p className="text-sm text-destructive">{generateError}</p>}
                <Button onClick={generateQr} disabled={isGenerating} className="w-full justify-center">
                  {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
                  {isGenerating ? "Building QR" : "Generate QR code"}
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
                {qrImage ? (
                  <div className="space-y-4">
                    <img src={qrImage} alt="Generated QR code" className="mx-auto size-48 rounded bg-white p-2 shadow-sm" />
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button onClick={downloadQr}>
                        <Download className="size-4" />
                        Download PNG
                      </Button>
                      <Button variant="outline" onClick={() => setQrImage(null)}>
                        <RefreshCcw className="size-4" />
                        New code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Your QR preview will appear here once generated.</p>
                )}
              </div>
            </div>
          </div>
          </GlowCard>
          {/* Bulk QR generation */}
          <GlowCard tone="violet" className="mt-8 p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Bulk generate</p>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <QrCode className="size-5" />
                    QR codes from CSV
                  </h2>
                </div>
                {csvRows.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => { setCsvRows([]); setCsvName(""); setBulkCount(0); setBulkError(null) }} className="text-muted-foreground hover:text-foreground">
                    <RefreshCcw className="size-4" />
                    Reset
                  </Button>
                )}
              </div>

              <label
                className="relative flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 text-center text-sm transition-all duration-200 border-border hover:border-primary/60 hover:bg-muted/40"
                onDragOver={(e) => { e.preventDefault() }}
                onDrop={handleCsvDrop}
              >
                <input type="file" accept=".csv,text/csv" onChange={handleCsvSelect} className="sr-only" />
                <ScanLine className="mb-3 size-6 text-muted-foreground" />
                <p className="font-medium">{csvName || "Drag & drop a CSV or click to browse"}</p>
                <p className="mt-1 text-xs text-muted-foreground">CSV columns: value,name (name optional)</p>
              </label>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                {bulkError ? (
                  <p className="text-destructive">{bulkError}</p>
                ) : csvRows.length ? (
                  <p className="text-muted-foreground">Parsed {bulkCount} row(s). Click Generate ZIP to export PNG QR codes.</p>
                ) : (
                  <p className="text-muted-foreground">Upload a CSV where the first column contains the QR text. Second column (optional) will be used as filename.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={generateZipFromCsv} disabled={!csvRows.length || isBulkGenerating}>
                  {isBulkGenerating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
                  {isBulkGenerating ? "Generating ZIP" : "Generate ZIP"}
                </Button>
                <Button variant="outline" onClick={() => {
                  const sample = "value,name\nhttps://example.com,link-1\nHELLO WORLD,hello";
                  const blob = new Blob([sample], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "qrcodes-sample.csv"
                  a.click()
                  URL.revokeObjectURL(url)
                }}>
                  Download sample CSV
                </Button>
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
