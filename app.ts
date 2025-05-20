require('module-alias/register')
require('dotenv').config({ path: `.env.${process.env.MODE}`, override: true })

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'
import { serve, type HttpBindings } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import chalk from 'chalk'
import { readFileSync, readdirSync, readFile } from 'fs'
import path from 'path'
import proxy from './proxy'

const isDev = process.env.MODE === 'dev'
const PORT = process.env.PORT
const isHttps = process.env.VITE_SSL_KEY_FILE && process.env.VITE_SSL_CRT_FILE
let pages: string[] = []
const app = new Hono()

async function createServer() {
  Object.entries(proxy).reduce((app, [api, conf]) => app.use(api, cors({ origin: conf.target! })), app)

  if (isDev) {
    /** 开发模式使用vite代理 */
    const vite = await (await import('vite')).createServer({ server: { middlewareMode: true } })
    pages = (vite.config as any).pages
    app.all(
      '/*',
      createMiddleware<{ Bindings: HttpBindings }>(
        (ctx, next) =>
          new Promise(resolve => vite.middlewares(ctx.env.incoming, ctx.env.outgoing, () => resolve(next()))),
      ),
    )
  } else {
    /** 生产模式 代理静态资源 & 重定向html */
    app.use('/*', serveStatic({ root: '/build/public' }))
    pages = readdirSync(path.join(__dirname, './public'))
      .filter(item => item.endsWith('.html'))
      .map(item => item.replace(/\.html$/, ''))
    pages.reduce(
      (app, page) =>
        app.use(`/${page}/*`, async c => {
          return c.html(readFileSync(path.join(__dirname, `./public/${page}.html`), 'utf-8'))
        }),
      app,
    )
  }

  serve(
    {
      fetch: app.fetch,
      port: Number(PORT),
    },
    info => {      
      const url = `http${isHttps ? 's' : ''}://localhost:${info.port}`
      console.log(chalk.green(`[✓] running at ${url}`))
      pages.map(page => console.log(chalk.magenta(`[⌘] register page ${url}/${page}`)))
    },
  )
}

createServer()
