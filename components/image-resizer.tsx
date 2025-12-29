"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropZone } from "@/components/drop-zone"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { Download, ImageIcon, Loader2, RefreshCcw, Ruler, Sparkles } from "lucide-react"

const MIN_DIMENSION = 32
const MAX_DIMENSION = 4096
const MIN_RADIUS = 0
const MAX_RADIUS = 50
const MIN_CROP = 0.08
const CHECKER_BACKGROUND = {
  backgroundImage:
    "linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
  backgroundColor: "#030712",
}


type QuickSize = { label: string; width: number; height: number; radiusPercent?: number }

const QUICK_SIZES: QuickSize[] = [
  { label: "Square · 1080", width: 1080, height: 1080, radiusPercent: 0 },
  { label: "Circle · 1080", width: 1080, height: 1080, radiusPercent: 50 },
  { label: "Story · 1080×1920", width: 1080, height: 1920, radiusPercent: 0 },
  { label: "Slide · 1920×1080", width: 1920, height: 1080, radiusPercent: 0 },
  { label: "Thumb · 1280×720", width: 1280, height: 720, radiusPercent: 0 },
]

type Crop = { x: number; y: number; width: number; height: number }
type DragMode = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

interface InteractionState {
  active: boolean
  mode?: DragMode
  startX?: number
  startY?: number
  bounds?: DOMRect
  startCrop?: Crop
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function ImageResizer() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null)
  const [fileName, setFileName] = useState("resized-image")
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [outputSize, setOutputSize] = useState({ width: 1080, height: 1080 })
  const [lockAspect, setLockAspect] = useState(true)
  const [radiusPercent, setRadiusPercent] = useState(0)
  const [crop, setCrop] = useState<Crop>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewRef = useRef<HTMLDivElement | null>(null)
  const interactionRef = useRef<InteractionState>({ active: false })

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  const aspectRatio = useMemo(() => {
    if (!naturalSize) return 1
    return naturalSize.width / naturalSize.height
  }, [naturalSize])

  const clampDimension = useCallback((value: number) => {
    if (Number.isNaN(value) || value <= 0) return MIN_DIMENSION
    return clamp(Math.round(value), MIN_DIMENSION, MAX_DIMENSION)
  }, [])

  const updateCropFromDelta = useCallback((deltaX: number, deltaY: number) => {
    const interaction = interactionRef.current
    if (!interaction.active || !interaction.startCrop) return

    const start = interaction.startCrop
    let next: Crop = { ...start }
    const minWidth = MIN_CROP
    const minHeight = MIN_CROP

    const applyEast = () => {
      const maxWidth = 1 - start.x
      next.width = clamp(start.width + deltaX, minWidth, maxWidth)
    }
    const applySouth = () => {
      const maxHeight = 1 - start.y
      next.height = clamp(start.height + deltaY, minHeight, maxHeight)
    }
    const applyWest = () => {
      const maxLeft = start.x + start.width - minWidth
      const newX = clamp(start.x + deltaX, 0, maxLeft)
      next.width = start.x + start.width - newX
      next.x = newX
    }
    const applyNorth = () => {
      const maxTop = start.y + start.height - minHeight
      const newY = clamp(start.y + deltaY, 0, maxTop)
      next.height = start.y + start.height - newY
      next.y = newY
    }

    switch (interaction.mode) {
      case "move":
        next.x = clamp(start.x + deltaX, 0, 1 - start.width)
        next.y = clamp(start.y + deltaY, 0, 1 - start.height)
        break
      case "e":
        applyEast()
        break
      case "s":
        applySouth()
        break
      case "w":
        applyWest()
        break
      case "n":
        applyNorth()
        break
      case "ne":
        applyEast()
        applyNorth()
        break
      case "nw":
        applyWest()
        applyNorth()
        break
      case "se":
        applyEast()
        applySouth()
        break
      case "sw":
        applyWest()
        applySouth()
        break
      default:
        break
    }

    next.width = clamp(next.width, minWidth, 1)
    next.height = clamp(next.height, minHeight, 1)
    next.x = clamp(next.x, 0, 1 - next.width)
    next.y = clamp(next.y, 0, 1 - next.height)
    setCrop(next)
  }, [])

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const interaction = interactionRef.current
    if (!interaction.active || !interaction.bounds) return
    event.preventDefault()
    const deltaX = (event.clientX - (interaction.startX ?? 0)) / interaction.bounds.width
    const deltaY = (event.clientY - (interaction.startY ?? 0)) / interaction.bounds.height
    updateCropFromDelta(deltaX, deltaY)
  }, [updateCropFromDelta])

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!interactionRef.current.active) return
      event.preventDefault()
      interactionRef.current = { active: false }
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    },
    [handlePointerMove],
  )

  const startInteraction = useCallback(
    (mode: DragMode, event: React.PointerEvent) => {
      if (!previewRef.current || !imageUrl) return
      event.preventDefault()
      const bounds = previewRef.current.getBoundingClientRect()
      interactionRef.current = {
        active: true,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        bounds,
        startCrop: crop,
      }
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    },
    [crop, handlePointerMove, handlePointerUp, imageUrl],
  )

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.")
      return
    }

    setError(null)
    setFileName(file.name.replace(/\.[^/.]+$/, "") || "resized-image")
    const nextUrl = URL.createObjectURL(file)
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return nextUrl
    })

    const image = new Image()
    image.onload = () => {
      setImageElement(image)
      setNaturalSize({ width: image.width, height: image.height })
      setOutputSize({
        width: clampDimension(image.width),
        height: clampDimension(image.height),
      })
      setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })
      setRadiusPercent(0)
      setOutputUrl(null)
    }
    image.onerror = () => {
      setError("Unable to load the image. Try another file.")
    }
    image.src = nextUrl
  }, [clampDimension])

  const drawImage = useCallback(
    (image: HTMLImageElement, finalWidth: number, finalHeight: number, radiusPercentValue: number, cropBox: Crop) => {
      if (!naturalSize) {
        setIsProcessing(false)
        return
      }
      const canvas = document.createElement("canvas")
      canvas.width = finalWidth
      canvas.height = finalHeight
      const context = canvas.getContext("2d")
      if (!context) {
        setError("Canvas rendering is not supported in this browser.")
        setIsProcessing(false)
        return
      }

      const maxRadius = Math.min(finalWidth, finalHeight) / 2
      const finalRadius = clamp((radiusPercentValue / 50) * maxRadius, 0, maxRadius)

      context.clearRect(0, 0, finalWidth, finalHeight)
      if (finalRadius > 0) {
        context.beginPath()
        context.moveTo(finalRadius, 0)
        context.lineTo(finalWidth - finalRadius, 0)
        context.quadraticCurveTo(finalWidth, 0, finalWidth, finalRadius)
        context.lineTo(finalWidth, finalHeight - finalRadius)
        context.quadraticCurveTo(finalWidth, finalHeight, finalWidth - finalRadius, finalHeight)
        context.lineTo(finalRadius, finalHeight)
        context.quadraticCurveTo(0, finalHeight, 0, finalHeight - finalRadius)
        context.lineTo(0, finalRadius)
        context.quadraticCurveTo(0, 0, finalRadius, 0)
        context.closePath()
        context.clip()
      }

      const naturalCrop = {
        x: cropBox.x * naturalSize.width,
        y: cropBox.y * naturalSize.height,
        width: cropBox.width * naturalSize.width,
        height: cropBox.height * naturalSize.height,
      }

      context.drawImage(
        image,
        naturalCrop.x,
        naturalCrop.y,
        naturalCrop.width,
        naturalCrop.height,
        0,
        0,
        finalWidth,
        finalHeight,
      )

      setOutputUrl(canvas.toDataURL("image/png"))
      setIsProcessing(false)
    },
    [naturalSize],
  )

  const refreshOutput = useCallback(() => {
    if (!imageElement || !naturalSize) return
    setIsProcessing(true)
    requestAnimationFrame(() => {
      drawImage(imageElement, outputSize.width, outputSize.height, radiusPercent, crop)
    })
  }, [crop, drawImage, imageElement, naturalSize, outputSize.height, outputSize.width, radiusPercent])

  useEffect(() => {
    if (!imageElement || !naturalSize) return
    refreshOutput()
  }, [imageElement, naturalSize, refreshOutput])

  const handleSizeChange = useCallback(
    (dimension: "width" | "height", value: string) => {
      const numeric = clampDimension(Number(value))
      setOutputSize((prev) => {
        if (dimension === "width") {
          const ratio = prev.width / prev.height || 1
          return {
            width: numeric,
            height: lockAspect ? clampDimension(Math.round(numeric / ratio)) : prev.height,
          }
        }
        const ratio = prev.height ? prev.width / prev.height : 1
        return {
          width: lockAspect ? clampDimension(Math.round(numeric * ratio)) : prev.width,
          height: numeric,
        }
      })
    },
    [clampDimension, lockAspect],
  )

  const applyPreset = useCallback(
    (width: number, height: number, radiusPercentValue?: number) => {
      setOutputSize({
        width: clampDimension(width),
        height: clampDimension(height),
      })
      if (typeof radiusPercentValue === "number") {
        setRadiusPercent(radiusPercentValue)
      }
    },
    [clampDimension],
  )

  const downloadImage = useCallback(() => {
    if (!outputUrl) return
    const link = document.createElement("a")
    link.href = outputUrl
    link.download = `${fileName}.png`
    link.click()
  }, [fileName, outputUrl])

  const resetAll = useCallback(() => {
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setImageElement(null)
    setOutputUrl(null)
    setFileName("resized-image")
    setNaturalSize(null)
    setOutputSize({ width: 1080, height: 1080 })
    setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })
    setRadiusPercent(0)
    setError(null)
  }, [])

  const selectionStyle = {
    left: `${crop.x * 100}%`,
    top: `${crop.y * 100}%`,
    width: `${crop.width * 100}%`,
    height: `${crop.height * 100}%`,
  }

  const handleDescriptors = [
    { key: "n", className: "top-0 left-1/2 -translate-x-1/2 cursor-n-resize" },
    { key: "s", className: "bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize" },
    { key: "e", className: "right-0 top-1/2 -translate-y-1/2 cursor-e-resize" },
    { key: "w", className: "left-0 top-1/2 -translate-y-1/2 cursor-w-resize" },
    { key: "ne", className: "right-0 top-0 cursor-ne-resize" },
    { key: "nw", className: "left-0 top-0 cursor-nw-resize" },
    { key: "se", className: "right-0 bottom-0 cursor-se-resize" },
    { key: "sw", className: "left-0 bottom-0 cursor-sw-resize" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation title="Image Resizer" />

      <PageContainer className="flex justify-center py-10">
        <Card className="w-full max-w-6xl border-border bg-card/95 p-6 shadow-xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  <Sparkles className="size-3.5" />
                  Instant resizer workspace
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">Advanced image resizer without the lag</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Drop an asset, drag the live cropper to the exact focus point, fine-tune width, height, and corner radius, then export a
                  production-ready PNG from the same panel.
                </p>
              </div>
              {imageUrl && (
                <Button variant="outline" onClick={resetAll} className="shrink-0">
                  <RefreshCcw className="size-4" />
                  Start over
                </Button>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  {imageUrl ? (
                    <div
                      ref={previewRef}
                      className="relative mx-auto w-full max-w-full overflow-hidden rounded-xl bg-black/40"
                      style={{
                        aspectRatio: naturalSize ? `${naturalSize.width}/${naturalSize.height}` : "4 / 3",
                      }}
                    >
                      <img src={imageUrl} alt="Uploaded asset" className="h-full w-full select-none object-cover" draggable={false} />

                      <div
                        aria-hidden
                        className="pointer-events-none absolute border border-transparent"
                        style={{
                          ...selectionStyle,
                          boxShadow: "0 0 0 9999px rgba(2,6,23,0.55)",
                        }}
                      />

                      <div
                        className="absolute border-2 border-primary bg-white/5 shadow-xl backdrop-blur-sm"
                        style={selectionStyle}
                        onPointerDown={(event) => startInteraction("move", event)}
                        role="presentation"
                      >
                        <div className="pointer-events-none absolute inset-0 border border-white/60" />
                        {handleDescriptors.map((handle) => (
                          <span
                            key={handle.key}
                            role="presentation"
                            onPointerDown={(event) => {
                              event.stopPropagation()
                              startInteraction(handle.key as DragMode, event)
                            }}
                            className={`absolute size-3 rounded-full border-2 border-card bg-primary ${handle.className}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/70 bg-background/60 p-4">
                      <DropZone onFileUpload={handleImageUpload} />
                    </div>
                  )}
                  {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                </div>

                {imageUrl && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Tips:</p>
                    <span>Drag inside the crop box to move.</span>
                    <span>Use the handles to resize.</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-sm font-medium">
                    Width (px)
                    <input
                      type="number"
                      value={outputSize.width}
                      min={MIN_DIMENSION}
                      max={MAX_DIMENSION}
                      onChange={(event) => handleSizeChange("width", event.target.value)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium">
                    Height (px)
                    <input
                      type="number"
                      value={outputSize.height}
                      min={MIN_DIMENSION}
                      max={MAX_DIMENSION}
                      onChange={(event) => handleSizeChange("height", event.target.value)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(event) => setLockAspect(event.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Lock aspect ratio
                </label>

                <div className="flex flex-wrap gap-2">
                  {QUICK_SIZES.map((size) => (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() => applyPreset(size.width, size.height, size.radiusPercent)}
                      className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground"
                    >
                      {size.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Corner radius</span>
                    <span className="text-muted-foreground">{radiusPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_RADIUS}
                    max={MAX_RADIUS}
                    value={radiusPercent}
                    onChange={(event) => setRadiusPercent(Number(event.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">Transparent corners show the background underneath when previewed.</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Output preview</p>
                      <p className="text-xs text-muted-foreground">{outputSize.width} × {outputSize.height}px</p>
                    </div>
                    <Button size="sm" onClick={downloadImage} disabled={!outputUrl || isProcessing}>
                      {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                      {isProcessing ? "Rendering" : "Download"}
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-center">
                    <div
                      className="w-full max-w-xs border border-dashed border-border/60 p-4"
                      style={CHECKER_BACKGROUND}
                    >
                      {outputUrl ? (
                        <div
                          className="aspect-square w-full overflow-hidden border border-border/50 bg-background/40"
                          style={{ borderRadius: `${Math.min(radiusPercent / 50, 1) * 100}%` }}
                        >
                          <img
                            src={outputUrl}
                            alt="Output preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Upload an image to see the live output.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}

