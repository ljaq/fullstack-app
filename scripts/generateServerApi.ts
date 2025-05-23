import { DarukServer } from 'daruk'
import urljoin from 'url-join'
import { readFile, writeFile } from 'fs-extra'
import path from 'path'
import prettier from 'prettier'
import chalk from 'chalk'
;(async function () {
  let code = ''
  if (process.argv.includes('-with-bind')) {
    const darukServer = DarukServer()
    await darukServer.loadFile('../server/services')
    await darukServer.loadFile('../server/controllers')
    // await darukServer.loadFile('../server/middlewares')
    await darukServer.binding()
  }
  const controllers = Reflect.getMetadata('daruk:controller_class', Reflect) || []
  controllers.sort((a, b) => a.name.localeCompare(b.name))

  for (const controller of controllers) {
    const controllerName = controller.name.replace(/Controller$/, '').replace(/^[A-Z]/, first => first.toLowerCase())

    const apis = {}
    const prefix = Reflect.getMetadata('daruk:controller_class_prefix', controller)
    const fnName = Reflect.getMetadata('daruk:controller_func_name', controller) || []
    fnName.sort((a, b) => a.localeCompare(b))

    fnName.forEach(item => {
      const metaRouters = Reflect.getMetadata('daruk:controller_path', controller, item)?.[0]
      if (metaRouters) {
        const { method, path } = metaRouters
        apis[item] = {
          method: method.toUpperCase(),
          url: urljoin('/', prefix, path).replace(/\/\//g, '/').replace(/\/+$/, ''),
        }
      }
    })
    code += `export const ${controllerName} = ${JSON.stringify(apis)}\n\n`
  }
  const conf = JSON.parse((await readFile('./.prettierrc')).toString())
  const res = await prettier.format(code, { ...conf, parser: 'typescript' })
  writeFile(path.join(__dirname, '../client/api/api.gen.ts'), res)
  console.log(chalk.green(`[✓] generate api.gen success`))
})()
