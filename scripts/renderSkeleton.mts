#!/usr/bin/env node
/**
 * 将页面的 Skeleton.tsx 渲染为静态 HTML，并提取 antd 组件样式
 * 用法: pnpm exec tsx scripts/renderSkeleton.mts <pageName> [pathname]
 * 输出: JSON 到 stdout，格式 { style, html }
 */
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import path from 'path'
import { pathToFileURL } from 'url'
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'

const pageName = process.argv[2]
const pathname = process.argv[3] || ''
if (!pageName) {
  process.exit(1)
}

const rootDir = path.resolve(process.cwd())
const skeletonPath = path.join(rootDir, 'client/pages', pageName, 'Skeleton.tsx')

const { default: Skeleton } = await import(pathToFileURL(skeletonPath).href)

const cache = createCache()
const html = renderToStaticMarkup(
  React.createElement(
    StyleProvider,
    { cache },
    React.createElement(Skeleton, { pathname }),
  ),
)
const styleText = extractStyle(cache)

const out = JSON.stringify({ style: styleText, html })
process.stdout.write(out)
