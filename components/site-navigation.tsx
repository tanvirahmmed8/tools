"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/page-container"

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Image to Text", href: "/image-to-text" },
  { label: "PDF to Text", href: "/pdf-to-text" },
  { label: "PDF to Images", href: "/pdf-to-image" },
  { label: "QR Toolkit", href: "/qr-tools" },
  { label: "Barcode Toolkit", href: "/barcode-tools" },
  { label: "Image Resizer", href: "/image-resizer" },
]

interface SiteNavigationProps {
  title?: string
  className?: string
}

export function SiteNavigation({ title = "TextExtract", className }: SiteNavigationProps) {
  const pathname = usePathname()

  return (
    <header className={cn("border-b border-border", className)}>
      <PageContainer className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">{title}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "transition-colors",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </PageContainer>
    </header>
  )
}
