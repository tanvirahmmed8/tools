"use client"

import { useCallback, useState } from "react"
import { Check, Copy, Download, FileText, Link2, RefreshCcw, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

type Mode = "component" | "url"

function encodeValue(input: string, mode: Mode, plusForSpace: boolean): string {
  const encoded = mode === "url" ? encodeURI(input) : encodeURIComponent(input)
  return plusForSpace ? encoded.replace(/%20/g, "+") : encoded
}

function decodeValue(input: string, mode: Mode, plusForSpace: boolean): string {
  const normalized = plusForSpace ? input.replace(/\+/g, " ") : input
  return mode === "url" ? decodeURI(normalized) : decodeURIComponent(normalized)
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function UrlEncodeDecode() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>("component")
  const [plusForSpace, setPlusForSpace] = useState(false)

  const doEncode = useCallback(() => {
    try {
      const result = encodeValue(input, mode, plusForSpace)
      setOutput(result)
      setError(null)
    } catch (e) {
      console.error(e)
      setError("Encoding failed. Please check your input.")
      setOutput("")
    }
  }, [input, mode, plusForSpace])

  const doDecode = useCallback(() => {
    try {
      const result = decodeValue(input, mode, plusForSpace)
      setOutput(result)
      setError(null)
    } catch (e) {
      console.error(e)
      setError("Decoding failed. Ensure the input is properly URL-encoded.")
      setOutput("")
    }
  }, [input, mode, plusForSpace])

  const onCopy = useCallback(async () => {
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
    setInput("https://example.com/search?q=hello world&lang=en")
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
              <Link2 className="size-4" />
              <span>URL utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">URL encode/decode</h1>
            <p className="text-lg text-muted-foreground">
              Encode or decode URLs and components. Choose encoding mode and space handling.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="rose" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <FileText className="size-4" />
                    Input
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadSample}>Sample</Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} disabled={!input}>
                      <RefreshCcw className="size-4" />
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs text-muted-foreground" htmlFor="mode">Mode</label>
                  <select
                    id="mode"
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as Mode)}
                  >
                    <option value="component">Component (encodeURIComponent)</option>
                    <option value="url">Full URL (encodeURI)</option>
                  </select>
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input id="plus" type="checkbox" className="size-3" checked={plusForSpace} onChange={(e) => setPlusForSpace(e.target.checked)} />
                    <label htmlFor="plus">Use + for spaces</label>
                  </span>
                </div>

                <textarea
                  className="min-h-[220px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter raw text or URL to encode, or encoded text to decode."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Component mode encodes all reserved characters; URL mode leaves URL-safe characters intact.</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={doEncode} disabled={!input}>Encode</Button>
                  <Button variant="secondary" onClick={doDecode} disabled={!input}>Decode</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <Settings2 className="size-4" />
                    Output
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => download("url-output.txt", output)} disabled={!output}>
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button size="sm" onClick={onCopy} disabled={!output}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  className="min-h-[220px] w-full rounded-lg border border-border bg-muted/40 p-3 text-sm font-mono"
                  placeholder="Result will appear here."
                  value={output}
                />
              </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      <SiteFooter />
    </div>
  )
}
