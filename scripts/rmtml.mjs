#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { compileHtml } from '../utils/compileHtml.js'
import { renderSkeleton } from '../utils/renderSkeleton.js'

const dirNames = fs.readdirSync('./build/public/client/pages')
const skeletonMap = {} // { page: { pathname: skeletonHtml } }

for (let i = 0; i < dirNames.length; i++) {
  const page = dirNames[i]
  const src = `./build/public/client/pages/${page}/index.html`
  const dest = `./build/public/${page}.html`
  const content = fs.readFileSync(src, 'utf-8')

  let pathnames = [`/${page}`]
  try {
    const skeletonSrc = fs.readFileSync(path.resolve(`./client/pages/${page}/Skeleton.tsx`), 'utf-8')
    const keys = [...skeletonSrc.matchAll(/^\s*['"](\/[^'"]+)['"]\s*:/gm)].map(m => m[1]).filter(k => k.startsWith(`/${page}`))
    if (keys.length) pathnames = [...new Set([`/${page}`, ...keys])]
  } catch {
    /* no routeSkeletons */
  }
  skeletonMap[page] = {}
  for (const pathname of pathnames) {
    skeletonMap[page][pathname] = renderSkeleton(page, pathname)
  }

  fs.writeFileSync(dest, compileHtml(content, { NODE_ENV: 'production', skeleton: '{{@ skeleton }}' }))
}

fs.writeFileSync('./build/skeleton-map.json', JSON.stringify(skeletonMap))
fs.rmSync('./build/public/client', { recursive: true })
