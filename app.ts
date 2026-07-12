import { serveStatic } from '@hono/node-server/serve-static'
import dotenv from 'dotenv'
import { readFileSync, readdirSync } from 'fs'
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
import { prettyJSON } from 'hono/pretty-json'
import path from 'path'
import qs from 'querystring'
import { compileHtml } from './scripts/compileHtml.js'
import { injectPublicRuntimeEnv } from 'utils/public-runtime-env'
import { verifyRequestSignature } from 'server/middleware/verify-request-signature'
import { appOnError } from 'server/errors/error-handler'
import route from 'server/routes/_route.gen'

const isDev = import.meta.env.DEV
const isServer = import.meta.env.MODE === 'server'
const mode = isServer ? process.env.mode : import.meta.env.MODE
dotenv.config({ path: `.env.${mode}` })
dotenv.config({ path: '.env.local', override: true })

const CACHE_HTML = 'no-cache'
const CACHE_STATIC = 'public, max-age=31536000, immutable'
let pages: string[] = []
const app = new Hono()

// 路由/中间件抛错由 Hono compose 接住并调用 app.onError；外层 app.use try/catch 拿不到这类异常
app.onError(appOnError)

app.use(prettyJSON())
app.use(verifyRequestSignature)

app.route('/', route)

const proxyConf = {
  '/api/*': {
    target: process.env.VITE_THIRD_API,
    changeOrigin: true,
  },
}
Object.entries(proxyConf).reduce(
  (app, [api, conf]) =>
    app.all(api, async ctx => {
      try {
        const query = ctx.req.query()
        const url = `${conf.target}${ctx.req.path}?${qs.stringify(query)}`

        const method = ctx.req.method
        const headers = ctx.req.header()

        let body: any = null
        if (method !== 'GET' && method !== 'HEAD') {
          body = await ctx.req.raw.clone().text()
        }

        const response = await proxy(url, {
          method,
          headers,
          body: body || undefined,
        })
        return response
      } catch (error) {
        return ctx.json({ code: 500, message: '服务异常，请稍后再试' }, 500)
      }
    }),
  app,
)

const projectRoot = path.join(import.meta.dirname, isDev ? '.' : '..')

if (isDev) {
  pages = readdirSync(path.join(import.meta.dirname, 'client/pages'))
  pages.reduce(
    (app, page) =>
      app.get(`/${page}/*`, async c => {
        const htmlPath = path.join(projectRoot, 'client/pages', page, 'index.html')
        const compiled = compileHtml(readFileSync(htmlPath, 'utf-8'), { ...process.env })
        return c.html(injectPublicRuntimeEnv(compiled, process.env))
      }),
    app,
  )
} else {
  app.get(
    '/*',
    serveStatic({
      root: 'build/public',
      onFound: (filePath, c) => {
        c.header('Cache-Control', filePath.endsWith('.html') ? CACHE_HTML : CACHE_STATIC)
      },
    }),
  )
  pages = readdirSync(path.join(import.meta.dirname, 'public'))
    .filter(item => item.endsWith('.html'))
    .map(item => item.replace(/\.html$/, ''))
  pages.reduce(
    (app, page) =>
      app.get(`/${page}/*`, async c => {
        const htmlPath = path.join(projectRoot, 'build/public', `${page}.html`)
        c.header('Cache-Control', CACHE_HTML)
        return c.html(injectPublicRuntimeEnv(readFileSync(htmlPath, 'utf-8'), process.env))
      }),
    app,
  )
}

app.get('/', c => c.redirect('/cms')).get('/*', c => c.redirect('/404'))

export default app

export type { AppType } from './api/app-type'
