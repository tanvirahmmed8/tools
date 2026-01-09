"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Check, Copy, FileText, RefreshCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function countWords(text: string): number {
  const tokens = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  // Count tokens that contain at least one letter or number (handles unicode)
  const wordLike = tokens.filter((t) => /[\p{L}\p{N}]/u.test(t))
  return wordLike.length
}

function countSentences(text: string): number {
  const parts = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  return parts.length
}

function countParagraphs(text: string): number {
  // Paragraphs separated by one or more blank lines
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return blocks.length > 0 ? blocks.length : (text.trim().length > 0 ? 1 : 0)
}

function readingTime(words: number): { label: string } {
  const wpm = 200
  const minutesFloat = words / wpm
  const mins = Math.floor(minutesFloat)
  const secs = Math.round((minutesFloat - mins) * 60)
  if (mins <= 0 && secs <= 15) return { label: "less than 15 sec" }
  if (mins <= 0 && secs <= 30) return { label: "~30 sec" }
  if (mins <= 0) return { label: "~1 min" }
  if (secs === 0) return { label: `${mins} min` }
  return { label: `${mins} min ${secs} sec` }
}

type WordCounterProps = { children?: ReactNode }

export function WordCounter({ children }: WordCounterProps) {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)

  const stats = useMemo(() => {
    const words = countWords(text)
    const sentences = countSentences(text)
    const paragraphs = countParagraphs(text)
    const charsWithSpaces = text.length
    const charsNoSpaces = text.replace(/\s/g, "").length
    const rt = readingTime(words)
    return { words, sentences, paragraphs, charsWithSpaces, charsNoSpaces, reading: rt.label }
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
              <Sparkles className="size-4" />
              <span>Text utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Word counter and reading time estimator</h1>
            <p className="text-lg text-muted-foreground">
              Paste or type your content to instantly see words, characters, sentences, paragraphs, and estimated reading time.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="violet" className="p-6 md:p-8">
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
                  className="min-h-[260px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <Stat label="Words" value={stats.words.toLocaleString()} />
                  <Stat label="Characters (with spaces)" value={stats.charsWithSpaces.toLocaleString()} />
                  <Stat label="Characters (no spaces)" value={stats.charsNoSpaces.toLocaleString()} />
                  <Stat label="Sentences" value={stats.sentences.toLocaleString()} />
                  <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
                  <Stat label="Reading time" value={stats.reading} />
                </div>
                <p className="text-xs text-muted-foreground">Reading time assumes ~200 words per minute.</p>
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  )
}
