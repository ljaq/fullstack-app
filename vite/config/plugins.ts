import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import react from '@vitejs/plugin-react'
import type { PluginOption } from 'vite'
import serverRoute from '../plugins/vite-plugin-server-route'
import apiDevSnapshot from '../plugins/vite-plugin-api-dev-snapshot'
import clientRoute from '../plugins/vite-plugin-client-route'
import skeletonTransform from '../plugins/vite-plugin-skeleton/index'
import { isHttps } from './env'

export function getPlugins(mode: string, env: Record<string, string>, pages: string[]): PluginOption[] {
  const port = Number(env.VITE_PORT)
  const apiSnapshotPluginEnabled = env.VITE_API_DEV_SNAPSHOT !== '0' && env.VITE_API_DEV_SNAPSHOT !== 'false'

  const base: PluginOption[] = [
    serverRoute({
      dir: 'server/routes',
      baseRoute: '/jaq',
      exclude: ['**/*.snapshot.ts', '**/*.service.ts', '**/*.schema.ts'],
    }),
    apiDevSnapshot({
      dir: 'server/routes',
      baseRoute: '/jaq',
      port,
      exclude: ['**/*.snapshot.ts', '**/*.service.ts', '**/*.schema.ts'],
      enabled: apiSnapshotPluginEnabled,
      https: isHttps(env),
    }),
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
    skeletonTransform(),
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
      minify: true,
      port,
      external: ['art-template'],
    })
  ]

  return base.filter((v): v is PluginOption => Boolean(v))
}
