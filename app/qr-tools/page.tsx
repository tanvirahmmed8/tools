import type { Metadata } from "next"

import { QrTools } from "@/components/qr-tools"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import qrToolsSeo from "@/seo/qr-tools.json"

export const metadata: Metadata = buildMetadata(qrToolsSeo)

export default function QrToolsPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={qrToolsSeo.structuredData} />
      <QrTools />
    </main>
  )
}
