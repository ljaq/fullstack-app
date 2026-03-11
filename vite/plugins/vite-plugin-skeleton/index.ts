import type { IndexHtmlTransformContext, PluginOption, ResolvedConfig } from 'vite'
import { spawnSync } from 'child_process'
import path from 'path'
import { compileHtml } from '../../../scripts/compileHtml.js'

const cache = new Map<string, string>()

function resolvePageName(ctx: IndexHtmlTransformContext): string | null {
  const filename = ctx.filename || ctx.path || ''
  if (!filename) return null

  const pagesIndex = filename.indexOf('/client/pages/')
  if (pagesIndex !== -1) {
    const rest = filename.slice(pagesIndex + '/client/pages/'.length)
    const segments = rest.split(/[\\/]/)
    if (segments.length > 0 && segments[0]) {
      return segments[0]
    }
  }

  const match = filename.match(/[/\\]([^/\\]+)\.html$/)
  if (match) return match[1]

  return null
}

function getSkeletonHtml(pageName: string, rootDir: string): string {
  const cacheKey = pageName
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as string
  }

  const scriptPath = path.join(rootDir, 'scripts/getSkeletonCode.mts')
  const result = spawnSync('pnpm', ['exec', 'tsx', scriptPath, pageName], {
    cwd: rootDir,
    encoding: 'utf-8',
  })

  let skeleton = ''
  if (result.status === 0 && result.stdout) {
    try {
      const { style, html } = JSON.parse(result.stdout.trim())
      skeleton = style ? `${style}${html}` : html
    } catch {
      skeleton = ''
    }
  }

  cache.set(cacheKey, skeleton)
  return skeleton
}

export default function skeletonTransform(): PluginOption {
  let config: ResolvedConfig
  const rootDir = process.cwd()

  return {
    name: 'vite-plugin-skeleton-transform',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved
    },
    transformIndexHtml(html: string, ctx: IndexHtmlTransformContext) {
      const pageName = resolvePageName(ctx)
      if (!pageName) return html

      const skeleton = getSkeletonHtml(pageName, rootDir)
      const env =
        config.command === 'serve'
          ? { NODE_ENV: 'development', skeleton }
          : { NODE_ENV: 'production', skeleton }

      return compileHtml(html, env)
    },
  }
}
