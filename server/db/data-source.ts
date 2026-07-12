import 'reflect-metadata'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { DataSourceOptions } from 'typeorm'
import { DataSource } from 'typeorm'
import { entities } from './entities'

const isProd = process.env.mode === 'production' || process.env.NODE_ENV === 'production'
const database = isProd ? 'prod.db' : 'dev.db'

/** 仓库根路径下的 SQLite 文件绝对路径（与 `getDataSource` 一致） */
export function resolveSqliteDatabasePath(): string {
  return path.resolve(process.cwd(), database)
}

/** 从项目根解析原生模块，避免 pnpm 嵌套下 TypeORM 内置 require 找不到 better-sqlite3 */
function loadBetterSqlite3Driver() {
  const rootPkg = path.resolve(import.meta.dirname, '..', '..', 'package.json')
  try {
    return createRequire(rootPkg)('better-sqlite3')
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    throw new Error(
      `无法加载 better-sqlite3：${detail}。请在项目根执行 pnpm install（勿加 --ignore-scripts），必要时 pnpm rebuild better-sqlite3。`,
    )
  }
}

let dataSource: DataSource | null = null
let initializing: Promise<DataSource> | null = null

export async function getDataSource() {
  if (dataSource?.isInitialized) return dataSource
  if (initializing) return initializing

  const dbPath = path.resolve(process.cwd(), database)

  const options: DataSourceOptions = {
    type: 'better-sqlite3',
    database: dbPath,
    driver: loadBetterSqlite3Driver(),
    entities,
    synchronize: true,
    logging: false,
  }

  initializing = (async () => {
    dataSource = new DataSource(options)
    await dataSource.initialize()
    return dataSource
  })()
  try {
    return await initializing
  } finally {
    initializing = null
  }
}
