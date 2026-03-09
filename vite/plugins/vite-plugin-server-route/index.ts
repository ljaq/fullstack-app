import { PluginOption, ResolvedConfig } from 'vite'
import path from 'path'
import colors from 'picocolors'
import fs from 'fs'
import { logTimeStamp, FORMAT_CONFIG } from '../utils'
import fileBaseRoutes, { IRouteItem } from '../file-base-routes'
import prettier from 'prettier'

interface IServerRouteConfig {
  dir: string
  baseRoute: string
  exclude?: string[]
}

async function writeRoutes(dir: string, baseRoute: string, routes: IRouteItem[]) {
  routes.map(item => {
    let methods = []
    const code = fs.readFileSync(item.filePath).toString()
    const match = code.matchAll(/export const (.*?) = /g)
    for (const m of match) {
      methods.push(m[1])
    }
    return {
      ...item,
      methods,
    }
  })
  const code = `
    /**
      * 此路由文件 由vite-plugin-server-route 自动生成
      * 不要修改
     */
    import { Hono } from 'hono'
    ${routes.map(route => `import * as ${route.name} from '${path.join(dir, route.relativePath)}'`).join('\n')}

    ${routes.reduce((prev, route) => {
      const methods = []
      const code = fs.readFileSync(route.filePath).toString()
      const match = code.matchAll(/export const (.*?) = /g)
      for (const m of match) {
        methods.push(m[1])
      }

      prev += methods
        .map(method => `  .${method.toLowerCase()}('${route.route}', ...${route.name}.${method})\n`)
        .join('')
      return prev
    }, `const route = new Hono()\n  .basePath('${baseRoute}')\n`)}
    export default route
  `
  const formatedCode = await prettier.format(code, FORMAT_CONFIG)
  fs.writeFileSync(path.join(process.cwd(), dir, './_route.gen.ts'), formatedCode)
}

export default function serverRoute(config: IServerRouteConfig): PluginOption {
  const { dir, baseRoute, exclude = [] } = config
  const absolureDir = path.resolve(process.cwd(), dir)
  let resolveConfig: ResolvedConfig = {} as ResolvedConfig

  return {
    name: 'vite-plugin-server-route',
    enforce: 'pre',
    configResolved(config) {
      resolveConfig = config
    },
    async buildStart() {
      if (resolveConfig.command === 'serve' || resolveConfig.mode === 'server') {
        const { flatRoutes } = fileBaseRoutes(absolureDir, exclude)
        await writeRoutes(dir, baseRoute, flatRoutes)
        console.log(`${logTimeStamp()} ${colors.bold(colors.magenta('[server-route]'))} server route generated`)
      }
    },
    // 配置开发服务器
    configureServer(server) {
      const absolureDir = path.resolve(process.cwd(), dir)

      // 监听文件变更
      server.watcher.on('change', async changedPath => {
        if (changedPath.startsWith(absolureDir) && !changedPath.endsWith('_route.gen.ts')) {
          const { flatRoutes } = fileBaseRoutes(absolureDir, exclude)
          await writeRoutes(dir, baseRoute, flatRoutes)
          server.ws.send({
            type: 'custom',
            event: 'server-route-updated',
            data: { timestamp: Date.now() },
          })
          const updateRoute = flatRoutes.find(item => item.filePath === changedPath)
          const filePath = updateRoute.filePath.replace(process.cwd(), '')
          console.log(
            `${logTimeStamp()} ${colors.bold(colors.magenta('[server-route]'))} ${colors.green('server route updated')} ${colors.dim(filePath)}`,
          )
        }
      })
    },
  }
}
