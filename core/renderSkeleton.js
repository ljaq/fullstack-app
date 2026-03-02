/**
 * 服务端渲染 Skeleton.tsx 为 HTML，供 art-template 动态注入
 * 使用 spawn 调用 renderSkeleton.mts，带缓存
 * 通过 antd StyleProvider + extractStyle 提取 Skeleton 组件样式并注入模板
 */
import { spawnSync } from 'child_process'
import path from 'path'

const rootDir = process.cwd()

const cache = new Map()

function getCacheKey(pageName, pathname) {
  return `${pageName}:${pathname || ''}`
}

export function renderSkeleton(pageName, pathname) {
  const cacheKey = getCacheKey(pageName, pathname)
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const scriptPath = path.join(rootDir, 'scripts/renderSkeleton.mts')
  const args = [pageName]
  if (pathname) args.push(pathname)

  const result = spawnSync('pnpm', ['exec', 'tsx', scriptPath, ...args], {
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
