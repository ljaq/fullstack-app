#!/usr/bin/env node

import fs from 'fs'

const dirNames = fs.readdirSync('./build/public/client/pages')

for (let i = 0; i < dirNames.length; i++) {
  fs.copyFileSync(`./build/public/client/pages/${dirNames[i]}/index.html`, `./build/public/${dirNames[i]}.html`)
}
fs.rmdirSync('./build/public/client', { recursive: true })
