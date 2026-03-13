/**
 * 在 Turso 上执行建表 SQL（无 Turso CLI 时可用）
 * 运行: pnpm run db:init 或 mode=development tsx scripts/init-turso-db.ts
 */
import dotenv from 'dotenv'
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config({ path: `.env.${process.env.mode || 'development'}` })

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('缺少 TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlPath = path.join(__dirname, '..', 'prisma', 'turso-init.sql')
const sql = readFileSync(sqlPath, 'utf-8')

function stripCommentLines(s: string) {
  return s
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
}

async function main() {
  const client = createClient({ url, authToken })
  const statements = sql
    .split(';')
    .map(s => stripCommentLines(s).trim())
    .filter(s => s.length > 0)
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    try {
      await client.execute(stmt)
      console.log('OK:', stmt.slice(0, 60).replace(/\s+/g, ' ') + '...')
    } catch (e: any) {
      const msg = e?.message || e?.cause?.message || ''
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log('SKIP:', stmt.slice(0, 60).replace(/\s+/g, ' ') + '...')
      } else {
        console.error('Failed statement:', stmt)
        throw e
      }
    }
  }
  client.close()
  console.log('Turso 建表完成')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
