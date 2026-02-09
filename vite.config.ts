import { defineConfig } from 'vite'
import {
  getClientBuildConfig,
  getEnv,
  getPageDirs,
  getPlugins,
  getServerBuildConfig,
  getServerConfig,
  getSharedResolve,
} from './vite/config'

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
    plugins: getPlugins(mode, env, pages),
  }
})
