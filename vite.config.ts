import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { defineConfig, ServerOptions, loadEnv } from 'vite'
import Page from 'vite-plugin-pages'
import devServer from '@hono/vite-dev-server'
import proxy from './proxy'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isHttps = env.VITE_SSL_KEY_FILE && env.VITE_SSL_CRT_FILE
  const pages = readdirSync(path.resolve(__dirname, 'client/pages'))  

  console.log('mode', mode);
  

  const server: ServerOptions = {
    port: Number(env.VITE_PORT),
    proxy: pages.reduce(
      (acc, page) => {
        acc[`/${page}`] = {
          target: `http${isHttps ? 's' : ''}://localhost:${process.env.PORT}`,
          changeOrigin: true,
          rewrite: () => `/client/pages/${page}/index.html`,
        }
        return acc
      },
      { ...proxy },
    ),
  }

  if (isHttps) {
    server.https = {
      key: readFileSync(process.env.VITE_SSL_KEY_FILE),
      cert: readFileSync(process.env.VITE_SSL_CRT_FILE),
    }
  }

  return {
    pages,
    server,
    build: {
      outDir: './build/public',
      rollupOptions: {
        input: pages.reduce((acc, page) => {
          acc[page] = path.resolve(__dirname, `./client/pages/${page}/index.html`)
          return acc
        }, {}),
        output: {
          assetFileNames: 'assets/[name]-[hash].[ext]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          compact: true,
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        client: path.resolve(__dirname, './client'),
        server: path.resolve(__dirname, './server'),
        utils: path.resolve(__dirname, './utils'),
        types: path.resolve(__dirname, './types'),
      },
    },
    plugins: [
      react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
      devServer({
        entry: './app.ts',
        injectClientScript: true,
        exclude: [
          /.*\.css$/,
          /.*\.less$/,
          /.*\.ts$/,
          /.*\.tsx$/,
          /.*\.png$/,
          /^\/@.+$/,
          /\?t\=\d+$/,
          /^\/favicon\.ico$/,
          /^\/static\/.+/,
          /^\/node_modules\/.*/,
        ],
        ignoreWatching: [/\.wrangler/],
        // handleHotUpdate: ({ server, modules }) => {
        //   const isSSR = modules.some(mod => mod._ssrModule)
        //   if (isSSR) {
        //     server.hot.send({ type: 'full-reload' })
        //     return []
        //   }
        // },
      }),
      ...pages.map(page =>
        Page({
          dirs: [{ dir: `client/pages/${page}/routes`, baseRoute: `/${page}` }],
          moduleId: `~react-page-${page}`,
          importMode: 'sync',
          
          onClientGenerated(clientCode) {
            return (
              clientCode
                // /const (.*?) = React\.lazy\(\(\) => import\((.*?)\)\);/g
                .replace(/import (.*?) from (.*?);/g, (match, pageName, comPath) => {
                  if (comPath === 'react') return match
                  return `${match}\r\nimport { pageConfig as ${pageName}meta } from ${comPath}`
                })
                .replace(/"element":React\.createElement\((.*?)\)/g, (match, pageName) => {
                  return `${match}, meta: ${pageName}meta`
                })
            )
          },
        }),
      ),
    ],
  }
})
