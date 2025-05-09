require('module-alias/register')
require('dotenv').config({ path: `.env.${process.env.MODE}`, override: true })

import chalk from 'chalk'
import { DarukServer } from 'daruk'
import { readFileSync, readdirSync } from 'fs'
import { createProxyMiddleware } from 'http-proxy-middleware'
import https from 'https'
import k2c from 'koa-connect'
import koaStatic from 'koa-static'
import historyApiFallback from 'koa2-connect-history-api-fallback'
import path from 'path'
import proxy from './proxy'

const isDev = process.env.MODE === 'dev'
const PORT = process.env.PORT
const isHttps = process.env.VITE_SSL_KEY_FILE && process.env.VITE_SSL_CRT_FILE

async function createServer() {
  const darukServer = DarukServer({
    notFound(ctx) {
      ctx.body = '404 notFound'
    },
    loggerOptions: {
      disable: true,
    },
    bodyOptions: {
      multipart: true,
      formidable: {
        // 上传目录
        uploadDir: __dirname,
        // 保留文件扩展名
        keepExtensions: true,
      },
    },
    errorOptions: {
      all(err, ctx) {
        ctx.body = err.message
      },
    },
  })

  try {
    await darukServer.loadFile('./server/services')
    await darukServer.loadFile('./server/controllers')
    await darukServer.loadFile('./server/middlewares')
  } catch (e) {
    //
  }

  await darukServer.binding()

  if (isDev) {
    const vite = await (await import('vite')).createServer({ server: { middlewareMode: true } })
    darukServer.app.use(koaStatic(path.join(__dirname, './public'), {}) as any).use(k2c(vite.middlewares))
    require('./scripts/generateServerApi')
  } else {
    const pages = readdirSync(path.join(__dirname, './public/client/pages'))
    darukServer.app
      .use(
        historyApiFallback({
          whiteList: ['/api', '/coze', '/assets'],
          index: 'index.html',
          htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
          disableDotRule: false,
          rewrites: pages.map(page => ({ from: `^/${page}`, to: `/client/pages/${page}/index.html` })),
        }),
      )
      .use(koaStatic(path.join(__dirname, './public'), { maxAge: 2592000 }) as any)
  }

  Object.entries(proxy).reduce(
    (app, [api, conf]) => app.use(k2c(createProxyMiddleware(api, conf) as any)),
    darukServer.app,
  )
  if (isHttps) {
    const options = {
      key: readFileSync(process.env.VITE_SSL_KEY_FILE!),
      cert: readFileSync(process.env.VITE_SSL_CRT_FILE!),
    }
    ;(darukServer.app as any).httpServer = https.createServer(options, darukServer.app.callback()).listen(PORT)
    darukServer.emit('serverReady')
  } else {
    darukServer.app.listen(PORT)
  }

  console.log(chalk.green(`[✓] running at http${isHttps ? 's' : ''}://localhost:${PORT}`))
}

createServer()
