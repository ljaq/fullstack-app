import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'
import {
  envKeysSafeForImportMetaDefine,
  getClientBuildConfig,
  getEnv,
  getPageDirs,
  getPlugins,
  getServerBuildConfig,
  getServerConfig,
  getSharedResolve,
} from './vite/config'
import { VITE_PUBLIC_RUNTIME_KEYS } from './utils/public-runtime-env'

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
  const noBuildTimeDefineKeys = new Set<string>(VITE_PUBLIC_RUNTIME_KEYS)

  return {
    server: getServerConfig(env),
    build: isClientBuild ? getClientBuildConfig(pages) : getServerBuildConfig(),
    resolve: {
      ...getSharedResolve(),
      /** TypeORM metadata is keyed by constructor/schema identity; duplicate bundled copies cause EntityMetadataNotFoundError in dev SSR */
      dedupe: ['typeorm'],
    },
    ssr: {
      external: ['typeorm', 'better-sqlite3'],
    },
    environments: {
      ssr: {
        keepProcessEnv: true,
      },
    },
    define: {
      ...envKeysSafeForImportMetaDefine(env)
        .filter(key => !noBuildTimeDefineKeys.has(key))
        .reduce<Record<string, string>>((acc, key) => {
          acc[`import.meta.env.${key}`] = JSON.stringify(env[key])
          return acc
        }, {}),
    },
    plugins: [...getPlugins(mode, env, pages), ssrTargetNodePlugin()],
  }
})
