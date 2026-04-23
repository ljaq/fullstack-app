import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), 'VITE_')
  return {
    plugins: [uni()],
    resolve: {
      alias: {
        api: resolve(__dirname, '../api'),
        types: resolve(__dirname, '../types'),
        utils: resolve(__dirname, '../utils'),
        server: resolve(__dirname, '../server'),
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
