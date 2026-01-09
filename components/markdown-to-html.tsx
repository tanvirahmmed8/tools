"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Braces, Check, Copy, Download, FileText, RefreshCcw, Rows4 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import { PageContainer } from "@/components/page-container"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavigation } from "@/components/site-navigation"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeAttr(str: string): string {
  // Basic attribute escape; disallow quotes and angle brackets
  return escapeHtml(str).replace(/`/g, "&#96;")
}

function mdToHtml(md: string): string {
  if (!md.trim()) return ""

  // 1) Handle fenced code blocks first with placeholders
  const blockPlaceholders: string[] = []
  let text = md
  text = text.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const idx = blockPlaceholders.length
    const html = `<pre><code>${escapeHtml(String(code).replace(/^\n|\n$/g, ""))}</code></pre>`
    blockPlaceholders.push(html)
    return `@@BLOCK_${idx}@@`
  })

  // Inline formatter using token placeholders
  function applyInline(line: string): string {
    const tokens: string[] = []
    let s = line

    function put(html: string) {
      const i = tokens.length
      tokens.push(html)
      return `@@T_${i}@@`
    }

    // Links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/g, (_m, t, u) => {
      const safeT = escapeHtml(String(t))
      const safeU = escapeAttr(String(u))
      return put(`<a href="${safeU}" rel="nofollow noopener" target="_blank">${safeT}</a>`)
    })

    // Inline code `code`
    s = s.replace(/`([^`]+)`/g, (_m, c) => {
      return put(`<code>${escapeHtml(String(c))}</code>`)
    })

    // Bold **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, (_m, b) => put(`<strong>${escapeHtml(String(b))}</strong>`))

    // Italic *text* (basic)
    s = s.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, (_m, pre, it) => `${pre}${put(`<em>${escapeHtml(String(it))}</em>`)}`)

    // Escape remaining
    let out = escapeHtml(s)

    // Restore tokens
    out = out.replace(/@@T_(\d+)@@/g, (_m, i) => tokens[Number(i)] ?? "")
    return out
  }

  const lines = text.split(/\r?\n/)
  const out: string[] = []
  let inUl = false
  let inOl = false

  function closeLists() {
    if (inUl) { out.push("</ul>"); inUl = false }
    if (inOl) { out.push("</ol>"); inOl = false }
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "")
    if (!line.trim()) {
      closeLists()
      continue
    }

    // Handle code block placeholders as standalone paragraphs
    if (/^@@BLOCK_\d+@@$/.test(line.trim())) {
      closeLists()
      out.push(line.trim())
      continue
    }

    // Headings # .. ######
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      closeLists()
      const level = heading[1].length
      out.push(`<h${level}>${applyInline(heading[2])}</h${level}>`)
      continue
    }

    // Ordered list
    if (/^\s*\d+[\.)]\s+/.test(line)) {
      if (!inOl) { closeLists(); out.push("<ol>"); inOl = true }
      const item = line.replace(/^\s*\d+[\.)]\s+/, "")
      out.push(`<li>${applyInline(item)}</li>`)
      continue
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      if (!inUl) { closeLists(); out.push("<ul>"); inUl = true }
      const item = line.replace(/^\s*[-*+]\s+/, "")
      out.push(`<li>${applyInline(item)}</li>`)
      continue
    }

    // Paragraph
    out.push(`<p>${applyInline(line)}</p>`)
  }

  closeLists()

  let html = out.join("\n")
  // Restore block placeholders
  html = html.replace(/@@BLOCK_(\d+)@@/g, (_m, i) => blockPlaceholders[Number(i)] ?? "")
  return html
}

type MarkdownToHtmlProps = { children?: ReactNode }

export function MarkdownToHtml({ children }: MarkdownToHtmlProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  const hasInput = useMemo(() => input.trim().length > 0, [input])

  const convert = useCallback(() => {
    const html = mdToHtml(input)
    setOutput(html)
  }, [input])

  const clearAll = useCallback(() => { setInput(""); setOutput("") }, [])

  const loadSample = useCallback(() => {
    const sample = `# Markdown to HTML\n\nConvert **Markdown** to <em>safe</em> HTML.\n\n- Handles *italics*, **bold**, and \n- \`inline code\` and links like [Next.js](https://nextjs.org)\n\n## Code\n\n\`\`\`\nconsole.log('fenced code');\n\`\`\``.replace(/`/g, "`")
    setInput(sample)
    setOutput("")
  }, [])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }, [output])

  const downloadHtml = useCallback(() => {
    const blob = new Blob([output], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "converted.html"
    a.click()
    URL.revokeObjectURL(url)
  }, [output])

  return (
    <div className="min-h-screen">
      <SiteNavigation title="Dev tools" />

      <section className="py-16 md:py-24">
        <PageContainer>
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-1 text-sm text-secondary-foreground">
              <Rows4 className="size-4" />
              <span>Markdown utilities</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Markdown to HTML</h1>
            <p className="text-lg text-muted-foreground">Convert Markdown into sanitized HTML without external dependencies.</p>
          </div>
        </PageContainer>
      </section>

      <section className="pb-16">
        <PageContainer>
          <GlowCard tone="violet" className="p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <FileText className="size-4" />
                    Input Markdown
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={loadSample}>Sample</Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} disabled={!hasInput}>
                      <RefreshCcw className="size-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <textarea
                  className="min-h-[260px] w-full rounded-lg border border-border bg-background/80 p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="# Heading\n\nSome **bold** text and a [link](https://example.com)."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={convert} disabled={!hasInput}>Convert</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium flex items-center gap-2">
                    <Braces className="size-4" />
                    Output HTML
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={downloadHtml} disabled={!output}>
                      <Download className="size-4" />
                      Download
                    </Button>
                    <Button size="sm" onClick={onCopy} disabled={!output}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  className="min-h-[260px] w-full rounded-lg border border-border bg-muted/40 p-3 text-sm font-mono"
                  placeholder="Converted HTML will appear here."
                  value={output}
                />
              </div>
            </div>
          </GlowCard>
        </PageContainer>
      </section>

      {children}
      <SiteFooter />
    </div>
  )
}
