import type { Metadata } from "next"

import { WifiQrGenerator } from "@/components/wifi-qr-generator"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import wifiQrSeo from "@/seo/wifi-qr-generator.json"

export const metadata: Metadata = buildMetadata(wifiQrSeo)

export default function WifiQrGeneratorPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={wifiQrSeo.structuredData} />
      <WifiQrGenerator>
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">Wi‑Fi QR Code Generator workflow guide</h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO‑friendly guide to create Wi‑Fi QR codes for WPA/WEP or open networks. Guests can join your wireless network by
                scanning a QR—no typos, no support tickets.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[ 
                {
                  title: "Enter network details (SSID, security, password)",
                  description: "Start every Wi‑Fi QR with the correct SSID and authentication type.",
                  steps: [
                    "Type the exact network name (SSID) as it appears on your router or access point.",
                    "Choose WPA/WPA2 for most modern routers. Pick WEP only for legacy hardware, or No password (nopass) for open networks.",
                    "Enter the Wi‑Fi password if required. Enable Hidden SSID when your network does not broadcast its name.",
                  ],
                  helper: "Special characters are supported—payload escaping is handled automatically in the QR.",
                },
                {
                  title: "Generate a Wi‑Fi QR code",
                  description: "Create a scannable code that mobile devices recognize instantly.",
                  steps: [
                    "Click Generate QR to build a standards‑compliant payload (WIFI:T:...;S:...;P:...;H:true;).",
                    "Preview the 480px PNG and verify the network name and security look correct.",
                    "Tap Copy payload if you need to store or share the underlying WIFI: string with IT.",
                  ],
                  helper: "Most iOS and Android cameras scan Wi‑Fi QR codes natively—no app required.",
                },
                {
                  title: "Download & print",
                  description: "Share codes on welcome cards, office signage, or event badges.",
                  steps: [
                    "Click Download PNG to save the QR image for documents or signage.",
                    "Print at least 2–3 cm (≈1 in) on paper; larger for hallways or conference rooms.",
                    "Keep background high‑contrast (black QR on white) for reliable scans.",
                  ],
                  helper: "Place codes near seating, reception, or meeting rooms so guests connect quickly.",
                },
                {
                  title: "Best practices for secure sharing",
                  description: "Protect credentials while keeping access friction‑free.",
                  steps: [
                    "Use a guest SSID with WPA2/WPA3 and an easy‑to‑change password for public areas.",
                    "Rotate passwords on a schedule and regenerate new QR codes to match.",
                    "Hide credentials in plain sight: place QR codes in staff‑visible areas if you need limited distribution.",
                  ],
                  helper: "For staff networks, keep QR codes internal—do not post on public websites or social feeds.",
                },
                {
                  title: "Troubleshooting scans",
                  description: "Fix common Wi‑Fi QR issues without calling IT.",
                  steps: [
                    "‘Can’t join’ on iOS/Android: confirm the security type matches the router (WPA vs. WEP vs. open).",
                    "Hidden SSID networks may need a manual step on some devices—toggle Hidden only if necessary.",
                    "If scanning fails, increase print size, boost contrast, or re‑generate with the correct SSID capitalization.",
                  ],
                  helper: "You can also share the WIFI: payload directly via chat for advanced users.",
                },
              ].map((section) => (
                <article key={section.title} className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
                  <header>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                  </header>
                  <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm leading-relaxed text-foreground/80">
                    {section.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-4 rounded-md border border-dashed border-border/80 bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    {section.helper}
                  </p>
                </article>
              ))}
            </div>
          </PageContainer>
        </section>
      </WifiQrGenerator>
    </main>
  )
}
