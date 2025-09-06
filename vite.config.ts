import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import { readdirSync } from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import Page from 'vite-plugin-pages'
import app from './app'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(command === 'build' ? 'production' : mode, process.cwd(), '')
  const isHttps = env.VITE_SSL_KEY_FILE && env.VITE_SSL_CRT_FILE
  const pages = readdirSync(path.resolve(__dirname, 'client/pages'))

  return {
    server: {
      port: Number(env.VITE_PORT),
      hmr: { overlay: false },
    },
    build:
      mode === 'client'
        ? {
            outDir: './build/public',
            rollupOptions: {
              input: pages.reduce((acc, page) => {
                acc[page] = path.resolve(__dirname, `./client/pages/${page}/index.html`)
                return acc
              }, {}),
              output: {
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
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
        : { copyPublicDir: false },
    resolve: {
      alias: {
        client: path.resolve(__dirname, './client'),
        server: path.resolve(__dirname, './server'),
        utils: path.resolve(__dirname, './utils'),
        types: path.resolve(__dirname, './types'),
      },
    },
    environments: {
      ssr: {
        keepProcessEnv: true,
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
          /.*\.ttf$/,
          /^\/@.+$/,
          /\?t\=\d+$/,
          /^\/favicon\.ico$/,
          /^\/static\/.+/,
          /^\/node_modules\/.*/,
          /\?import$/,
        ],
        ignoreWatching: [],
        handleHotUpdate(ctx) {},
      }),
      ...pages.map(page =>
        Page({
          dirs: [{ dir: `client/pages/${page}/routes`, baseRoute: `/${page}` }],
          moduleId: `~react-page-${page}`,
          importMode: 'sync',
          routeStyle: 'next',
          exclude: ['**/components/*.tsx', '**/components/*.ts', '**/schema.ts', '**/style.ts'],
          onClientGenerated(clientCode) {
            const routeCode = clientCode.replace(/"element":React\.createElement\((.*?)\)/g, (_, pageName) => {
              return `meta: ${pageName}.pageConfig,${_}`
            })
            return routeCode
          },
        }),
      ),
      mode === 'server' &&
        build({
          entry: './app.ts',
          output: 'app.js',
          outputDir: './build',
          minify: false,
          port: Number(env.VITE_PORT),
        }),
    ].filter(v => v),
  }
})
