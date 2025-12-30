"use client"

import { useState, useCallback, useEffect } from "react"
import jsQR from "jsqr"
import QRCode from "qrcode"
import { Check, Copy, Download, Loader2, QrCode, RefreshCcw, ScanLine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CameraScanner } from "@/components/camera-scanner"
import { Card } from "@/components/ui/card"
import { DropZone } from "@/components/drop-zone"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"

export function QrTools() {
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
          <Card className="border-border/60 bg-card/70 p-6 md:p-8">
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
          </Card>
        </PageContainer>
      </section>
    </div>
  )
}
