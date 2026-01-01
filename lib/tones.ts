export const toneStyles = {
  iris: {
    glow: "from-[#8b5cf6]/40 via-transparent to-transparent",
    aura: "bg-[#8b5cf6]/40",
    iconBg: "bg-[#8b5cf6]/20 text-[#f5f3ff]",
    badge: "text-[#d7c9ff]",
  },
  rose: {
    glow: "from-[#fb7185]/35 via-transparent to-transparent",
    aura: "bg-[#fb7185]/35",
    iconBg: "bg-[#fb7185]/20 text-[#ffe4e6]",
    badge: "text-[#fecdd3]",
  },
  azure: {
    glow: "from-[#38bdf8]/35 via-transparent to-transparent",
    aura: "bg-[#38bdf8]/30",
    iconBg: "bg-[#38bdf8]/20 text-[#e0f2fe]",
    badge: "text-[#bae6fd]",
  },
  emerald: {
    glow: "from-[#34d399]/35 via-transparent to-transparent",
    aura: "bg-[#34d399]/30",
    iconBg: "bg-[#34d399]/20 text-[#d1fae5]",
    badge: "text-[#a7f3d0]",
  },
  amber: {
    glow: "from-[#fbbf24]/35 via-transparent to-transparent",
    aura: "bg-[#fbbf24]/30",
    iconBg: "bg-[#fbbf24]/20 text-[#fef3c7]",
    badge: "text-[#fde68a]",
  },
  magenta: {
    glow: "from-[#ec4899]/35 via-transparent to-transparent",
    aura: "bg-[#ec4899]/30",
    iconBg: "bg-[#ec4899]/20 text-[#fdf2f8]",
    badge: "text-[#fbcfe8]",
  },
  cobalt: {
    glow: "from-[#4b70ff]/35 via-transparent to-transparent",
    aura: "bg-[#4b70ff]/30",
    iconBg: "bg-[#4b70ff]/20 text-[#eff4ff]",
    badge: "text-[#c7d2fe]",
  },
  lime: {
    glow: "from-[#a3e635]/30 via-transparent to-transparent",
    aura: "bg-[#a3e635]/30",
    iconBg: "bg-[#a3e635]/20 text-[#ecfccb]",
    badge: "text-[#d9f99d]",
  },
  sunset: {
    glow: "from-[#fb923c]/35 via-transparent to-transparent",
    aura: "bg-[#fb923c]/30",
    iconBg: "bg-[#fb923c]/20 text-[#fff1e6]",
    badge: "text-[#fed7aa]",
  },
  teal: {
    glow: "from-[#2dd4bf]/35 via-transparent to-transparent",
    aura: "bg-[#2dd4bf]/30",
    iconBg: "bg-[#2dd4bf]/20 text-[#d5f5ef]",
    badge: "text-[#99f6e4]",
  },
  violet: {
    glow: "from-[#c084fc]/35 via-transparent to-transparent",
    aura: "bg-[#c084fc]/30",
    iconBg: "bg-[#c084fc]/20 text-[#f5e1ff]",
    badge: "text-[#e9d5ff]",
  },
  slate: {
    glow: "from-[#94a3b8]/35 via-transparent to-transparent",
    aura: "bg-[#94a3b8]/25",
    iconBg: "bg-[#94a3b8]/20 text-[#f1f5f9]",
    badge: "text-[#cbd5f5]",
  },
} as const

export type ToneKey = keyof typeof toneStyles
