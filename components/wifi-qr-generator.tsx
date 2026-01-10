"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import QRCode from "qrcode"
import { Check, Copy, Download, Lock, QrCode, Router, Wifi } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function buildWifiPayload({ ssid, password, auth, hidden }: { ssid: string; password: string; auth: "WPA" | "WEP" | "nopass"; hidden: boolean }) {
  const esc = (v: string) => v.replace(/([\\;,:"])/g, "\\$1")
  const parts = [
    `T:${auth}`,
    `S:${esc(ssid)}`,
  ]
  if (auth !== "nopass") parts.push(`P:${esc(password)}`)
  if (hidden) parts.push("H:true")
  return `WIFI:${parts.join(";")};`
}

type WifiQrGeneratorProps = { children?: ReactNode }

export function WifiQrGenerator({ children }: WifiQrGeneratorProps) {
  const [ssid, setSsid] = useState("")
  const [password, setPassword] = useState("")
  const [auth, setAuth] = useState<"WPA" | "WEP" | "nopass">("WPA")
  const [hidden, setHidden] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payload = useMemo(() => buildWifiPayload({ ssid, password, auth, hidden }), [ssid, password, auth, hidden])

  const generate = useCallback(async () => {
    if (!ssid.trim()) { setError("Enter a network name (SSID)."); return }
    if (auth !== "nopass" && password.length === 0) { setError("Enter a password or choose No password."); return }
    setError(null)
    try {
      const dataUrl = await QRCode.toDataURL(payload, { width: 480, margin: 2 })
      setQr(dataUrl)
    } catch (e) {
      console.error(e)
      setError("Failed to generate QR. Try different characters or a shorter password.")
    }
  }, [payload, ssid, password, auth])

  const download = useCallback(() => {
    if (!qr) return
    const a = document.createElement("a")
    a.href = qr
    a.download = `wifi-${ssid || "network"}.png`
    a.click()
  }, [qr, ssid])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }, [payload])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Wi‑Fi QR" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Wifi className="size-4" />
              <span>Network sharing</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Generate Wi‑Fi QR codes</h1>
            <p className="text-lg text-muted-foreground">Create scannable Wi‑Fi QR codes for WPA/WEP or open networks. Guests can join without typing credentials.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="violet" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Network name (SSID)</span>
                    <input value={ssid} onChange={(e) => setSsid(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" placeholder="MyWiFi" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-muted-foreground">Security</span>
                    <select value={auth} onChange={(e) => setAuth(e.target.value as any)} className="rounded-md border border-border bg-background px-3 py-2">
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No password</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm col-span-2">
                    <span className="text-muted-foreground">Password {auth === "nopass" ? "(disabled)" : ""}</span>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2" placeholder="••••••••" disabled={auth === "nopass"} />
                  </label>
                  <label className="flex items-center gap-2 text-sm col-span-2">
                    <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                    <span>Hidden SSID</span>
                  </label>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={generate} className="gap-2"><QrCode className="size-4" />Generate QR</Button>
                  <Button variant="outline" onClick={copy} className="gap-2"><Copy className="size-4" />{copied ? "Copied" : "Copy payload"}</Button>
                </div>
                <p className="text-xs text-white/70">Payload: <code className="rounded bg-white/10 px-1 py-0.5">{payload}</code></p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2"><Router className="size-4" /> Preview</h2>
                  <Button size="sm" variant="outline" onClick={download} disabled={!qr}><Download className="size-4" />Download PNG</Button>
                </div>
                <div className="rounded-lg border border-border bg-background/80 p-4 text-center min-h-[240px] flex items-center justify-center">
                  {qr ? (
                    <img src={qr} alt="Wi‑Fi QR code" className="mx-auto size-48 rounded bg-white p-2" />
                  ) : (
                    <p className="text-sm text-muted-foreground">Your Wi‑Fi QR will appear here after generation.</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2"><Lock className="size-3.5" /> Passwords are kept local to your browser; nothing is uploaded.</p>
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
