#!/usr/bin/env node
/**
 * 在 dev/build 前执行，将各页面的 Skeleton.tsx 渲染为 HTML 注入 index.html
 * 无 Skeleton.tsx 的页面不注入，保持原样
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const pagesDir = path.join(rootDir, 'client/pages')

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

function injectSkeleton(html, skeletonHtml) {
  const rootContentRegex = /<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/m
  const rootWithSkeleton = `<div id="root">\n      <style>${SKELETON_CSS}</style>\n      ${skeletonHtml.trim()}\n    </div>`
  return html.replace(rootContentRegex, rootWithSkeleton)
}

const pageNames = fs.readdirSync(pagesDir).filter(name => {
  const stat = fs.statSync(path.join(pagesDir, name))
  return stat.isDirectory() && fs.existsSync(path.join(pagesDir, name, 'index.html'))
})

for (const pageName of pageNames) {
  const skeletonPath = path.join(pagesDir, pageName, 'Skeleton.tsx')
  if (!fs.existsSync(skeletonPath)) continue

  const result = spawnSync('pnpm', ['exec', 'tsx', 'scripts/renderSkeleton.mts', pageName], {
    cwd: rootDir,
    encoding: 'utf-8',
  })
  if (result.status !== 0 || !result.stdout) continue

  const htmlPath = path.join(pagesDir, pageName, 'index.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const newHtml = injectSkeleton(html, result.stdout.trim())
  if (newHtml !== html) {
    fs.writeFileSync(htmlPath, newHtml)
    console.log(`[injectSkeleton] ${pageName}/index.html`)
  }
}
