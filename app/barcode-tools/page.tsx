import type { Metadata } from "next"

import { BarcodeTools } from "@/components/barcode-tools"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import barcodeSeo from "@/seo/barcode-tools.json"

export const metadata: Metadata = buildMetadata(barcodeSeo)

export default function BarcodeToolsPage() {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={barcodeSeo.structuredData} />
      <BarcodeTools />
    </main>
  )
}
