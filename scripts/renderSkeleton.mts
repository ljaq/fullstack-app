#!/usr/bin/env node
/**
 * 将页面的 Skeleton.tsx 渲染为静态 HTML
 * 用法: pnpm exec tsx scripts/renderSkeleton.mts <pageName> [pathname]
 * 输出: HTML 字符串到 stdout
 */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import path from 'path'
import { pathToFileURL } from 'url'

const pageName = process.argv[2]
const pathname = process.argv[3] || ''
if (!pageName) {
  process.exit(1)
}

const rootDir = path.resolve(process.cwd())
const skeletonPath = path.join(rootDir, 'client/pages', pageName, 'Skeleton.tsx')

const { default: Skeleton } = await import(pathToFileURL(skeletonPath).href)
const html = renderToStaticMarkup(React.createElement(Skeleton, { pathname }))
process.stdout.write(html)
