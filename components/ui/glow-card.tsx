import * as React from "react"

import { cn } from "@/lib/utils"
import { toneStyles, type ToneKey } from "@/lib/tones"

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: ToneKey
  hover?: boolean
}

export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ tone = "slate", hover = true, className, children, ...props }, ref) => {
    const style = toneStyles[tone] ?? toneStyles.slate

    return (
      <div
        ref={ref}
        className={cn(
          "glow-card group relative overflow-hidden rounded-3xl border border-white/10 bg-[#070d1b]/95 p-6 text-white shadow-[0_35px_90px_-45px_rgba(7,13,27,0.95)] transition duration-300",
          hover && "hover:-translate-y-1 hover:border-white/30",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition duration-300",
            style.glow,
            hover ? "group-hover:opacity-100" : "opacity-100"
          )}
        />
        <div className={cn("pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full blur-3xl opacity-50", style.aura)} />
        <div className="relative z-10 flex flex-col gap-6">{children}</div>
      </div>
    )
  }
)

GlowCard.displayName = "GlowCard"
