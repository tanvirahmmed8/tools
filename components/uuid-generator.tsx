"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Check, Copy, Download, Hash, RefreshCcw, Shield, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function generateUuidRaw(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID()
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    // Per RFC 4122 v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const toHex = (n: number) => n.toString(16).padStart(2, "0")
    const b = Array.from(bytes, toHex).join("")
    return `${b.slice(0,8)}-${b.slice(8,12)}-${b.slice(12,16)}-${b.slice(16,20)}-${b.slice(20)}`
  }
  // Last resort (non-crypto)
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1)
  return `${s4()}${s4()}-${s4()}-4${s4().slice(0,3)}-${((Math.random()*4)|0+8).toString(16)}${s4().slice(0,3)}-${s4()}${s4()}${s4()}`
}

function formatUuid(u: string, uppercase: boolean, noHyphens: boolean): string {
  let out = u
  if (noHyphens) out = out.replace(/-/g, "")
  if (uppercase) out = out.toUpperCase()
  return out
}

type UuidGeneratorProps = { children?: ReactNode }

export function UuidGenerator({ children }: UuidGeneratorProps) {
  const [count, setCount] = useState(10)
  const [uppercase, setUppercase] = useState(false)
  const [noHyphens, setNoHyphens] = useState(false)
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => uuids.join("\n"), [uuids])

  const generate = useCallback(() => {
    const n = Math.max(1, Math.min(1000, Number.isFinite(count) ? count : 1))
    const list: string[] = []
    for (let i = 0; i < n; i += 1) {
      const raw = generateUuidRaw()
      list.push(formatUuid(raw, uppercase, noHyphens))
    }
    setUuids(list)
  }, [count, uppercase, noHyphens])

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
    setUuids([])
  }, [])

  const downloadAll = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "uuids.txt"
    a.click()
    URL.revokeObjectURL(url)
  }, [output])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Dev tools" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Sparkles className="size-4" />
              <span>Identifier utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">UUID generator (v4)</h1>
            <p className="text-lg text-muted-foreground">
              Generate cryptographically secure UUIDv4 identifiers in batches. Toggle uppercase and hyphen removal.
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
                    <Hash className="size-4" />
                    Settings
                  </h2>
                  <Button variant="ghost" size="sm" onClick={clearAll} disabled={!uuids.length} className="text-muted-foreground hover:text-foreground">
                    <RefreshCcw className="size-4" />
                    Clear
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Count</span>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="rounded-md border border-border bg-background px-3 py-2"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
                    <span>Uppercase</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="size-4" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} />
                    <span>Remove hyphens</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={generate}>Generate</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <Shield className="size-4" />
                    Output
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={downloadAll} disabled={!uuids.length}>
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button size="sm" onClick={onCopy} disabled={!uuids.length}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  className="min-h-[260px] w-full rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm"
                  placeholder="Generated UUIDs will appear here."
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
