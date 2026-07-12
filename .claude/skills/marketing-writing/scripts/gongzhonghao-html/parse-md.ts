export type Frontmatter = {
  title?: string
  platform?: string
  date?: string
  tags?: string[]
  assets?: string[]
}

export type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'hr' }
  | { type: 'img'; alt: string; src: string }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'ul'; items: string[] }

export type ParsedArticle = {
  frontmatter: Frontmatter
  blocks: Block[]
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function parseFrontmatter(raw: string): Frontmatter {
  const fm: Frontmatter = {}
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (!m) continue
    const [, key, value] = m
    if (key === 'tags' || key === 'assets') {
      const items = value
        .replace(/^\[/, '')
        .replace(/\]$/, '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      fm[key] = items
    } else {
      fm[key as 'title' | 'platform' | 'date'] = value.trim()
    }
  }
  return fm
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function escapeAttr(text: string): string {
  return escapeHtml(text)
}

export function parseInline(
  text: string,
  styles: { strong: string; em: string },
): string {
  const escaped = escapeHtml(text)
  const strongStyle = ` style="${styles.strong}"`
  const emStyle = ` style="${styles.em}"`
  return escaped
    .replace(/\*\*(.+?)\*\*/g, `<strong${strongStyle}>$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em${emStyle}>$1</em>`)
}

function isHr(line: string) {
  return /^---+$/.test(line.trim())
}

function isHeading(line: string, level: 1 | 2) {
  return line.startsWith('#'.repeat(level) + ' ')
}

function parseImg(line: string): { alt: string; src: string } | null {
  const m = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
  if (!m) return null
  return { alt: m[1], src: m[2] }
}

export function parseMarkdown(md: string): ParsedArticle {
  let body = md
  let frontmatter: Frontmatter = {}

  const fmMatch = md.match(FRONTMATTER_RE)
  if (fmMatch) {
    frontmatter = parseFrontmatter(fmMatch[1])
    body = md.slice(fmMatch[0].length)
  }

  const lines = body.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (!trimmed) {
      i++
      continue
    }

    if (isHr(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    if (isHeading(trimmed, 1)) {
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() })
      i++
      continue
    }

    if (isHeading(trimmed, 2)) {
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() })
      i++
      continue
    }

    const img = parseImg(trimmed)
    if (img) {
      blocks.push({ type: 'img', ...img })
      i++
      continue
    }

    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'blockquote', lines: quoteLines })
      continue
    }

    if (trimmed.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    const paraLines = [trimmed]
    i++
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        !next ||
        isHr(next) ||
        isHeading(next, 1) ||
        isHeading(next, 2) ||
        parseImg(next) ||
        next.startsWith('> ') ||
        next.startsWith('- ')
      ) {
        break
      }
      paraLines.push(next)
      i++
    }
    blocks.push({ type: 'p', text: paraLines.join('\n') })
  }

  return { frontmatter, blocks }
}
