import { applySiteUrlToStructuredData } from "@/lib/seo"

interface StructuredDataScriptProps {
  data?: unknown
}

export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  if (!data) {
    return null
  }

  const resolvedData = applySiteUrlToStructuredData(data)

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(resolvedData) }}
    />
  )
}
