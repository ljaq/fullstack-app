import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import {
  getClientBuildConfig,
  getEnv,
  getPageDirs,
  getPlugins,
  getServerBuildConfig,
  getServerConfig,
  getSharedResolve,
} from './vite/config'

/** `@hono/vite-build` sets `ssr.target: 'webworker'`, which makes Rolldown emit `__require("buffer")` for CJS deps while Node builtins stay external — ESM has no `require`. Force Node for `node build/app.js`. */
function ssrTargetNodePlugin(): PluginOption {
  return {
    name: 'ssr-target-node',
    enforce: 'post',
    config: () => ({
      ssr: {
        target: 'node',
      },
    }),
  }
}

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build'
  const env = getEnv(isBuild ? 'build' : 'serve', mode)
  const pages = getPageDirs()

  const isClientBuild = mode === 'client'

  return {
    server: getServerConfig(env),
    build: isClientBuild ? getClientBuildConfig(pages) : getServerBuildConfig(),
    resolve: getSharedResolve(),
    environments: {
      ssr: {
        keepProcessEnv: true,
      },
    },
    define: {
      ...Object.keys(env).reduce((acc, key) => {
        acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
        return acc
      }, {}),
    },
    plugins: [...getPlugins(mode, env, pages), ssrTargetNodePlugin()],
  }
})
