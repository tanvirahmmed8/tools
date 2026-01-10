import type { Metadata } from "next"

import { BarcodeTools } from "@/components/barcode-tools"
import { PageContainer } from "@/components/page-container"
import { StructuredDataScript } from "@/components/structured-data"
import { buildMetadata } from "@/lib/seo"
import barcodeSeo from "@/seo/barcode-tools.json"

export const metadata: Metadata = buildMetadata(barcodeSeo)

export default function BarcodeToolsFormatPage({ params }: { params: { format: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <StructuredDataScript data={barcodeSeo.structuredData} />
      {/* Reuse the same component; initialFormat controls generator & URL */}
      <BarcodeTools initialFormat={params.format}>
        {/* Keep the existing manual section from the base page to maintain content parity */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <PageContainer>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">User manual</p>
              <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
                Barcode Toolkit walkthrough
              </h2>
              <p className="text-base text-muted-foreground md:text-lg">
                Use this SEO-optimized guide to master the online barcode scanner, CODE128 barcode generator, and CSV bulk barcode maker.
                Each workflow keeps your barcode operations fast, browser-based, and search-friendly for ecommerce, retail, and logistics teams.
              </p>
            </div>
          </PageContainer>
        </section>
      </BarcodeTools>
    </main>
  )
}
