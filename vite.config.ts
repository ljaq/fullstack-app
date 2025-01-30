import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import pages from 'vite-plugin-pages'

export default defineConfig({
  build: {
    outDir: './dist/public',
  },
  resolve: {
    alias: {
      '@/client': './client',
      '@/server': './server',
      '@/utils': './utils',
      '@/types': './types',
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
})
