#!/usr/bin/env node

import fs from 'fs'
import { compileHtml } from './compileHtml.js'

const dirNames = fs.readdirSync('./build/public/client/pages')

for (let i = 0; i < dirNames.length; i++) {
  const page = dirNames[i]
  const src = `./build/public/client/pages/${page}/index.html`
  const dest = `./build/public/${page}.html`
  const content = fs.readFileSync(src, 'utf-8')

  // 仅负责：
  // - 使用 art-template 处理 NODE_ENV 等模板变量
  // - 将多页输出从 client/pages/*/index.html 扁平到 /<page>.html
  // 骨架屏已在 Vite 插件阶段通过 transformIndexHtml 注入为静态 HTML
  fs.writeFileSync(dest, compileHtml(content, { NODE_ENV: 'production' }))
}

fs.rmSync('./build/public/client', { recursive: true })
