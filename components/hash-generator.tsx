"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy, Download, Fingerprint, Hash, RefreshCcw, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

type Algo = "md5" | "sha256"
type OutFmt = "hex" | "base64"

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, "")
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = parseInt(clean.substr(i, 2), 16)
  }
  return out
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

// MD5 implementation (RFC 1321) for UTF-8 strings -> hex digest
function md5Hex(input: string): string {
  function utf8Encode(str: string): string {
    return new TextEncoder().encode(str).reduce((acc, b) => acc + String.fromCharCode(b), "")
  }

  function rotateLeft(lValue: number, iShiftBits: number) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)) }
  function addUnsigned(lX: number, lY: number) {
    const lX4 = lX & 0x40000000
    const lY4 = lY & 0x40000000
    const lX8 = lX & 0x80000000
    const lY8 = lY & 0x80000000
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff)
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8
      return lResult ^ 0x40000000 ^ lX8 ^ lY8
    }
    return lResult ^ lX8 ^ lY8
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z) }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z) }
  function H(x: number, y: number, z: number) { return x ^ y ^ z }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z) }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) { a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b) }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) { a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b) }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) { a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b) }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) { a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b) }

  function convertToWordArray(str: string) {
    const lMessageLength = str.length
    const lNumberOfWordsTempOne = lMessageLength + 8
    const lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64
    const lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16
    const wordArray = new Array<number>(lNumberOfWords).fill(0)
    let byteCount = 0
    for (let i = 0; i < lMessageLength; i += 1) {
      const wordCount = (byteCount - (byteCount % 4)) / 4
      const bytePosition = (byteCount % 4) * 8
      wordArray[wordCount] = wordArray[wordCount] | (str.charCodeAt(i) << bytePosition)
      byteCount += 1
    }
    const wordCount = (byteCount - (byteCount % 4)) / 4
    const bytePosition = (byteCount % 4) * 8
    wordArray[wordCount] = wordArray[wordCount] | (0x80 << bytePosition)
    wordArray[lNumberOfWords - 2] = lMessageLength << 3
    wordArray[lNumberOfWords - 1] = lMessageLength >>> 29
    return wordArray
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = ""
    for (let lCount = 0; lCount <= 3; lCount += 1) {
      const lByte = (lValue >>> (lCount * 8)) & 255
      const wordToHexValueTemp = "0" + lByte.toString(16)
      wordToHexValue += wordToHexValueTemp.substring(wordToHexValueTemp.length - 2, wordToHexValueTemp.length)
    }
    return wordToHexValue
  }

  const x = convertToWordArray(utf8Encode(input))
  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  for (let k = 0; k < x.length; k += 16) {
    const AA = a; const BB = b; const CC = c; const DD = d
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478)
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756)
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db)
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee)
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf)
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a)
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613)
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501)
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8)
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af)
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1)
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be)
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122)
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193)
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e)
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821)

    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562)
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340)
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51)
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa)
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d)
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453)
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681)
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8)
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6)
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6)
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87)
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed)
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905)
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8)
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9)
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a)

    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942)
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681)
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122)
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c)
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44)
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9)
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60)
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70)
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6)
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa)
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085)
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05)
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039)
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5)
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8)
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665)

    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244)
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97)
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7)
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039)
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3)
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92)
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d)
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1)
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f)
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0)
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314)
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1)
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82)
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235)
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb)
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391)

    a = addUnsigned(a, AA)
    b = addUnsigned(b, BB)
    c = addUnsigned(c, CC)
    d = addUnsigned(d, DD)
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return bytesToHex(new Uint8Array(digest))
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

export function HashGenerator() {
  const [input, setInput] = useState("")
  const [algo, setAlgo] = useState<Algo>("sha256")
  const [fmt, setFmt] = useState<OutFmt>("hex")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => (algo === "md5" ? "MD5" : "SHA-256"), [algo])

  const generate = useCallback(async () => {
    setError(null)
    try {
      if (algo === "md5") {
        const hex = md5Hex(input)
        if (fmt === "hex") setOutput(hex)
        else setOutput(bytesToBase64(hexToBytes(hex)))
      } else {
        const hex = await sha256Hex(input)
        if (fmt === "hex") setOutput(hex)
        else setOutput(bytesToBase64(hexToBytes(hex)))
      }
    } catch (e) {
      console.error(e)
      setError("Hashing failed. Please try again.")
      setOutput("")
    }
  }, [input, algo, fmt])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (e) { console.error(e) }
  }, [output])

  const clearAll = useCallback(() => { setInput(""); setOutput(""); setError(null) }, [])
  const loadSample = useCallback(() => {
    setInput("The quick brown fox jumps over the lazy dog")
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
              <Fingerprint className="size-4" />
              <span>Hash utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Hash generator</h1>
            <p className="text-lg text-muted-foreground">
              Generate {title} hashes for any text. Output as hex or Base64.
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
                    <Hash className="size-4" />
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
                  <label className="text-xs text-muted-foreground" htmlFor="algo">Algorithm</label>
                  <select
                    id="algo"
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    value={algo}
                    onChange={(e) => setAlgo(e.target.value as Algo)}
                  >
                    <option value="sha256">SHA-256</option>
                    <option value="md5">MD5</option>
                  </select>

                  <label className="text-xs text-muted-foreground" htmlFor="fmt">Output</label>
                  <select
                    id="fmt"
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    value={fmt}
                    onChange={(e) => setFmt(e.target.value as OutFmt)}
                  >
                    <option value="hex">Hex</option>
                    <option value="base64">Base64</option>
                  </select>
                </div>

                <textarea
                  className="min-h-[220px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter text to hash."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Uses crypto.subtle for SHA-256; MD5 via in-browser implementation.</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={generate} disabled={!input}>Generate hash</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <Shield className="size-4" />
                    Output
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => download("hash.txt", output)} disabled={!output}>
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
