import type { ReactNode } from "react"
import Link from "next/link"

import { PageContainer } from "@/components/page-container"
import { cn } from "@/lib/utils"

interface SiteFooterProps {
  children?: ReactNode
  className?: string
}

export function SiteFooter({ children, className }: SiteFooterProps) {
  const year = new Date().getFullYear()
  const footerLinks = [
    { label: "About Us", href: "/about-us" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Contact", href: "/contact" },
  ] as const

  return (
    <footer className={cn("border-t border-border bg-background/80", className)}>
      <PageContainer className="py-8 text-center text-sm text-muted-foreground space-y-4">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
        <p>© TextExtract. All rights reserved {year}</p>
      </PageContainer>
    </footer>
  )
}
