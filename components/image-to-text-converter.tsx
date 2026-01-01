"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Copy, Check, Sparkles, FileText, Zap, Shield, Loader2, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { DropZone } from "@/components/drop-zone"
import { SiteNavigation } from "@/components/site-navigation"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { extractTextFromImage } from "@/app/actions"

type ImageToTextConverterProps = {
  children?: React.ReactNode
}

export function ImageToTextConverter({ children }: ImageToTextConverterProps) {
  const [image, setImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setImage(base64)
      setIsProcessing(true)
      setExtractedText("")

      try {
        const text = await extractTextFromImage(base64)
        setExtractedText(text)
      } catch (err) {
        setError("Failed to extract text. Please try again.")
        console.error(err)
      } finally {
        setIsProcessing(false)
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!extractedText) return

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(extractedText)
      } else if (typeof window !== "undefined") {
        // Fallback for browsers where navigator.clipboard is unavailable
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

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text", err)
      setError("Copy failed. Please copy the text manually.")
    }
  }, [extractedText])

  const handleClear = useCallback(() => {
    setImage(null)
    setExtractedText("")
    setError(null)
  }, [])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="TextExtract" />

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm mb-6">
            <Sparkles className="size-3.5" />
            <span>Powered by AI Vision</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-balance">
            Extract text from any image
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Upload an image and instantly extract all text with our AI-powered OCR. Fast, accurate, and completely free.
          </p>
          </div>

          {/* Main Converter Card */}
          <GlowCard tone="magenta" className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Upload Image
                </h2>
                {image && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {!image ? (
                <DropZone onFileUpload={handleImageUpload} />
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt="Uploaded image"
                    className="w-full h-full object-contain"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Extracting text...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium flex items-center gap-2">
                  <FileText className="size-4" />
                  Extracted Text
                </h2>
                {extractedText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground"
                  >
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
                {error ? (
                  <p className="text-destructive text-sm">{error}</p>
                ) : extractedText ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{extractedText}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="size-10 mb-2 opacity-50" />
                    <p className="text-sm">Extracted text will appear here</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50">
        <PageContainer className="py-16">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<Zap className="size-5" />}
              title="Lightning Fast"
              description="Extract text in seconds with our optimized AI processing pipeline."
            />
            <FeatureCard
              icon={<Sparkles className="size-5" />}
              title="AI Powered"
              description="Advanced vision AI handles handwriting, receipts, documents, and more."
            />
            <FeatureCard
              icon={<Shield className="size-5" />}
              title="Secure & Private"
              description="Your images are processed securely and never stored on our servers."
            />
          </div>
        </PageContainer>
      </section>
      {children}
      <SiteFooter />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center size-12 rounded-xl bg-secondary text-foreground">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
