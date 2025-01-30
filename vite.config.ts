import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [
    react(),
    Pages({
      importMode: 'async',
      onRoutesGenerated(routes) {
        console.log(routes)
      },
      onClientGenerated(clientCode) {
        return clientCode
          .replace(/const (.*?) = React\.lazy\(\(\) => import\((.*?)\)\);/g, (match, pageName, comPath) => {
            return `${match}\r\nimport { pageConfig as ${pageName}meta } from ${comPath}`
          })
          .replace(/"element":React\.createElement\((.*?)\)/g, (match, pageName) => {
            return `${match}, meta: ${pageName}meta`
          })
      }
    })
  ]
})
