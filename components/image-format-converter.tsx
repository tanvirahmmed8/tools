"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropZone } from "@/components/drop-zone"
import { PageContainer } from "@/components/page-container"
import { SiteNavigation } from "@/components/site-navigation"
import { Check, Copy, Download, Images, Loader2, Sparkles, SwatchBook, X } from "lucide-react"

interface FormatOption {
  label: string
  mime: string
  extension: string
  lossy?: boolean
}

const FORMAT_OPTIONS: FormatOption[] = [
  { label: "PNG (.png)", mime: "image/png", extension: "png" },
  { label: "JPEG (.jpg)", mime: "image/jpeg", extension: "jpg", lossy: true },
  { label: "WEBP (.webp)", mime: "image/webp", extension: "webp", lossy: true },
  { label: "AVIF (.avif)", mime: "image/avif", extension: "avif", lossy: true },
  { label: "BMP (.bmp)", mime: "image/bmp", extension: "bmp" },
  { label: "GIF (.gif)", mime: "image/gif", extension: "gif" },
]

const QUALITY_FORMATS = new Set(FORMAT_OPTIONS.filter((option) => option.lossy).map((option) => option.mime))

const SUPPORTED_INPUT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/avif", "image/svg+xml", "image/heic", "image/heif"]

export function ImageFormatConverter() {
  const [fileName, setFileName] = useState("uploaded-image")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [targetFormat, setTargetFormat] = useState(FORMAT_OPTIONS[0].mime)
  const [quality, setQuality] = useState(90)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [convertedName, setConvertedName] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const selectedFormat = useMemo(() => FORMAT_OPTIONS.find((option) => option.mime === targetFormat) ?? FORMAT_OPTIONS[0], [targetFormat])
  const qualityVisible = QUALITY_FORMATS.has(selectedFormat.mime)

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl)
      }
    }
  }, [imageUrl, convertedUrl])

  const resetConvertedArtifacts = useCallback(() => {
    setConvertedUrl((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous)
      return null
    })
    setConvertedName(null)
    setCopied(false)
  }, [])

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPG, WEBP, etc.)")
      return
    }

    if (!SUPPORTED_INPUT_TYPES.includes(file.type)) {
      // We still accept it, but warn about potential conversion issues.
      setError("This format may not convert perfectly, but we'll still try.")
    } else {
      setError(null)
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ""))
    resetConvertedArtifacts()
    const nextUrl = URL.createObjectURL(file)
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return nextUrl
    })

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImageElement(img)
    }
    img.onerror = () => {
      setError("Unable to load the image. Try another file or format.")
    }
    img.src = nextUrl
  }, [resetConvertedArtifacts])

  const convertImage = useCallback(async () => {
    if (!imageElement) {
      setError("Upload an image before converting.")
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const canvas = document.createElement("canvas")
      canvas.width = imageElement.width
      canvas.height = imageElement.height
      const context = canvas.getContext("2d")
      if (!context) {
        throw new Error("Canvas not supported in this browser.")
      }

      context.drawImage(imageElement, 0, 0)

      const qualityValue = qualityVisible ? Math.min(Math.max(quality / 100, 0.05), 1) : undefined
      const dataUrl = canvas.toDataURL(selectedFormat.mime, qualityValue)
      if (!dataUrl?.startsWith("data:")) {
        throw new Error("Conversion failed. Try a different format.")
      }

      setConvertedUrl(dataUrl)
      setConvertedName(`${fileName || "converted"}.${selectedFormat.extension}`)
    } catch (conversionError) {
      console.error(conversionError)
      setError(conversionError instanceof Error ? conversionError.message : "Conversion failed.")
    } finally {
      setIsConverting(false)
    }
  }, [fileName, imageElement, quality, qualityVisible, selectedFormat])

  const downloadConverted = useCallback(() => {
    if (!convertedUrl || !convertedName) return
    const link = document.createElement("a")
    link.href = convertedUrl
    link.download = convertedName
    link.click()
  }, [convertedName, convertedUrl])

  const copyPreviewUrl = useCallback(async () => {
    if (!convertedUrl) return
    try {
      await navigator.clipboard.writeText(convertedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (copyError) {
      console.error(copyError)
      setError("Copy failed. Please download instead.")
    }
  }, [convertedUrl])

  const clearAll = useCallback(() => {
    setImageUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
    setImageElement(null)
    setFileName("uploaded-image")
    resetConvertedArtifacts()
    setError(null)
  }, [resetConvertedArtifacts])

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Image Converter" />

      <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/30">
        <PageContainer className="py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
            <SwatchBook className="size-4" />
            <span>Any format in, any format out</span>
          </div>
          <div className="mt-6 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">
              Convert PNG, JPG, WEBP, and more with one dropdown
            </h1>
            <p className="text-lg text-muted-foreground">
              Drop any image, pick the format you need, control quality for lossy files, and download a production-ready asset in seconds.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="py-16">
        <PageContainer>
          <Card className="border-border/70 bg-card/95 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-10 lg:flex-row">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Images className="size-4" />
                    Upload or drop an asset
                  </h2>
                  {imageUrl && (
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                      <X className="mr-1 size-4" />
                      Clear
                    </Button>
                  )}
                </div>

                {imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                    <img src={imageUrl} alt="Uploaded preview" className="h-auto w-full object-contain" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 p-4">
                    <DropZone onFileUpload={handleImageUpload} />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Output format
                    <select
                      className="rounded-xl border border-border bg-background/80 px-3 py-2 text-sm"
                      value={targetFormat}
                      onChange={(event) => setTargetFormat(event.target.value)}
                    >
                      {FORMAT_OPTIONS.map((option) => (
                        <option key={option.mime} value={option.mime}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium" aria-disabled={!qualityVisible}>
                    Quality ({qualityVisible ? `${quality}%` : "auto"})
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={quality}
                      onChange={(event) => setQuality(Number(event.target.value))}
                      disabled={!qualityVisible}
                      className="accent-primary"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  <p>Accepted inputs: PNG, JPG, WEBP, GIF, BMP, AVIF, SVG, HEIC.</p>
                  <p>Converted downloads are new files—you always keep the original. Browser rendering falls back to PNG if a format is unsupported.</p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Step 1</p>
                  <h3 className="text-xl font-semibold">Click convert</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We use the browser to render a pristine canvas, so your image stays local and private.
                  </p>
                  <Button className="mt-4 w-full" disabled={!imageUrl || isConverting} onClick={convertImage}>
                    {isConverting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                    {isConverting ? "Converting" : `Convert to ${selectedFormat.label}`}
                  </Button>
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Converted file</p>
                      <p className="text-xs text-muted-foreground">{convertedName ?? "No file yet"}</p>
                    </div>
                    <Button variant="outline" disabled={!convertedUrl} onClick={downloadConverted}>
                      <Download className="mr-2 size-4" />
                      Download
                    </Button>
                  </div>
                  <div className="rounded-xl border border-dashed border-border/60 bg-background/80 p-4 text-sm">
                    {convertedUrl ? (
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          Preview updates after each conversion. Copy the data URL or open it in a new tab.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="secondary" size="sm" onClick={() => window.open(convertedUrl, "_blank")}>View in tab</Button>
                          <Button variant="ghost" size="sm" onClick={copyPreviewUrl} className="text-muted-foreground">
                            {copied ? (
                              <>
                                <Check className="mr-1 size-4" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 size-4" />
                                Copy URL
                              </>
                            )}
                          </Button>
                        </div>
                        <img src={convertedUrl} alt="Converted preview" className="mt-3 w-full rounded-lg border border-border/60" />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Convert an image to unlock the preview and download tools.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </PageContainer>
      </section>
    </div>
  )
}
