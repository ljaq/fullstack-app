import { readdirSync } from 'fs'
import path from 'path'
import { loadEnv } from 'vite'

export const rootDir = process.cwd()

export type Command = 'build' | 'serve'

export function getEnv(command: Command, mode: string): Record<string, string> {
  const loadMode = command === 'build' ? 'production' : mode
  return loadEnv(loadMode, rootDir, '')
}

export function isHttps(env: Record<string, string>): boolean {
  return !!(env.VITE_SSL_KEY_FILE && env.VITE_SSL_CRT_FILE)
}

/** 多页应用：client/pages 下每个目录为一页 */
export function getPageDirs(): string[] {
  return readdirSync(path.resolve(rootDir, 'client/pages'))
}
