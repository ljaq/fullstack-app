#!/usr/bin/env node

import fs from 'fs'
import { compileHtml } from '../utils/compileHtml.js'

const dirNames = fs.readdirSync('./build/public/client/pages')

// 与开发模式相同：用 art-template 编译模板，构建时 NODE_ENV=production 会去掉 {{if NODE_ENV === 'development'}} 块
for (let i = 0; i < dirNames.length; i++) {
  const src = `./build/public/client/pages/${dirNames[i]}/index.html`
  const dest = `./build/public/${dirNames[i]}.html`
  const content = fs.readFileSync(src, 'utf-8')
  // skeleton 占位符保留供运行时 art-template 动态注入
  fs.writeFileSync(dest, compileHtml(content, { NODE_ENV: 'production', skeleton: '{{skeleton}}' }))
}
fs.rmSync('./build/public/client', { recursive: true })
