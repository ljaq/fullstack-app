/**
 * Screenshot an HTML cover/slide file to PNG using Playwright.
 *
 * Convention (designs/YYYY-MM-DD-<slug>/):
 *   cover-3-4.html → output/<slug>-cover-3-4.png
 * HTML already prefixed (<slug>-cover-3-4.html) → output/<slug>-cover-3-4.png (no double prefix)
 * Legacy: *.cover.html → *.cover.png (same directory, deprecated)
 *
 * Usage:
 *   pnpm exec tsx {SKILL_ROOT}/scripts/cover-to-png.ts <path/to/file.html> [width] [height]
 */
import { chromium } from 'playwright'
import { basename, dirname, join, resolve } from 'path'
import { mkdir } from 'fs/promises'

const htmlPath = resolve(process.argv[2])
if (!htmlPath) {
  console.error('Usage: cover-to-png.ts <file.html> [width] [height]')
  process.exit(1)
}

const width = Number(process.argv[3] || 1080)
const height = Number(process.argv[4] || 1440)

/** Extract slug from designs/YYYY-MM-DD-<slug>/ directory name */
function extractSlugFromDesignDir(dir: string): string | null {
  const designDir =
    dir.endsWith('/output') || dir.endsWith('\\output') ? dirname(dir) : dir
  const match = basename(designDir).match(/^\d{4}-\d{2}-\d{2}-(.+)$/)
  return match ? match[1] : null
}

/** Prefix output PNG with slug unless already prefixed */
function withSlugPrefix(pngName: string, slug: string | null): string {
  if (!slug || pngName.startsWith(`${slug}-`)) return pngName
  return `${slug}-${pngName}`
}

function resolveOutPath(input: string): string {
  const base = basename(input)
  const dir = dirname(input)

  // Legacy: articles/foo.cover.html → foo.cover.png (same dir)
  if (/\.cover\.html$/.test(base)) {
    return join(dir, base.replace(/\.cover\.html$/, '.cover.png'))
  }

  const slug = extractSlugFromDesignDir(dir)
  const pngName = withSlugPrefix(base.replace(/\.html$/, '.png'), slug)

  // HTML already in output/ → PNG alongside it
  if (dir.endsWith('/output') || dir.endsWith('\\output')) {
    return join(dir, pngName)
  }

  // Standard: designs/.../cover-3-4.html → designs/.../output/<slug>-cover-3-4.png
  return join(dir, 'output', pngName)
}

const outPath = resolveOutPath(htmlPath)
await mkdir(dirname(outPath), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height, deviceScaleFactor: 1 } })
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
await page.screenshot({ path: outPath, type: 'png' })
await browser.close()

console.log(`✓ ${outPath} (${width}×${height})`)
