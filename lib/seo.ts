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

const FALLBACK_SITE_URL = "https://tools-three-pi.vercel.app"

function resolveSiteUrlFromEnv(): string | undefined {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL

  if (!envUrl) {
    return undefined
  }

  if (/^https?:\/\//i.test(envUrl)) {
    return envUrl
  }

  return `https://${envUrl}`
}

export function getSiteUrl(): string {
  return resolveSiteUrlFromEnv() ?? FALLBACK_SITE_URL
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

function ensureAbsoluteUrl(value?: string | URL, siteUrl?: string): string | undefined {
  if (!value) {
    return undefined
  }

  if (value instanceof URL) {
    return value.toString()
  }

  try {
    return new URL(value).toString()
  } catch {
    if (!siteUrl) {
      return value
    }
    try {
      return new URL(value, siteUrl).toString()
    } catch {
      return value
    }
  }
}

function normalizeOpenGraph(openGraph: Metadata["openGraph"] | undefined, siteUrl: string) {
  if (!openGraph) {
    return undefined
  }

  const normalized: Metadata["openGraph"] = { ...openGraph }

  if (openGraph.url) {
    normalized.url = ensureAbsoluteUrl(openGraph.url, siteUrl)
  }

  if (openGraph.images) {
    const images = Array.isArray(openGraph.images) ? openGraph.images : [openGraph.images]
    normalized.images = images.map((image) => {
      if (typeof image === "string") {
        return ensureAbsoluteUrl(image, siteUrl) ?? image
      }
      if (image instanceof URL) {
        return image
      }
      return { ...image, url: ensureAbsoluteUrl(image.url, siteUrl) ?? image.url }
    })
  }

  return normalized
}

function normalizeTwitter(twitter: Metadata["twitter"] | undefined, siteUrl: string) {
  if (!twitter) {
    return undefined
  }

  const normalized: Metadata["twitter"] = { ...twitter }
  const rawImages =
    (normalized as { image?: string | string[]; images?: string | string[] }).image ??
    normalized.images

  if (rawImages) {
    const list = Array.isArray(rawImages) ? rawImages : [rawImages]
    normalized.images = list.map((img) => (typeof img === "string" ? ensureAbsoluteUrl(img, siteUrl) ?? img : img))
    delete (normalized as { image?: unknown }).image
  }

  return normalized
}

function isRelativePath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
}

export function applySiteUrlToStructuredData(data: unknown, siteUrl = getSiteUrl()): unknown {
  if (!data) {
    return data
  }

  const transform = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(transform)
    }

    if (isRelativePath(value)) {
      return ensureAbsoluteUrl(value, siteUrl) ?? value
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, transform(entry)]),
      )
    }

    return value
  }

  return transform(data)
}

export function buildMetadata(config: SeoConfig): Metadata {
  const siteUrl = getSiteUrl()
  const metadata: Metadata = {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
  }

  metadata.metadataBase = new URL(siteUrl)

  const openGraph = normalizeOpenGraph(config.openGraph, siteUrl)
  if (openGraph) {
    metadata.openGraph = openGraph
  }

  const twitter = normalizeTwitter(config.twitter, siteUrl)
  if (twitter) {
    metadata.twitter = twitter
  }

  if (config.canonical) {
    metadata.alternates = { canonical: ensureAbsoluteUrl(config.canonical, siteUrl) ?? config.canonical }
  }

  const robots = parseRobots(config.robots)
  if (robots) {
    metadata.robots = robots
  }

  return metadata
}

export type { SeoConfig }
