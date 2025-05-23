// require('module-alias/register')
// require('dotenv').config({ path: `.env.${process.env.MODE}`, override: true })

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import proxy from './proxy'

const isDev = import.meta.env.MODE === 'development'
const isHttps = process.env.VITE_SSL_KEY_FILE && process.env.VITE_SSL_CRT_FILE
let pages: string[] = []
const app = new Hono()
const url = `http${isHttps ? 's' : ''}://localhost:${import.meta.env.VITE_PORT}`

Object.entries(proxy).reduce((app, [api, conf]) => app.use(api, cors({ origin: conf.target! })), app)

if (isDev) {
  const regex = /(<head[\s\S]*?)(\s*<\/head>)/i
  pages = readdirSync(path.join(import.meta.dirname, './client/pages'))
  pages.reduce(
    (app, page) =>
      app.use(`/${page}/*`, async c => {
        const html = readFileSync(path.join(import.meta.dirname, `./client/pages/${page}/index.html`), 'utf-8')
        const newHtml = html.replace(
          regex,
          `$1
            <script type="module">
              import RefreshRuntime from '${url}/@react-refresh'
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => type => type
              window.__vite_plugin_react_preamble_installed__ = true
            </script>
          $2`,
        )

        return c.html(newHtml)
      }),
    app,
  )
} else {
  app.use('/*', serveStatic({ root: '/build/public' }))
  pages = readdirSync(path.join(import.meta.dirname, './public'))
    .filter(item => item.endsWith('.html'))
    .map(item => item.replace(/\.html$/, ''))
  pages.reduce(
    (app, page) =>
      app.use(`/${page}/*`, async c => {
        const html = readFileSync(path.join(import.meta.dirname, `./public/${page}.html`), 'utf-8')

        return c.html(html)
      }),
    app,
  )
}

export default app
