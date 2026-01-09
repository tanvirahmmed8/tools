"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy, FileText, RefreshCcw, Hash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function utf8BytesLength(str: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str).length
  }
  // Fallback if TextEncoder is not available
  const blob = new Blob([str])
  return blob.size
}

function countCharsNoSpaces(text: string): number {
  return text.replace(/\s/g, "").length
}

function countLines(text: string): number {
  if (!text) return 0
  return text.split(/\r\n|\r|\n/).length
}

export function CharacterCounter() {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => {
    const charsWithSpaces = text.length
    const charsNoSpaces = countCharsNoSpaces(text)
    const lines = countLines(text)
    const bytes = utf8BytesLength(text)
    return { charsWithSpaces, charsNoSpaces, lines, bytes }
  }, [text])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (e) {
      console.error(e)
    }
  }, [text])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Dev tools" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Hash className="size-4" />
              <span>Text utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Character counter</h1>
            <p className="text-lg text-muted-foreground">
              Quickly count characters with and without spaces, total lines, and UTF-8 bytes.
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
                  <h2 className="font-medium flex items-center gap-2">
                    <FileText className="size-4" />
                    Your text
                  </h2>
                  {text && (
                    <Button variant="ghost" size="sm" onClick={() => setText("")}
                            className="text-muted-foreground hover:text-foreground">
                      <RefreshCcw className="size-4" />
                      Clear
                    </Button>
                  )}
                </div>
                <textarea
                  className="min-h[260px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Paste or type here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button onClick={handleCopy} disabled={!text}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied" : "Copy text"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-medium">Counts</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Characters (with spaces)" value={stats.charsWithSpaces.toLocaleString()} />
                  <Stat label="Characters (no spaces)" value={stats.charsNoSpaces.toLocaleString()} />
                  <Stat label="Lines" value={stats.lines.toLocaleString()} />
                  <Stat label="Bytes (UTF-8)" value={stats.bytes.toLocaleString()} />
                </div>
                <p className="text-xs text-muted-foreground">Bytes are calculated using UTF-8 encoding.</p>
              </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      <SiteFooter />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}
