/**
 * 服务端渲染 Skeleton.tsx 为 HTML，供 art-template 动态注入
 * 使用 spawn 调用 renderSkeleton.mts，带缓存
 * .ant-skeleton 样式与骨架屏一起注入
 */
import { spawnSync } from 'child_process'
import path from 'path'

const rootDir = process.cwd()

const SKELETON_CSS = `
.ant-skeleton { display: block; }
.ant-skeleton-content { padding-top: 16px; }
.ant-skeleton-title { height: 16px; margin-top: 16px; border-radius: 4px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-title:first-child { margin-top: 0; }
.ant-skeleton-paragraph { margin-top: 16px; padding-left: 0; list-style: none; }
.ant-skeleton-paragraph > li { height: 16px; margin-top: 16px; border-radius: 4px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-paragraph > li:first-child { margin-top: 0; }
.ant-skeleton-input { height: 32px; border-radius: 6px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-button { height: 32px; width: 64px; border-radius: 6px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-avatar { border-radius: 4px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
@keyframes skeleton-loading { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
`

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

  const skeletonHtml = result.status === 0 && result.stdout ? result.stdout.trim() : ''
  const html = skeletonHtml ? `<style>${SKELETON_CSS}</style>${skeletonHtml}` : ''
  cache.set(cacheKey, html)
  return html
}
