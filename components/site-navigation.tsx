"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowRight, FileText, Menu, Moon, Sun, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/page-container"

type NavLink = {
  label: string
  href: string
}

type NavDropdown = {
  label: string
  dropdown: true
  items: NavLink[]
}

const navItems: Array<NavLink | NavDropdown> = [
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
      { label: "PDF Merge", href: "/pdf-merge" },
      { label: "PDF Split", href: "/pdf-split" },
      { label: "Image to PDF", href: "/image-to-pdf" },
      { label: "PDF Compress", href: "/pdf-compress" },
      { label: "PDF to Text", href: "/pdf-to-text" },
      { label: "Delete PDF Pages", href: "/delete-pdf-pages" },
      { label: "Protect PDF Password", href: "/protect-pdf-password" },
      { label: "Rearrange PDF Pages", href: "/rearrange-pdf-pages" },
      { label: "PDF to PNG", href: "/pdf-to-png" },
      { label: "PDF to JPG", href: "/pdf-to-jpg" },
      { label: "PDF to Word", href: "/pdf-to-word" },
    ],
  },
  { label: "QR Toolkit", href: "/qr-tools" },
  { label: "Barcode Toolkit", href: "/barcode-tools" },
]

interface SiteNavigationProps {
  title?: string
  className?: string
}

export function SiteNavigation({ title = "TextExtract", className }: SiteNavigationProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownCloseTimer = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (dropdownCloseTimer.current !== null) {
        window.clearTimeout(dropdownCloseTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
    <header
      className={cn(
        "relative z-50 border-b border-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-[#050912]/95",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 hidden dark:block dark:bg-gradient-to-br dark:from-[#0f172a]/70 dark:via-transparent dark:to-transparent" />
      <div className="pointer-events-none absolute -top-10 right-0 hidden h-32 w-32 rounded-full bg-primary/20 blur-3xl dark:block" />
      <PageContainer className="relative flex items-center justify-between py-4 text-slate-900 dark:text-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-9 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/30 dark:from-primary/80 dark:to-primary">
            <div className="flex h-full w-full items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>
          <span className="font-semibold text-lg tracking-wide">{title}</span>
        </Link>
        <div className="hidden md:flex items-center gap-5">
          <nav className="flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              if ("dropdown" in item) {
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
                        isActive
                          ? "text-slate-900 font-semibold dark:text-white"
                          : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white"
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
                        "absolute left-0 mt-2 min-w-[220px] rounded-2xl border border-black/5 bg-white text-slate-800 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] transition-opacity duration-150 z-20 dark:border-white/10 dark:bg-[#0c1224]/95 dark:text-white",
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
                              "px-4 py-2 text-left text-sm transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-white/30",
                              pathname.startsWith(sub.href)
                                ? "bg-slate-900/5 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5"
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-slate-900 font-semibold dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-slate-700 shadow-sm transition hover:scale-105 dark:border-white/15 dark:bg-white/10 dark:text-white"
            onClick={() => {
              if (!mounted) return
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }}
            aria-label="Toggle theme"
            disabled={!mounted}
          >
            {mounted ? (
              resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />
            ) : (
              <span className="inline-block size-5" />
            )}
          </button>
          <Link
            href="/image-to-text"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] via-[#ec4899] to-[#f97316] px-5 py-2 text-sm font-semibold text-white shadow-[0_15px_35px_-20px_rgba(236,72,153,0.8)] transition hover:scale-105"
          >
            Launch Studio
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-slate-700 shadow-sm transition hover:scale-105 dark:border-white/15 dark:bg-white/10 dark:text-white"
            onClick={() => {
              if (!mounted) return
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }}
            aria-label="Toggle theme"
            disabled={!mounted}
          >
            {mounted ? (
              resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />
            ) : (
              <span className="inline-block size-5" />
            )}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-slate-700 shadow-sm transition hover:scale-105 dark:border-white/15 dark:bg-white/10 dark:text-white"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </PageContainer>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#050912]/95">
          <PageContainer className="py-4">
            <nav className="space-y-3 text-sm text-slate-800 dark:text-white">
              {navItems.map((item) => {
                if ("dropdown" in item) {
                  return (
                    <div key={item.label} className="space-y-2 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <div className="space-y-1">
                        {item.items.map((sub) => {
                          const isActive = pathname.startsWith(sub.href)
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                "block rounded-md px-3 py-2 transition-colors",
                                isActive
                                  ? "bg-slate-900/5 font-semibold text-slate-900 dark:bg-white/10 dark:text-white"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/5",
                              )}
                            >
                              {sub.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-2xl border border-black/5 bg-white/80 px-4 py-3 font-medium shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
                      isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-white/80",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <Link
                href="/image-to-text"
                className="block rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#ec4899] to-[#f97316] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_15px_35px_-20px_rgba(236,72,153,0.8)] transition hover:scale-[1.01]"
              >
                Launch Studio
              </Link>
            </nav>
          </PageContainer>
        </div>
      )}
    </header>
  )
}
