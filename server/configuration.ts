import { Configuration, App } from '@midwayjs/core'
import * as koa from '@midwayjs/koa'
import * as validate from '@midwayjs/validate'
import * as info from '@midwayjs/info'
import { join } from 'path'
// import k2c from 'koa-connect'
import { DefaultErrorFilter } from './filter/default.filter'
import { NotFoundFilter } from './filter/notfound.filter'
import { ReportMiddleware } from './middleware/report.middleware'
import { ViteMiddleware } from './middleware/vite.middlewate'
import { PageConfig } from './types'

const page: PageConfig = {
  name: 'Midway Vite React',
  icon: 'https://img.alicdn.com/imgextra/i4/O1CN01KX5Rfv1Z5kq5KYqyH_!!6000000001499-2-tps-64-64.png'
}

console.log(page)

@Configuration({
  imports: [
    koa,
    validate,
    {
      component: info,
      enabledEnvironment: ['local']
    }
  ],
  importConfigs: [join(__dirname, './config')]
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application

  async onReady() {
    // add middleware
    // const { createServer } = await import('vite')
    // const viteServer = await createServer({
    //   server: { middlewareMode: true }
    // })
    this.app.useMiddleware([ReportMiddleware, ViteMiddleware])
    // this.app.useMiddleware([k2c(viteServer.middlewares)] as any)
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter])
  }
}
