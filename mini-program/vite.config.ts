import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, resolve(__dirname, '..'), 'VITE_')
  return {
  plugins: [uni()],
  resolve: {
    alias: {
      // 须先于 `api` 目录别名，保证与 Web 相同的 AppType / request 推断
      // 'api/app-type': resolve(__dirname, '../api/app-type.ts'),
      // 'api/adapters': resolve(__dirname, 'src/adapters.ts'),
      'api': resolve(__dirname, '../api'),
      'types': resolve(__dirname, '../types'),
      'utils': resolve(__dirname, '../utils'),
      'server': resolve(__dirname, '../server'),
    },
  },
  build: {
    // 不在此 external antd：external 会留下 require('antd')，微信运行时无法解析。
    // Web 适配器已通过 import 'api/adapters' + 别名与小程序隔离，不应再引入 antd。
  },
  define: {
    /** 与仓库根目录 `.env.*` 对齐（主包逻辑）；预打包的 mini-adapter 在同名变量上由 esbuild 内联 */
    'import.meta.env.VITE_MINI_API_ORIGIN': JSON.stringify(rootEnv.VITE_MINI_API_ORIGIN ?? ''),
  },
  server: {
    port: 3607,
    proxy: {
      '/jaq': {
        target: 'http://localhost:3606',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3606',
        changeOrigin: true,
      },
    },
  },
  }
})
