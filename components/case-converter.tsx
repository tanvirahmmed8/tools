"use client"

import { useCallback, useState } from "react"
import { CaseSensitive, Check, Copy, FileText, RefreshCcw, Type } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function toUpper(text: string) { return text.toUpperCase() }
function toLower(text: string) { return text.toLowerCase() }
function toTitle(text: string) {
  return text.replace(/\p{L}[\p{L}\p{N}'\u2019]*/gu, (word) => {
    const [first, ...rest] = word
    return (first ?? "").toUpperCase() + rest.join("").toLowerCase()
  })
}

export function CaseConverter() {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)

  const apply = useCallback((mode: "upper" | "lower" | "title") => {
    setText((prev) => {
      if (!prev) return prev
      if (mode === "upper") return toUpper(prev)
      if (mode === "lower") return toLower(prev)
      return toTitle(prev)
    })
  }, [])

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
              <CaseSensitive className="size-4" />
              <span>Text utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Case converter</h1>
            <p className="text-lg text-muted-foreground">
              Convert any text to UPPERCASE, lowercase, or Title Case.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="slate" className="p-6 md:p-8">
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
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => apply("upper")} disabled={!text}>UPPERCASE</Button>
                  <Button variant="secondary" onClick={() => apply("lower")} disabled={!text}>lowercase</Button>
                  <Button variant="secondary" onClick={() => apply("title")} disabled={!text}>Title Case</Button>
                  <Button onClick={handleCopy} disabled={!text}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied" : "Copy text"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-medium flex items-center gap-2">
                  <Type className="size-4" />
                  Tips
                </h2>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Title Case capitalizes the first letter of each word and lowercases the rest.</li>
                  <li>Use lowercase for filenames and slugs; uppercase for emphasis or headings.</li>
                  <li>Copy updates your clipboard with the converted result.</li>
                </ul>
              </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      <SiteFooter />
    </div>
  )
}
