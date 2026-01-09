"use client"

import { useCallback, useState } from "react"
import { Check, Copy, Download, FileText, RefreshCcw, Shield, Sigma } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function stripDataUrlPrefix(value: string): string {
  const match = value.match(/^data:.*;base64,(.*)$/i)
  return match ? match[1] : value
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const sub = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...Array.from(sub))
  }
  return btoa(binary)
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function encodeTextToBase64(text: string): string {
  const enc = new TextEncoder()
  const bytes = enc.encode(text)
  return bytesToBase64(bytes)
}

function decodeBase64ToText(b64: string): string {
  const clean = stripDataUrlPrefix(b64.trim().replace(/\s+/g, ""))
  const bytes = base64ToBytes(clean)
  const dec = new TextDecoder()
  return dec.decode(bytes)
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

export function Base64Tool() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doEncode = useCallback(() => {
    try {
      const result = encodeTextToBase64(input)
      setOutput(result)
      setError(null)
    } catch (e) {
      console.error(e)
      setError("Failed to encode. Ensure input is valid text.")
      setOutput("")
    }
  }, [input])

  const doDecode = useCallback(() => {
    try {
      const result = decodeBase64ToText(input)
      setOutput(result)
      setError(null)
    } catch (e) {
      console.error(e)
      setError("Failed to decode Base64. Check that the input is valid Base64.")
      setOutput("")
    }
  }, [input])

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
    setInput("Hello, Base64!")
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
              <Sigma className="size-4" />
              <span>Encoding utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Base64 encode/decode</h1>
            <p className="text-lg text-muted-foreground">
              Encode any text to Base64 or decode Base64 back to text. Works with UTF-8 and data URLs.
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="azure" className="p-6 md:p-8">
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
                <textarea
                  className="min-h-[260px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter text to encode, or Base64 to decode. Data URLs like data:...;base64,ABC... are supported."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Tip: Decoding strips data URL prefixes and whitespace automatically.</p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={doEncode} disabled={!input}>Encode to Base64</Button>
                  <Button variant="secondary" onClick={doDecode} disabled={!input}>Decode from Base64</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <Shield className="size-4" />
                    Output
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => download("base64-output.txt", output)} disabled={!output}>
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
                  className="min-h-[260px] w-full rounded-lg border border-border bg-muted/40 p-3 text-sm font-mono"
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
