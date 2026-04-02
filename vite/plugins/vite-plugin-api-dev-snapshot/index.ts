import type { PluginOption, ViteDevServer } from 'vite'
import path from 'path'
import fs from 'fs'
import colors from 'picocolors'
import prettier from 'prettier'
import { logTimeStamp } from '../utils'
import fileBaseRoutes, { type IRouteItem } from '../file-base-routes'
import type { DevSnapshotConfig, SnapshotHttpMethod } from '../../../server/dev-snapshot/define'
import { getAuthCookieHeaderForUsername } from '../../../server/dev-snapshot/mint-auth-cookie'
import { pathToFileURL } from 'node:url'

const LOG = '[api-dev-snapshot]'
const METHODS = new Set<SnapshotHttpMethod>(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'])

interface ApiDevSnapshotOptions {
  /** 路由根目录，如 server/routes */
  dir: string
  /** 与 vite-plugin-server-route 的 baseRoute 一致，如 /jaq */
  baseRoute: string
  port: number
  /** 与 server-route 相同的 exclude */
  exclude?: string[]
  /** 为 false 时（如 VITE_API_DEV_SNAPSHOT=0）不注册 watcher、不生成快照 */
  enabled?: boolean
  /** 为 true 时使用 https 访问本机 dev server */
  https?: boolean
}

function snapshotConfigPath(routeFile: string) {
  const dir = path.dirname(routeFile)
  const base = path.basename(routeFile, path.extname(routeFile))
  return path.join(dir, `${base}.snapshot.ts`)
}

function routeFileFromSnapshotConfig(configPath: string): string | null {
  if (!configPath.endsWith('.snapshot.ts')) return null
  const dir = path.dirname(configPath)
  const base = path.basename(configPath, '.snapshot.ts')
  return path.join(dir, `${base}.ts`)
}

function resolveRouteFile(changedPath: string): string | null {
  if (changedPath.endsWith('.snapshot.ts')) {
    return routeFileFromSnapshotConfig(changedPath)
  }
  if (changedPath.endsWith('.ts') && !changedPath.endsWith('_route.gen.ts')) {
    return changedPath
  }
  return null
}

function hasDynamicSegment(routePath: string) {
  return routePath.includes(':') || routePath.includes('*')
}

/** 将 `/users/:id` + `{ id: '1' }` 转为 `/users/1` */
function applyParamsToPath(routePath: string, params: Record<string, string>) {
  let result = routePath
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`:${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=/|$)`, 'g'), value)
  }
  return result
}

function buildUrl(opts: {
  https: boolean
  port: number
  baseRoute: string
  pathPart: string
  query?: Record<string, string | undefined>
}) {
  const { https, port, baseRoute, pathPart, query } = opts
  const origin = `${https ? 'https' : 'http'}://127.0.0.1:${port}`
  const pathname = `${baseRoute}${pathPart.startsWith('/') ? pathPart : `/${pathPart}`}`
  const u = new URL(pathname, origin)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') u.searchParams.set(k, v)
    }
  }
  return u.toString()
}

function redactCookieHeader(headers: Record<string, string>): Record<string, string> {
  const h = { ...headers }
  if (h.Cookie) h.Cookie = '[redacted]'
  if (h.cookie) h.cookie = '[redacted]'
  return h
}

type MethodSnapshotEntry = { request: unknown; response: unknown }

async function writeDevSnapshotJson(
  routeFile: string,
  payload: { generatedAt: string } & Partial<Record<SnapshotHttpMethod, MethodSnapshotEntry>>,
) {
  const dir = path.dirname(routeFile)
  const base = path.basename(routeFile, path.extname(routeFile))
  const out = path.join(dir, `${base}.snapshot.json`)
  const raw = JSON.stringify(payload, null, 2)
  const formatted = await prettier.format(raw, { parser: 'json' })
  fs.writeFileSync(out, formatted, 'utf-8')
}

async function runSnapshot(
  server: ViteDevServer,
  opts: ApiDevSnapshotOptions,
  routeItem: IRouteItem,
  routeFile: string,
) {
  const configPath = snapshotConfigPath(routeFile)
  if (!fs.existsSync(configPath)) {
    return
  }

  const bust = `?t=${Date.now()}`
  const mod = (await server.ssrLoadModule(pathToFileURL(configPath).href + bust)) as {
    default?: DevSnapshotConfig
  }
  const config = mod.default
  if (!config || typeof config !== 'object') {
    console.warn(`${logTimeStamp()} ${colors.bold(colors.yellow(LOG))} ${colors.dim('no default export in')} ${configPath}`)
    return
  }

  if (!config.enabled) {
    console.log(
      `${logTimeStamp()} ${colors.bold(colors.magenta(LOG))} ${colors.dim('skipped')} ${colors.dim(path.relative(process.cwd(), routeFile))} ${colors.dim('(enabled: false)')}`,
    )
    return
  }

  const defaultPath = routeItem.route ?? '/'
  const https = opts.https ?? false

  let authCookieHeader: string | undefined
  if (config.asUser?.username) {
    const mint = await getAuthCookieHeaderForUsername(config.asUser.username)
    if (mint.ok === false) {
      console.error(
        `${logTimeStamp()} ${colors.bold(colors.red(LOG))} ${colors.dim('auth cookie failed:')} ${colors.red(mint.message)}`,
      )
      return
    }
    authCookieHeader = mint.cookieHeader
    console.log(
      `${logTimeStamp()} ${colors.bold(colors.magenta(LOG))} ${colors.dim('auth cookie for')} ${colors.cyan(config.asUser.username)} ${colors.dim('(dev snapshot)')}`,
    )
  }

  const methodSnapshots: Partial<Record<SnapshotHttpMethod, MethodSnapshotEntry>> = {}

  for (const key of Object.keys(config) as (keyof DevSnapshotConfig)[]) {
    if (key === 'enabled' || key === 'asUser') continue
    if (!METHODS.has(key as SnapshotHttpMethod)) continue

    const method = key as SnapshotHttpMethod
    const snapshotCase = config[method]
    if (!snapshotCase || typeof snapshotCase !== 'object') continue

    const params = snapshotCase.params as Record<string, string> | undefined
    let pathPart =
      snapshotCase.path ??
      (params && hasDynamicSegment(defaultPath) ? applyParamsToPath(defaultPath, params) : defaultPath)

    if (hasDynamicSegment(pathPart)) {
      console.warn(
        `${logTimeStamp()} ${colors.bold(colors.yellow(LOG))} ${method} ${colors.dim(routeFile)}: route ${defaultPath} has dynamic segments; set ${colors.cyan('path')} or ${colors.cyan('params')} (e.g. params: { id: \'1\' })`,
      )
      continue
    }

    const url = buildUrl({
      https,
      port: opts.port,
      baseRoute: opts.baseRoute,
      pathPart,
      query: snapshotCase.query as Record<string, string | undefined> | undefined,
    })

    const headers: Record<string, string> = {
      ...(authCookieHeader ? { Cookie: authCookieHeader } : {}),
      ...(snapshotCase.headers ?? {}),
    }
    const hasBody = method !== 'GET' && method !== 'HEAD' && snapshotCase.body !== undefined
    if (hasBody && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }

    let bodyStr: string | undefined
    if (hasBody) {
      bodyStr = typeof snapshotCase.body === 'string' ? snapshotCase.body : JSON.stringify(snapshotCase.body)
    }

    let res: Response
    try {
      res = await fetch(url, { method, headers, body: bodyStr })
    } catch (e) {
      console.error(
        `${logTimeStamp()} ${colors.bold(colors.red(LOG))} ${method} ${colors.dim(url)} ${colors.red(String(e))}`,
      )
      continue
    }

    const resHeaders: Record<string, string> = {}
    res.headers.forEach((v, k) => {
      resHeaders[k] = v
    })

    const ct = res.headers.get('content-type') ?? ''
    let body: unknown
    let rawText: string | undefined
    if (ct.includes('application/json')) {
      try {
        body = await res.json()
      } catch {
        rawText = await res.text()
        body = { _parseError: true, raw: rawText }
      }
    } else {
      rawText = await res.text()
      body = rawText
    }

    methodSnapshots[method] = {
      request: {
        method,
        url,
        headers: redactCookieHeader(headers),
        body: hasBody ? snapshotCase.body : undefined,
      },
      response: { status: res.status, headers: resHeaders, body },
    }

    console.log(
      `${logTimeStamp()} ${colors.bold(colors.magenta(LOG))} ${colors.green(method)} ${colors.dim(res.status)} ${colors.dim(path.relative(process.cwd(), routeFile))}`,
    )
  }

  const methodKeys = Object.keys(methodSnapshots) as SnapshotHttpMethod[]
  if (methodKeys.length > 0) {
    await writeDevSnapshotJson(routeFile, {
      generatedAt: new Date().toISOString(),
      ...methodSnapshots,
    })
  }
}

export default function apiDevSnapshot(opts: ApiDevSnapshotOptions): PluginOption {
  const { dir, exclude = [], enabled = true } = opts
  const absoluteDir = path.resolve(process.cwd(), dir)
  const debouncers = new Map<string, ReturnType<typeof setTimeout>>()

  return {
    name: 'vite-plugin-api-dev-snapshot',
    apply: 'serve',
    configureServer(server) {
      if (!enabled) {
        console.log(`${logTimeStamp()} ${colors.dim(LOG)} disabled (VITE_API_DEV_SNAPSHOT=0)`)
        return
      }

      const schedule = (routeFile: string) => {
        const key = routeFile
        const prev = debouncers.get(key)
        if (prev) clearTimeout(prev)
        debouncers.set(
          key,
          setTimeout(async () => {
            debouncers.delete(key)
            const { flatRoutes } = fileBaseRoutes(absoluteDir, exclude)
            const routeItem = flatRoutes.find(r => path.resolve(r.filePath ?? '') === path.resolve(routeFile))
            if (!routeItem?.filePath) {
              return
            }
            try {
              await runSnapshot(server, opts, routeItem, routeFile)
            } catch (e) {
              console.error(`${logTimeStamp()} ${colors.bold(colors.red(LOG))} ${String(e)}`)
            }
          }, 320),
        )
      }

      server.watcher.on('change', changedPath => {
        const resolvedChange = path.resolve(changedPath)
        const inRoutesDir =
          resolvedChange.startsWith(absoluteDir + path.sep) || resolvedChange === absoluteDir
        if (!inRoutesDir) return
        if (changedPath.endsWith('_route.gen.ts')) return

        const routeFile = resolveRouteFile(changedPath)
        if (!routeFile || !fs.existsSync(routeFile)) return

        schedule(routeFile)
      })
    },
  }
}
