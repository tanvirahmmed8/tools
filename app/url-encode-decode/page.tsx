import type { Metadata } from "next"

import { UrlEncodeDecode } from "@/components/url-encode-decode"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import urlEncodeDecodeSeo from "@/seo/url-encode-decode.json"

export const metadata: Metadata = buildMetadata(urlEncodeDecodeSeo)

export default function UrlEncodeDecodePage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={urlEncodeDecodeSeo.structuredData} />
      <UrlEncodeDecode />
    </main>
  )
}
