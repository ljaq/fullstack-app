import path from 'path'
import type { BuildOptions } from 'vite'
import { rootDir } from './env'

export function getClientBuildConfig(pages: string[]): BuildOptions {
  return {
    outDir: './build/public',
    rollupOptions: {
      input: pages.reduce<Record<string, string>>((acc, page) => {
        acc[page] = path.resolve(rootDir, `./client/pages/${page}/index.html`)
        return acc
      }, {}),
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('docx-preview')) return 'vendor-docx-preview'
            if (id.includes('canvas-datagrid')) return 'vendor-canvas-datagrid'
            if (id.includes('xlsx')) return 'vendor-xlsx'
            if (id.includes('echarts')) return 'vendor-echarts'
            if (id.includes('/react-router/') || id.includes('/react-router-dom/')) return 'vendor-react-router'
            if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react'
            if (id.includes('/@tanstack/react-query/')) return 'vendor-react-query'
          }
          return null
        },
        assetFileNames(assetsInfo) {
          if (assetsInfo.names[0]?.endsWith('.css')) {
            return 'css/[name]-[hash].css'
          }
          const fontExts = ['.ttf', '.otf', '.woff', '.woff2', '.eot']
          if (fontExts.some(ext => assetsInfo.names[0]?.endsWith(ext))) {
            return 'font/[name]-[hash].[ext]'
          }
          const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.icon']
          if (imgExts.some(ext => assetsInfo.names[0]?.endsWith(ext))) {
            return 'img/[name]-[hash].[ext]'
          }
          const imgSvg = ['.svg']
          if (imgSvg.some(ext => assetsInfo.names[0]?.endsWith(ext))) {
            return 'assest/icons/[name].[ext]'
          }
          const videoExts = ['.mp4', '.avi', '.wmv', '.ram', '.mpg', 'mpeg']
          if (videoExts.some(ext => assetsInfo.names[0]?.endsWith(ext))) {
            return 'video/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
  }
}
