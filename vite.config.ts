import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { defineConfig, loadEnv, ServerOptions } from 'vite'
import Page from 'vite-plugin-pages'
import proxy from './proxy'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(command === 'build' ? 'production' : mode, process.cwd(), '')
  const isHttps = env.VITE_SSL_KEY_FILE && env.VITE_SSL_CRT_FILE
  const pages = readdirSync(path.resolve(__dirname, 'client/pages'))

  const server: ServerOptions = {
    port: Number(env.VITE_PORT),
    proxy,
  }

  if (isHttps) {
    server.https = {
      key: readFileSync(process.env.VITE_SSL_KEY_FILE),
      cert: readFileSync(process.env.VITE_SSL_CRT_FILE),
    }
  }

  return {
    server,
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
