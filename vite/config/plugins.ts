import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'
import path from 'path'
import type { PluginOption } from 'vite'
import Page from 'vite-plugin-pages'
import { rootDir } from './env'

export function getPlugins(
  mode: string,
  env: Record<string, string>,
  pages: string[],
): PluginOption[] {
  const port = Number(env.VITE_PORT)

  const base: PluginOption[] = [
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
      handleHotUpdate() {},
    }),
    ...pages.map(page =>
      Page({
        dirs: [{ dir: `client/pages/${page}/routes`, baseRoute: `/${page}` }],
        moduleId: `~react-page-${page}`,
        importMode: 'async',
        routeStyle: 'next',
        exclude: ['**/components/*.tsx', '**/components/*.ts', '**/schema.ts', '**/style.ts', '**/*.meta.tsx', '**/*.meta.ts'],
        onClientGenerated(clientCode) {
          const code = clientCode
            .replace(
              /const (.*?) = React\.lazy\(\(\) => import\((.*?)\)\);/g,
              (match, pageName, comPath) => {
                if (comPath === 'react') return match
                const rawPath = comPath.replace(/^["']|["']$/g, '').trim()
                if (rawPath.includes('.meta.')) return match
                const relativeFromRoot = rawPath.startsWith('/')
                  ? path.relative(rootDir, rawPath)
                  : rawPath.startsWith('client/')
                    ? rawPath
                    : path.join('client/pages', page, 'routes', rawPath)
                const metaPathAbs = path.resolve(rootDir, relativeFromRoot.replace(/(\.(tsx?|jsx?))$/, '.meta$1'))
                const quote = comPath.trim().startsWith('"') ? '"' : "'"
                if (existsSync(metaPathAbs)) {
                  return `${match}\r\nimport { pageConfig as ${pageName}config } from ${quote}${path.relative(rootDir, metaPathAbs).split(path.sep).join('/')}${quote}`
                }
                return `${match}\r\nconst ${pageName}config = {}`
              },
            )
            .replace(/"element":React\.createElement\((.*?)\)/g, (_, pageName) => {
              return `meta: ${pageName}config,${_}`
            })
          return code
        },
      }),
    ),
  ]

  const honoBuildPlugin: PluginOption =
    mode === 'server'
      ? build({
          entry: './app.ts',
          output: 'app.js',
          outputDir: './build',
          minify: false,
          port,
          external: ['art-template'],
        })
      : false

  return [...base, honoBuildPlugin].filter((v): v is PluginOption => Boolean(v))
}
