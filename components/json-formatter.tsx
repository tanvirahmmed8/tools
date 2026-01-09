"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Braces, Check, Copy, Download, FileText, RefreshCcw, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function tryParseJson(input: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const value = JSON.parse(input)
    return { ok: true, value }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" }
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type JsonFormatterProps = { children?: ReactNode }

export function JsonFormatter({ children }: JsonFormatterProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState<string>("2") // "0","2","4","\t"

  const isValid = useMemo(() => tryParseJson(input).ok, [input])

  const formatPretty = useCallback(() => {
    const result = tryParseJson(input)
    if (!result.ok) {
      setError(result.error)
      setOutput("")
      return
    }
    const indentValue = indent === "\t" ? "\t" : Number(indent)
    const text = JSON.stringify(result.value, null, indentValue as any)
    setError(null)
    setOutput(text)
  }, [input, indent])

  const minify = useCallback(() => {
    const result = tryParseJson(input)
    if (!result.ok) {
      setError(result.error)
      setOutput("")
      return
    }
    const text = JSON.stringify(result.value)
    setError(null)
    setOutput(text)
  }, [input])

  const copyOutput = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (e) {
      console.error(e)
    }
  }, [output])

  const clearAll = useCallback(() => {
    setInput("")
    setOutput("")
    setError(null)
  }, [])

  const loadSample = useCallback(() => {
    const sample = {
      name: "Sample",
      enabled: true,
      count: 3,
      tags: ["alpha", "beta"],
      nested: { id: 1, items: [{ x: 10 }, { x: 20 }] }
    }
    const text = JSON.stringify(sample, null, 2)
    setInput(text)
    setOutput("")
    setError(null)
  }, [])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Dev tools" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Braces className="size-4" />
              <span>JSON utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">JSON formatter & validator</h1>
            <p className="text-lg text-muted-foreground">
              Paste JSON to pretty-print, minify, validate, and copy. Choose indentation and export the result.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="emerald" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <FileText className="size-4" />
                    Input JSON
                  </h2>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground" htmlFor="indent">Indent</label>
                    <select
                      id="indent"
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      value={indent}
                      onChange={(e) => setIndent(e.target.value)}
                    >
                      <option value="0">0</option>
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>
                </div>

                <textarea
                  className="min-h-[260px] w-full rounded-lg border border-border bg-background/80 p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder='{"key":"value"}'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{input ? (isValid ? "Valid JSON" : "Awaiting valid JSON") : "Paste JSON to begin."}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={formatPretty} disabled={!input}>
                    <Wand2 className="size-4" />
                    Format
                  </Button>
                  <Button variant="secondary" onClick={minify} disabled={!input}>Minify</Button>
                  <Button variant="outline" onClick={loadSample}>Load sample</Button>
                  <Button variant="ghost" onClick={clearAll} disabled={!input}>
                    <RefreshCcw className="size-4" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <Braces className="size-4" />
                    Output
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadText("formatted.json", output)} disabled={!output}>
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button size="sm" onClick={copyOutput} disabled={!output}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  className="min-h-[260px] w-full rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm"
                  placeholder="Formatted JSON will appear here."
                  value={output}
                />
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
