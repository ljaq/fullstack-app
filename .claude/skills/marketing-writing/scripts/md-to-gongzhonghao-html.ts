#!/usr/bin/env tsx
/**
 * 公众号 Markdown → .fragment.html（marketing-writing skill 内置脚本）
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdown } from './gongzhonghao-html/parse-md'
import { renderFragment } from './gongzhonghao-html/render-html'

const __dirname = dirname(fileURLToPath(import.meta.url))
const marketingRoot = resolve(__dirname, '../../../../.marketing')
const defaultDir = join(marketingRoot, 'articles/gongzhonghao')

async function collectMdFiles(args: string[]): Promise<string[]> {
  if (args.length === 0) {
    const entries = await readdir(defaultDir)
    return entries
      .filter(name => name.endsWith('.md'))
      .map(name => join(defaultDir, name))
  }
  return args.map(arg => resolve(process.cwd(), arg))
}

async function convertFile(mdPath: string) {
  const md = await readFile(mdPath, 'utf8')
  const parsed = parseMarkdown(md)
  const fragmentPath = mdPath.replace(/\.md$/, '.fragment.html')
  await writeFile(fragmentPath, renderFragment(parsed), 'utf8')
  console.log(`✓ ${basename(mdPath)} → ${fragmentPath}`)
}

async function main() {
  const args = process.argv.slice(2).filter(a => a !== '--')
  const files = await collectMdFiles(args)
  if (files.length === 0) {
    console.error('未找到 .md 文件')
    process.exit(1)
  }
  for (const file of files) {
    await convertFile(file)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
