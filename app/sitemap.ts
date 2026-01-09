import type { MetadataRoute } from "next"

import { getSiteUrl } from "@/lib/seo"

const ROUTES = [
  "/",
  "/barcode-tools",
  "/image-converter",
  "/image-resizer",
  "/image-to-pdf",
  "/image-to-text",
  "/image-watermark",
  "/pdf-compress",
  "/pdf-merge",
  "/pdf-split",
  "/delete-pdf-pages",
  "/edit-pdf",
  "/protect-pdf-password",
  "/rearrange-pdf-pages",
  "/rotate-pdf-pages",
  "/unlock-pdf",
  "/pdf-to-png",
  "/pdf-to-jpg",
  "/pdf-to-text",
  "/pdf-to-word",
  "/qr-tools",
  "/about-us",
  "/disclaimer",
  "/contact",
  "/privacy-policy",
  "/terms-and-conditions",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

  return ROUTES.map((path, index) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }))
}
