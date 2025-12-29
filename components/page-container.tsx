import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn("container mx-auto w-full px-22", className)}>{children}</div>
}
