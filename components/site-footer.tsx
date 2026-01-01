import type { ReactNode } from "react"

import { PageContainer } from "@/components/page-container"
import { cn } from "@/lib/utils"

interface SiteFooterProps {
  children?: ReactNode
  className?: string
}

export function SiteFooter({ children, className }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className={cn("border-t border-border bg-background/80", className)}>
      <PageContainer className={cn("py-8 text-center text-sm text-muted-foreground", children ? "space-y-4" : undefined)}>
        {children}
        <p>© TextExtract. All rights reserved {year}</p>
      </PageContainer>
    </footer>
  )
}
