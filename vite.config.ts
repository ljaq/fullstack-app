import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import pages from 'vite-plugin-pages'
import { readFileSync } from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
  const isHttps = process.env.VITE_SSL_KEY_FILE && process.env.VITE_SSL_CRT_FILE
  return {
    build: {
      outDir: './dist/public',
    },
    server: isHttps
      ? {
          https: {
            key: readFileSync(path.resolve(__dirname, process.env.VITE_SSL_KEY_FILE || '')),
            cert: readFileSync(path.resolve(__dirname, process.env.VITE_SSL_CRT_FILE || '')),
          },
        }
      : undefined,
    resolve: {
      alias: {
        client: path.resolve(__dirname, './client'),
        server: path.resolve(__dirname, './server'),
        utils: path.resolve(__dirname, './utils'),
        types: path.resolve(__dirname, './types'),
      },
    },
    plugins: [
      react(),
      pages({
        dirs: 'client/pages',
        importMode: 'async',
        onClientGenerated(clientCode) {
          return clientCode
            .replace(/const (.*?) = React\.lazy\(\(\) => import\((.*?)\)\);/g, (match, pageName, comPath) => {
              return `${match}\r\nimport { pageConfig as ${pageName}meta } from ${comPath}`
            })
            .replace(/"element":React\.createElement\((.*?)\)/g, (match, pageName) => {
              return `${match}, meta: ${pageName}meta`
            })
        },
      }),
    ],
  }
})
