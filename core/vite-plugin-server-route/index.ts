import { PluginOption } from 'vite'
import path from 'path'
import colors from 'picocolors'
import fs from 'fs'
import dayjs from 'dayjs'
import fileBaseRoutes, { IRouteItem } from '../file-base-routes'

interface IServerRouteConfig {
  dir: string
  baseRoute: string
  exclude?: string[]
}

const logTimeStamp = () => colors.dim(dayjs().format('h:mm:ss A'))

function writeRoutes(dir: string, baseRoute: string, routes: IRouteItem[]) {
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
  const code = `/**
 * 此路由文件 由vite-plugin-server-route 自动生成
 * 不要修改
 */
import { Hono } from 'hono'
${routes.map(route => `import * as ${route.name} from "${route.filePath}"`).join('\n')}

${routes.reduce((prev, route) => {
  const methods = []
  const code = fs.readFileSync(route.filePath).toString()
  const match = code.matchAll(/export const (.*?) = /g)
  for (const m of match) {
    methods.push(m[1])
  }

  prev += methods.map(method => `  .${method.toLowerCase()}('${route.route}', ...${route.name}.${method})\n`).join('')
  return prev
}, `const route = new Hono()\n  .basePath('${baseRoute}')\n`)}
export default route
`
  fs.writeFileSync(path.join(dir, './_route.gen.ts'), code)
}

export default function serverRoute(config: IServerRouteConfig): PluginOption {
  const { dir, baseRoute, exclude = [] } = config
  const absolureDir = path.resolve(process.cwd(), dir)
  return {
    name: 'vite-plugin-server-route',
    enforce: 'pre',
    configResolved(config) {},
    async buildStart() {
      const { flatRoutes } = fileBaseRoutes(absolureDir, exclude)
      writeRoutes(absolureDir, baseRoute, flatRoutes)
      console.log(`${logTimeStamp()} ${colors.bold(colors.blue('[server-route]'))} server route generated`)
    },
    // 配置开发服务器
    configureServer(server) {
      const absolureDir = path.resolve(process.cwd(), dir)

      // 监听文件变更
      server.watcher.on('change', async changedPath => {
        if (changedPath.startsWith(absolureDir) && !changedPath.endsWith('_route.gen.ts')) {
          const { flatRoutes } = fileBaseRoutes(absolureDir, exclude)
          writeRoutes(absolureDir, baseRoute, flatRoutes)
          server.ws.send({
            type: 'custom',
            event: 'custom-process-updated',
            data: { timestamp: Date.now() },
          })
          const updateRoute = flatRoutes.find(item => item.filePath === changedPath)
          console.log(
            `${logTimeStamp()} ${colors.bold(colors.blue('[server-route]'))} server route updated ${colors.underline(colors.green(updateRoute.route))}`,
          )
        }
      })
    },
  }
}
