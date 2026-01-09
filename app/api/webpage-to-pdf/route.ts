import type { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// We load puppeteer only on the server
import puppeteer from "puppeteer"

function parseBody(body: any) {
  const url = String(body?.url || "").trim()
  const format = (body?.format || "A4") as "A4" | "Letter" | "Legal"
  const landscape = Boolean(body?.landscape)
  const printBackground = body?.printBackground !== false
  const margin = (body?.margin || "default") as "default" | "none"
  return { url, format, landscape, printBackground, margin }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}))
    const { url, format, landscape, printBackground, margin } = parseBody(data)

    let parsed: URL
    try {
      parsed = new URL(url)
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Invalid protocol")
    } catch {
      return new Response("Invalid URL", { status: 400 })
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=medium",
      ],
    })

    const page = await browser.newPage()
    // Emulate a common desktop environment for better SSR/CSR rendering
    await page.setViewport({ width: 1366, height: 900, deviceScaleFactor: 1 })
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    await page.setJavaScriptEnabled(true)
    await page.emulateMediaType("screen")

    // Navigate and give CSR apps (Next/React/Vue) time to hydrate
    await page.goto(parsed.toString(), { waitUntil: "domcontentloaded", timeout: 60000 })
    // Wait for full load and fonts
    await page.waitForFunction(() => document.readyState === "complete")
    await page.evaluate(() => (document as any).fonts?.ready)

    // Trigger lazy content by scrolling through the page
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let total = 0
        const distance = 800
        const timer = setInterval(() => {
          window.scrollBy(0, distance)
          total += distance
          if (total >= document.body.scrollHeight) {
            clearInterval(timer)
            window.scrollTo(0, 0)
            requestAnimationFrame(() => resolve())
          }
        }, 200)
      })
    })
    // Small settle delay for any final network calls
    await new Promise((resolve) => setTimeout(resolve, 800))

    const pdf = await page.pdf({
      format,
      landscape,
      printBackground,
      margin: margin === "none" ? undefined : { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
      preferCSSPageSize: true,
    })

    await browser.close()

    // Convert Buffer/Uint8Array to ArrayBuffer for Response
    const u8 = pdf as Uint8Array
    const arrayBuffer = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)

    const baseBuffer = u8.buffer as ArrayBuffer
    const copy = baseBuffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)
    const blob = new Blob([copy], { type: "application/pdf" })
    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="webpage.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (e) {
    console.error(e)
    return new Response("Failed to render PDF", { status: 500 })
  }
}
