interface StructuredDataScriptProps {
  data?: unknown
}

export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  if (!data) {
    return null
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
