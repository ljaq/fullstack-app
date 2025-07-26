import { serveStatic } from '@hono/node-server/serve-static'
import dotenv from 'dotenv'
import { readFileSync, readdirSync } from 'fs'
import { Hono } from 'hono'
import { proxy } from 'hono/proxy'
import { prettyJSON } from 'hono/pretty-json'
import path from 'path'
import helloRoute from './server/routes/hello'

const isDev = import.meta.env.DEV
const isServer = import.meta.env.MODE === 'server'
dotenv.config({ path: `.env.${isServer ? process.env.mode : import.meta.env.MODE}` })

const isHttps = process.env.VITE_SSL_KEY_FILE && process.env.VITE_SSL_CRT_FILE
let pages: string[] = []
const url = `http${isHttps ? 's' : ''}://localhost:${process.env.VITE_PORT}`

const app = new Hono()

app.use(prettyJSON())

const routes = app.basePath('/jaq').route('/hello', helloRoute)

const proxyConf = await import('./proxy.ts').then(conf => conf.default)
Object.entries(proxyConf).reduce(
  (app, [api, conf]) =>
    app.all(api, c => {
      return proxy(`${conf.target}${c.req.path}`, {
        ...c.req,
        headers: {
          ...c.req.header(),
          'X-Forwarded-For': '127.0.0.1',
          'X-Forwarded-Host': c.req.header('host'),
        },
      })
    }),
  app,
)

if (isDev) {
  const regex = /(<head[\s\S]*?)(\s*<\/head>)/i
  pages = readdirSync(path.join(import.meta.dirname, './client/pages'))
  pages.reduce(
    (app, page) =>
      app.get(`/${page}/*`, async c => {
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
  app.get('/*', serveStatic({ root: '/build/public' }))
  pages = readdirSync(path.join(import.meta.dirname, './public'))
    .filter(item => item.endsWith('.html'))
    .map(item => item.replace(/\.html$/, ''))
  pages.reduce(
    (app, page) =>
      app.get(`/${page}/*`, async c => {
        const html = readFileSync(path.join(import.meta.dirname, `./public/${page}.html`), 'utf-8')

        return c.html(html)
      }),
    app,
  )
}

app.get('/', c => c.redirect('/cms')).get('/*', c => c.redirect('/404'))

export default app

export type AppType = typeof routes
