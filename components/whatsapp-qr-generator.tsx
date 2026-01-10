"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"
import { Check, Copy, Download, MessageCircle, QrCode } from "lucide-react"

function buildWhatsAppUrl(phone: string, text: string) {
  // Strip non-digits; WhatsApp expects full international number without + or leading zeros
  const digits = phone.replace(/\D/g, "")
  const base = `https://wa.me/${digits}`
  if (text.trim().length) {
    const params = new URLSearchParams({ text })
    return `${base}?${params.toString()}`
  }
  return base
}

type WhatsAppQrGeneratorProps = { children?: ReactNode }

export function WhatsAppQrGenerator({ children }: WhatsAppQrGeneratorProps) {
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const url = useMemo(() => buildWhatsAppUrl(phone, message), [phone, message])

  const generate = useCallback(async () => {
    if (!/\d/.test(phone)) { setError("Enter a phone number with country code (e.g., +8801XXXXXXXXX)."); return }
    setError(null)
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 480, margin: 2 })
      setQr(dataUrl)
    } catch (e) {
      console.error(e)
      setError("Failed to generate QR. Try a shorter message or check the number format.")
    }
  }, [url, phone])

  const download = useCallback(() => {
    if (!qr) return
    const a = document.createElement("a")
    a.href = qr
    a.download = `whatsapp-${phone || "contact"}.png`
    a.click()
  }, [qr, phone])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }, [url])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="WhatsApp QR" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <MessageCircle className="size-4" />
              <span>Messaging</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Generate WhatsApp QR links</h1>
            <p className="text-lg text-muted-foreground">Create a QR code that opens a WhatsApp chat to a phone number with an optional pre‑filled message.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="rose" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Phone (international format)</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" placeholder="e.g., +8801XXXXXXXXX" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Message (optional)</span>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px] rounded-md border border-border bg-background p-3 text-sm" placeholder="Hi, I found you via QR. Can we chat?" />
                  </label>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={generate} className="gap-2"><QrCode className="size-4" />Generate QR</Button>
                  <Button variant="outline" onClick={copy} className="gap-2"><Copy className="size-4" />{copied ? "Copied" : "Copy link"}</Button>
                </div>
                <p className="text-xs text-white/70">Link: <a className="underline" href={url} target="_blank" rel="noopener noreferrer">{url}</a></p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2"><MessageCircle className="size-4" /> Preview</h2>
                  <Button size="sm" variant="outline" onClick={download} disabled={!qr}><Download className="size-4" />Download PNG</Button>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4 text-center min-h-[240px] flex items-center justify-center">
                  {qr ? (
                    <img src={qr} alt="WhatsApp QR code" className="mx-auto size-48 rounded bg-white p-2" />
                  ) : (
                    <p className="text-sm text-muted-foreground">Your WhatsApp QR will appear here after generation.</p>
                  )}
                </div>
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
