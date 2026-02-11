import path from 'path'
import type { AliasOptions, ResolveOptions } from 'vite'
import { rootDir } from './env'

export function getSharedResolve(): ResolveOptions & { alias: AliasOptions } {
  return {
    alias: {
      api: path.resolve(rootDir, './api'),
      client: path.resolve(rootDir, './client'),
      server: path.resolve(rootDir, './server'),
      utils: path.resolve(rootDir, './utils'),
      types: path.resolve(rootDir, './types'),
    },
  }
}
