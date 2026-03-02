import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'
import serverRoute from '../../core/vite-plugin-server-route'
import clientRoute from '../../core/vite-plugin-client-route'

export function getPlugins(mode: string, env: Record<string, string>, pages: string[]): PluginOption[] {
  const port = Number(env.VITE_PORT)

  const base: PluginOption[] = [
    serverRoute({ dir: 'server/routes', baseRoute: '/jaq' }),
    ...pages.map(page =>
      clientRoute({
        dir: `client/pages/${page}/routes`,
        baseRoute: page,
        exclude: [
          '**/components/*.tsx',
          '**/components/*.ts',
          '**/schema.ts',
          '**/style.ts',
          '**/*.config.tsx',
          '**/*.config.ts',
        ],
      }),
    ),
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
    build({
      entry: './app.ts',
      output: 'app.js',
      outputDir: './build',
      minify: false,
      port,
      external: ['art-template'],
    })
  ]

  return base.filter((v): v is PluginOption => Boolean(v))
}
