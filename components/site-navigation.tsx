"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText } from "lucide-react"

import { cn } from "@/lib/utils"
import { PageContainer } from "@/components/page-container"

const navItems = [
  { label: "Overview", href: "/" },
  { label: "Image to Text", href: "/image-to-text" },
  {
    label: "PDF",
    dropdown: true,
    items: [
      { label: "PDF Compress", href: "/pdf-compress" },
      { label: "PDF to Text", href: "/pdf-to-text" },
      { label: "PDF to Images", href: "/pdf-to-image" },
      { label: "PDF to Word", href: "/pdf-to-word" },
    ],
  },
  { label: "QR Toolkit", href: "/qr-tools" },
  { label: "Barcode Toolkit", href: "/barcode-tools" },
  { label: "Image Converter", href: "/image-converter" },
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
            if (item.dropdown) {
              // PDF Dropdown
              const isActive = item.items.some((sub) => pathname.startsWith(sub.href))
              return (
                <div key={item.label} className="relative group" tabIndex={0} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.classList.remove('dropdown-open') }} onFocus={e => e.currentTarget.classList.add('dropdown-open')} onMouseEnter={e => e.currentTarget.classList.add('dropdown-open')} onMouseLeave={e => e.currentTarget.classList.remove('dropdown-open')}>
                  <button
                    className={cn(
                      "transition-colors flex items-center gap-1 focus:outline-none",
                      isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-haspopup="true"
                    aria-expanded={undefined}
                    tabIndex={0}
                    onFocus={e => e.currentTarget.parentElement?.classList.add('dropdown-open')}
                    onBlur={e => e.currentTarget.parentElement?.classList.remove('dropdown-open')}
                  >
                    {item.label}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute left-0 mt-2 min-w-[180px] bg-popover border border-border rounded shadow-lg opacity-0 pointer-events-none transition-opacity z-20 group-[.dropdown-open]:opacity-100 group-[.dropdown-open]:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto">
                    <div className="flex flex-col py-2">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          tabIndex={0}
                          className={cn(
                            "px-4 py-2 text-left text-sm transition-colors focus:bg-accent focus:text-foreground",
                            pathname.startsWith(sub.href)
                              ? "text-foreground font-medium bg-accent"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
                      isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
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
