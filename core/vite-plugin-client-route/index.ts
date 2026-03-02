import { PluginOption } from 'vite'
import path from 'path'
import colors from 'picocolors'
import fs from 'fs'
import prettier from 'prettier'
import { handleRemoveAccept, FORMAT_CONFIG, hasFile, logTimeStamp } from '../utils'
import fileBaseRoutes, { IRouteItem } from '../file-base-routes'

interface IServerRouteConfig {
  dir: string
  baseRoute: string
  exclude?: string[]
}

async function writeRoutes(dir: string, baseRoute: string, flatRoutes: IRouteItem[], treeRoutes: IRouteItem[]) {
  const handleExtractTree = (routes: IRouteItem[]) => {
    return routes.map(item => {
      const { segment, name, children, relativePath } = item
      const res: any = {
        name: name,
        path: segment,
        children: children && children.length > 0 ? handleExtractTree(children) : [],
      }
      if (relativePath) {
        res.element = `React.createElement(${name})`
      }
      return res
    })
  }

  const code = `
    /**
      * 此路由文件 由vite-plugin-client-route 自动生成
      * 不要修改
     */
    import React from 'react'
    ${flatRoutes.map(route => `const ${route.name} = React.lazy(() => import('${path.join(dir, route.relativePath)}'))`).join('\n')}

    ${flatRoutes
      .map(route => {
        const filePath = handleRemoveAccept(route.filePath)
        const isExist = hasFile(filePath + '.config.ts') || hasFile(filePath + '.config.tsx')
        if (isExist) {
          return `import * as ${route.name}_config from '${path.join(dir, handleRemoveAccept(route.relativePath))}.config'`
        }
        return `const ${route.name}_config = {}`
      })
      .join('\n')}
    
    const safeValue = (data, key) => key in data ? data[key] : null

    const route = [{
      path: '${baseRoute}',
      children: ${JSON.stringify(handleExtractTree(treeRoutes)).replace(
        /"element":"React.createElement\((.*?)\)"/g,
        (_, name) => {
          return `
          "element": React.createElement(${name}),
          "meta": safeValue(${name}_config, 'meta'),
          "loader": safeValue(${name}_config, 'loader'),
          "action": safeValue(${name}_config, 'action'),
        `
        },
      )}
    }]

    export default route
  `
  const formatedCode = await prettier.format(code, FORMAT_CONFIG)
  fs.writeFileSync(path.join(process.cwd(), dir, './_route.gen.ts'), formatedCode)
}

export default function clientRoute(config: IServerRouteConfig): PluginOption {
  const { dir, baseRoute, exclude = [] } = config
  const absolureDir = path.resolve(process.cwd(), dir)
  return {
    name: 'vite-plugin-client-route',
    enforce: 'pre',
    configResolved(config) {},
    async buildStart() {
      const { flatRoutes, treeRoutes } = fileBaseRoutes(absolureDir, exclude)
      await writeRoutes(dir, baseRoute, flatRoutes, treeRoutes)
      console.log(
        `${logTimeStamp()} ${colors.bold(colors.magenta('[client-route]'))} client ${colors.yellow(baseRoute)} route generated`,
      )
    },
    // 配置开发服务器
    configureServer(server) {
      const absolureDir = path.resolve(process.cwd(), dir)

      // 监听文件变更
      server.watcher.on('change', async changedPath => {
        if (changedPath.startsWith(absolureDir) && !changedPath.endsWith('_route.gen.ts')) {
          const { flatRoutes, treeRoutes } = fileBaseRoutes(absolureDir, exclude)
          await writeRoutes(dir, baseRoute, flatRoutes, treeRoutes)
          server.ws.send({
            type: 'custom',
            event: 'client-route-updated',
            data: { timestamp: Date.now() },
          })
          const updateRoute = flatRoutes.find(item => item.filePath === changedPath)
          const filePath = updateRoute.filePath.replace(process.cwd(), '')
          console.log(
            `${logTimeStamp()} ${colors.bold(colors.magenta('[client-route]'))} ${colors.green(colors.yellow(baseRoute) + ' route updated')} ${colors.dim(filePath)}`,
          )
        }
      })
    },
  }
}
