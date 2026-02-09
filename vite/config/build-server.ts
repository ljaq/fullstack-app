import type { BuildOptions } from 'vite'

export function getServerBuildConfig(): BuildOptions {
  return {
    copyPublicDir: false,
  }
}
