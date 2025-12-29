import type { Metadata } from "next"

interface SeoConfig {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  robots?: string
  openGraph?: Metadata["openGraph"]
  twitter?: Metadata["twitter"]
  structuredData?: unknown
}

function parseRobots(value?: string): Metadata["robots"] | undefined {
  if (!value) {
    return undefined
  }

  const tokens = value
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)

  if (!tokens.length) {
    return undefined
  }

  const robots: NonNullable<Metadata["robots"]> = {}

  if (tokens.includes("noindex")) {
    robots.index = false
  } else if (tokens.includes("index")) {
    robots.index = true
  }

  if (tokens.includes("nofollow")) {
    robots.follow = false
  } else if (tokens.includes("follow")) {
    robots.follow = true
  }

  return robots
}

export function buildMetadata(config: SeoConfig): Metadata {
  const metadata: Metadata = {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    openGraph: config.openGraph,
    twitter: config.twitter,
  }

  if (config.canonical) {
    metadata.alternates = { canonical: config.canonical }
    try {
      const canonicalUrl = new URL(config.canonical)
      metadata.metadataBase = new URL(`${canonicalUrl.protocol}//${canonicalUrl.host}`)
    } catch {
      // ignore invalid canonical url
    }
  }

  const robots = parseRobots(config.robots)
  if (robots) {
    metadata.robots = robots
  }

  return metadata
}

export type { SeoConfig }
