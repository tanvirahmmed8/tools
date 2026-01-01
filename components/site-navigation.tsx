"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/page-container"

const navItems = [
  { label: "Overview", href: "/" },
  {
    label: "Image",
    dropdown: true,
    items: [
      { label: "Image to Text", href: "/image-to-text" },
      { label: "Image Converter", href: "/image-converter" },
      { label: "Image Resizer", href: "/image-resizer" },
      { label: "Image Watermark", href: "/image-watermark" },
    ],
  },
  {
    label: "PDF",
    dropdown: true,
    items: [
      { label: "PDF Merge/Split", href: "/pdf-merge-split" },
      { label: "Image to PDF", href: "/image-to-pdf" },
      { label: "PDF Compress", href: "/pdf-compress" },
      { label: "PDF to Text", href: "/pdf-to-text" },
      { label: "PDF to Images", href: "/pdf-to-image" },
      { label: "PDF to Word", href: "/pdf-to-word" },
    ],
  },
  { label: "QR Toolkit", href: "/qr-tools" },
  { label: "Barcode Toolkit", href: "/barcode-tools" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Contact", href: "/contact" },
]

interface SiteNavigationProps {
  title?: string
  className?: string
}

export function SiteNavigation({ title = "TextExtract", className }: SiteNavigationProps) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownCloseTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (dropdownCloseTimer.current !== null) {
        window.clearTimeout(dropdownCloseTimer.current)
      }
    }
  }, [])

  const handleDropdownEnter = (label: string) => {
    if (dropdownCloseTimer.current !== null) {
      window.clearTimeout(dropdownCloseTimer.current)
      dropdownCloseTimer.current = null
    }
    setOpenDropdown(label)
  }

  const handleDropdownLeave = () => {
    if (dropdownCloseTimer.current !== null) {
      window.clearTimeout(dropdownCloseTimer.current)
    }
    dropdownCloseTimer.current = window.setTimeout(() => setOpenDropdown(null), 120)
  }

  return (
    <header className={cn("relative border-b border-white/10 bg-[#050912]", className)}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f172a]/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      <PageContainer className="relative flex items-center justify-between py-4 text-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-9 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <FileText className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-wide">{title}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => {
            if (item.dropdown) {
              // PDF Dropdown
              const isActive = item.items.some((sub) => pathname.startsWith(sub.href))
              const isDropdownOpen = openDropdown === item.label
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                  onFocus={() => handleDropdownEnter(item.label)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      handleDropdownLeave()
                    }
                  }}
                >
                  <button
                    className={cn(
                      "transition-colors flex items-center gap-1 focus:outline-none",
                      isActive ? "text-white font-semibold" : "text-white/60 hover:text-white"
                    )}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                    tabIndex={0}
                    onFocus={() => handleDropdownEnter(item.label)}
                    onBlur={handleDropdownLeave}
                  >
                    {item.label}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div
                    className={cn(
                      "absolute left-0 mt-2 min-w-[200px] rounded-2xl border border-white/10 bg-[#0c1224]/95 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.9)] transition-opacity duration-150 z-20",
                      isDropdownOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                    onMouseEnter={() => handleDropdownEnter(item.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="flex flex-col py-2">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          tabIndex={0}
                          onFocus={() => handleDropdownEnter(item.label)}
                          onBlur={handleDropdownLeave}
                          className={cn(
                            "px-4 py-2 text-left text-sm transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                            pathname.startsWith(sub.href)
                              ? "bg-white/10 text-white font-semibold"
                              : "text-white/70 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            } else {
              if (typeof item.href === 'string') {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white font-semibold" : "text-white/60 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              }
              return null;
            }
          })}
        </nav>
      </PageContainer>
    </header>
  )
}
