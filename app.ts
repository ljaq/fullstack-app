import { serveStatic } from '@hono/node-server/serve-static'
import dotenv from 'dotenv'
import { readFileSync, readdirSync } from 'fs'
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
import { prettyJSON } from 'hono/pretty-json'
import path from 'path'
import qs from 'querystring'
import { compileHtml } from './scripts/compileHtml.js'
import { verifyRequestSignature } from 'server/middleware/verify-request-signature'
import { errorHandler } from 'server/errors/error-handler'
import { registerServices } from 'server/container/register-services'
import route from 'server/routes/_route.gen'

const isDev = import.meta.env.DEV
const isServer = import.meta.env.MODE === 'server'
dotenv.config({ path: `.env.${isServer ? process.env.mode : import.meta.env.MODE}` })

const isHttps = process.env.VITE_SSL_KEY_FILE && process.env.VITE_SSL_CRT_FILE
let pages: string[] = []
const app = new Hono()

// 注册服务容器
registerServices()

// 全局错误处理
app.use('*', errorHandler)

app.use(prettyJSON())
app.use(verifyRequestSignature)

const routes = app.route('/', route)

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
        return c.html(compileHtml(readFileSync(htmlPath, 'utf-8'), { ...process.env }))
      }),
    app,
  )
} else {
  app.get('/*', serveStatic({ root: 'build/public' }))
  pages = readdirSync(path.join(import.meta.dirname, 'public'))
    .filter(item => item.endsWith('.html'))
    .map(item => item.replace(/\.html$/, ''))
  pages.reduce(
    (app, page) =>
      app.get(`/${page}/*`, async c => {
        const htmlPath = path.join(projectRoot, 'build/public', `${page}.html`)
        return c.html(readFileSync(htmlPath, 'utf-8'))
      }),
    app,
  )
}

app.get('/', c => c.redirect('/cms')).get('/*', c => c.redirect('/404'))

export default app

export type { AppType } from './api/app-type'
