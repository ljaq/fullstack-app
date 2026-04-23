import { defineConfig, loadEnv } from 'vite'
import type { UserConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import uniLayouts from '@uni-helper/vite-plugin-uni-layouts'
import uniPages from '@uni-helper/vite-plugin-uni-pages'
import { resolve } from 'path'

export default defineConfig(({ mode }): UserConfig => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), 'VITE_')
  return {
    plugins: [uniLayouts(), uniPages(), uni()] as UserConfig['plugins'],
    resolve: {
      alias: {
        api: resolve(__dirname, '../api'),
        types: resolve(__dirname, '../types'),
        utils: resolve(__dirname, '../utils'),
        server: resolve(__dirname, '../server'),
        storages: resolve(__dirname, '../client/storages'),
        hooks: resolve(__dirname, 'src/hooks'),
        stores: resolve(__dirname, 'src/stores'),
        components: resolve(__dirname, 'src/components'),
      },
    },
    define: {
      ...Object.keys(rootEnv).reduce((acc, key) => {
        acc[`import.meta.env.${key}`] = JSON.stringify(rootEnv[key])
        return acc
      }, {}),
    },
  }
})
