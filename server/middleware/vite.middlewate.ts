import { Middleware, IMiddleware } from '@midwayjs/core'
import { NextFunction, Context } from '@midwayjs/koa'
import { ViteDevServer } from 'vite'
import k2c from 'koa-connect'

@Middleware()
export class ViteMiddleware implements IMiddleware<Context, NextFunction> {
  server: ViteDevServer | null = null
  async getViteServer() {
    if (!this.server) {
      const { createServer } = await import('vite')
      this.server = await createServer({
        server: { middlewareMode: true }
      })
    }
    return this.server!
  }
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const viteServer = await this.getViteServer()
      await k2c(viteServer.middlewares)(ctx as any, next)
    }
  }

  ignore(ctx: Context): boolean {
    return ctx.path.startsWith('/api')
  }

  static getName(): string {
    return 'vite'
  }
}
