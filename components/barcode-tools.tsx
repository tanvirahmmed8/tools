"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"
import JSZip from "jszip"
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library"
import { Barcode, Check, Copy, Download, Loader2, RefreshCcw, ScanBarcode, ScanText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CameraScanner } from "@/components/camera-scanner"
import { Card } from "@/components/ui/card"
import { DropZone } from "@/components/drop-zone"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"

export function BarcodeTools() {
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
  const [barcodePreview, setBarcodePreview] = useState<string | null>(null)
  const [decodedText, setDecodedText] = useState("")
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [isDecoding, setIsDecoding] = useState(false)
  const [copied, setCopied] = useState(false)

  const [barcodeInput, setBarcodeInput] = useState("")
  const [barcodeImage, setBarcodeImage] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Bulk generation from CSV
  const [csvName, setCsvName] = useState("")
  const [csvRows, setCsvRows] = useState<Array<{ value: string; name?: string }>>([])
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkCount, setBulkCount] = useState(0)

  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    return () => {
      if (barcodePreview) {
        URL.revokeObjectURL(barcodePreview)
      }
    }
  }, [barcodePreview])

  const getReader = useCallback(() => {
    if (!readerRef.current) {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.ITF,
      ])
      readerRef.current = new BrowserMultiFormatReader(hints)
    }
    return readerRef.current
  }, [])

  const resetDecode = useCallback(() => {
    setDecodedText("")
    setDecodeError(null)
    setIsDecoding(false)
    setBarcodePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
  }, [])

  const handleDecodeUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setDecodeError("Upload a barcode image (PNG, JPG, or WEBP).")
        return
      }

      setIsDecoding(true)
      setDecodeError(null)
      setDecodedText("")

      const objectUrl = URL.createObjectURL(file)
      setBarcodePreview((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return objectUrl
      })

      const image = new Image()
      image.onload = async () => {
        try {
          const reader = getReader()
          const result = await reader?.decodeFromImageElement(image)
          if (result?.getText()) {
            setDecodedText(result.getText())
            setDecodeError(null)
          } else {
            setDecodeError("No barcode detected. Try a brighter image or crop closer to the code.")
          }
        } catch (err) {
          if (err instanceof NotFoundException) {
            setDecodeError("No barcode detected. Try a brighter image or crop closer to the code.")
          } else {
            console.error("Barcode decode failed", err)
            setDecodeError("Unable to read the barcode. Try another angle or format.")
          }
        } finally {
          setIsDecoding(false)
        }
      }
      image.onerror = () => {
        setDecodeError("Failed to load the image. Please try again.")
        setIsDecoding(false)
      }
      image.src = objectUrl
    },
    [getReader],
  )

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

  const generateBarcode = useCallback(() => {
    if (!barcodeInput.trim()) {
      setGenerateError("Enter text, SKU, or a URL to encode.")
      return
    }

    setIsGenerating(true)
    setGenerateError(null)

    try {
      const canvas = document.createElement("canvas")
      JsBarcode(canvas, barcodeInput.trim(), {
        format: "CODE128",
        displayValue: true,
        fontSize: 16,
        background: "#ffffff",
        lineColor: "#0f172a",
        margin: 8,
      })
      setBarcodeImage(canvas.toDataURL("image/png"))
    } catch (err) {
      console.error("Failed to generate barcode", err)
      setGenerateError("Barcode generation failed. Try shorter text or a different value.")
    } finally {
      setIsGenerating(false)
    }
  }, [barcodeInput])

  const downloadBarcode = useCallback(() => {
    if (!barcodeImage) return
    const link = document.createElement("a")
    link.href = barcodeImage
    link.download = "textextract-barcode.png"
    link.click()
  }, [barcodeImage])

  // --- CSV Bulk helpers ---
  const parseCSV = (text: string): Array<{ value: string; name?: string }> => {
    // Basic CSV parser supporting quotes
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
        if (ch === '"') {
          inQuotes = true
        } else if (ch === ',') {
          cur.push(cell)
          cell = ""
        } else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i += 1
          cur.push(cell)
          if (cur.length > 1 || (cur.length === 1 && cur[0].trim() !== "")) rows.push(cur)
          cur = []
          cell = ""
        } else {
          cell += ch
        }
      }
    }
    cur.push(cell)
    if (cur.length > 1 || (cur.length === 1 && cur[0].trim() !== "")) rows.push(cur)

    // Map to objects: first column is value, optional second is name
    const mapped = rows.map((cols, idx) => {
      const v = (cols[0] ?? "").trim()
      const n = (cols[1] ?? "").trim()
      return { value: v, name: n || undefined }
    }).filter(r => r.value.length > 0)
    return mapped
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
      setBulkError("No rows found in CSV. First column must contain the barcode value.")
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
        const canvas = document.createElement("canvas")
        JsBarcode(canvas, row.value, {
          format: "CODE128",
          displayValue: true,
          fontSize: 16,
          background: "#ffffff",
          lineColor: "#0f172a",
          margin: 8,
        })
        const dataUrl = canvas.toDataURL("image/png")
        const base64 = dataUrl.split(",")[1] ?? ""
        const filename = `${row.name || `barcode-${i + 1}`}.png`
        zip.file(filename, base64, { base64: true })
      }
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = (csvName ? csvName.replace(/\.csv$/i, "") : "barcodes") + "-barcodes.zip"
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
      <SiteNavigation title="Barcode Toolkit" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <ScanBarcode className="size-4" />
            <span>Barcode utilities</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
            Convert barcodes into readable text and create new labels on the fly
          </h1>
          <p className="text-lg text-muted-foreground">
            Drop any barcode snapshot to see the encoded string or generate CODE128 labels for SKUs, tracking numbers, and
            more directly in your browser.
          </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <Card className="border-border/60 bg-card/70 p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Decode barcode</p>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ScanText className="size-5" />
                    Barcode to Text
                  </h2>
                </div>
                {barcodePreview && (
                  <Button variant="ghost" size="sm" onClick={resetDecode} className="text-muted-foreground hover:text-foreground">
                    <RefreshCcw className="size-4" />
                    Reset
                  </Button>
                )}
              </div>

              {barcodePreview ? (
                <div className="relative rounded-lg border border-border bg-muted/50">
                  <img src={barcodePreview} alt="Uploaded barcode" className="w-full rounded-lg object-contain" />
                  {isDecoding && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                      <Loader2 className="size-6 animate-spin" />
                      <p className="mt-2 text-sm text-muted-foreground">Reading barcode...</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <CameraScanner
                    label="Scan Barcode with Camera"
                    onCapture={(dataUrl) => {
                      const arr = dataUrl.split(',');
                      const bstr = atob(arr[1]);
                      let n = bstr.length;
                      const u8arr = new Uint8Array(n);
                      while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                      }
                      const file = new File([u8arr], 'barcode-capture.png', { type: 'image/png' });
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
                    <Barcode className="size-4" />
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
                    <p className="text-muted-foreground">Upload a barcode image to reveal its contents.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Generate barcode</p>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Barcode className="size-5" />
                  Text to Barcode
                </h2>
              </div>

              <div className="space-y-2">
                <label htmlFor="barcode-input" className="text-sm font-medium">
                  Message, SKU, or tracking number
                </label>
                <textarea
                  id="barcode-input"
                  className="min-h-[150px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Paste a product code, shipment ID, or any short text."
                  value={barcodeInput}
                  onChange={(event) => setBarcodeInput(event.target.value)}
                />
                {generateError && <p className="text-sm text-destructive">{generateError}</p>}
                <Button onClick={generateBarcode} disabled={isGenerating} className="w-full justify-center">
                  {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Barcode className="size-4" />}
                  {isGenerating ? "Building barcode" : "Generate barcode"}
                </Button>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
                {barcodeImage ? (
                  <div className="space-y-4">
                    <img src={barcodeImage} alt="Generated barcode" className="mx-auto h-32 rounded bg-white p-2 shadow-sm" />
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button onClick={downloadBarcode}>
                        <Download className="size-4" />
                        Download PNG
                      </Button>
                      <Button variant="outline" onClick={() => setBarcodeImage(null)}>
                        <RefreshCcw className="size-4" />
                        New barcode
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Generated barcodes will appear here.</p>
                )}
              </div>
            </div>
          </div>
          </Card>
          {/* Bulk barcode generation */}
          <Card className="mt-8 border-border/60 bg-card/70 p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Bulk generate</p>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Barcode className="size-5" />
                    Barcodes from CSV
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
                <ScanBarcode className="mb-3 size-6 text-muted-foreground" />
                <p className="font-medium">{csvName || "Drag & drop a CSV or click to browse"}</p>
                <p className="mt-1 text-xs text-muted-foreground">CSV columns: value,name (name optional)</p>
              </label>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                {bulkError ? (
                  <p className="text-destructive">{bulkError}</p>
                ) : csvRows.length ? (
                  <p className="text-muted-foreground">Parsed {bulkCount} row(s). Click Generate ZIP to export PNG barcodes.</p>
                ) : (
                  <p className="text-muted-foreground">Upload a CSV where the first column contains the barcode text. Second column (optional) will be used as filename.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={generateZipFromCsv} disabled={!csvRows.length || isBulkGenerating}>
                  {isBulkGenerating ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
                  {isBulkGenerating ? "Generating ZIP" : "Generate ZIP"}
                </Button>
                <Button variant="outline" onClick={() => {
                  const sample = "value,name\nABC123,sku-1\n987654321098,sku-2";
                  const blob = new Blob([sample], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "barcodes-sample.csv"
                  a.click()
                  URL.revokeObjectURL(url)
                }}>
                  Download sample CSV
                </Button>
              </div>
            </div>
          </Card>
        </PageContainer>
      </section>
    </div>
  )
}
