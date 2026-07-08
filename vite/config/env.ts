import { readdirSync } from 'fs'
import path from 'path'
import { loadEnv } from 'vite'

export const rootDir = process.cwd()

export type Command = 'build' | 'serve'

export function getEnv(command: Command, mode: string): Record<string, string> {
  const loadMode = command === 'build' ? 'production' : mode
  return loadEnv(loadMode, rootDir, '')
}

/**
 * `define['import.meta.env.KEY']` 的 KEY 必须是合法标识符。空前缀 `loadEnv` 会带上进程环境，
 * Linux/Bash 下常见 `BASH_FUNC_which%%` 等键会导致 Rolldown 报 INVALID_DEFINE_CONFIG。
 */
export function envKeysSafeForImportMetaDefine(env: Record<string, string>): string[] {
  return Object.keys(env).filter(k => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k))
}

export function isHttps(env: Record<string, string>): boolean {
  return !!(env.VITE_SSL_KEY_FILE && env.VITE_SSL_CRT_FILE)
}

/** 多页应用：client/pages 下每个目录为一页 */
export function getPageDirs(): string[] {
  return readdirSync(path.resolve(rootDir, 'client/pages'))
}
