#!/usr/bin/env node
/**
 * 在 dev/build 前执行，直接修改 client/pages 下的 index.html 源码
 * 将 #root 内的加载内容替换为对应页面的 Ant Design Skeleton，开发与构建保持一致
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { injectSkeleton } from '../utils/skeletonHtml.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const pagesDir = path.join(rootDir, 'client/pages')

const pageNames = fs.readdirSync(pagesDir).filter(name => {
  const stat = fs.statSync(path.join(pagesDir, name))
  return stat.isDirectory() && fs.existsSync(path.join(pagesDir, name, 'index.html'))
})

for (const pageName of pageNames) {
  const htmlPath = path.join(pagesDir, pageName, 'index.html')
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const result = injectSkeleton(html, pageName)
  if (result !== html) {
    fs.writeFileSync(htmlPath, result)
    console.log(`[injectSkeleton] ${pageName}/index.html`)
  }
}
