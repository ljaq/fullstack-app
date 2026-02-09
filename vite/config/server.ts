import type { ServerOptions } from 'vite'

export function getServerConfig(env: Record<string, string>): ServerOptions {
  return {
    port: Number(env.VITE_PORT),
    hmr: { overlay: false },
  }
}
