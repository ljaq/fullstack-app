import { Client, MergeClientWithApi, Methods, RequestConfig, THIRD_API, UnionToIntersection } from './types'
import { RequestBuilder, ResponseHandler, UrlProcessor } from './utils'
import { platformAdapter } from 'api/adapters'
import { scheduleAuthRefresh, shouldSilent401Refresh } from './auth-refresh'

/** 链式 `_id`、`_posterId` 等与路径模板里的 `:id`、`:posterId` 对齐。 */
function normalizePathSegment(seg: string): string {
  if (seg.startsWith('_') && seg.length > 1 && /^_[a-zA-Z][a-zA-Z0-9]*$/.test(seg)) {
    return `:${seg.slice(1)}`
  }
  return seg
}

export const Fetch = async <F = any, T = any>(config: RequestConfig<F>, is401Retry = false): Promise<T> => {
  const url = UrlProcessor.build(config)
  const response = await platformAdapter.fetch.fetch(url, await RequestBuilder.buildRequestInit(config, url))

  if (response.ok) {
    return ResponseHandler.handleSuccess(response, config.options) as Promise<T>
  }

  if (response.status === 401 && !is401Retry && shouldSilent401Refresh(url, config)) {
    try {
      await scheduleAuthRefresh()
    } catch {
      return ResponseHandler.handleError(response, config.options) as Promise<T>
    }
    return Fetch(config, true)
  }

  return ResponseHandler.handleError(response, config.options) as Promise<T>
}

export function createApiProxy<T, K = Record<string, never>>(
  baseApi: K = {} as K,
  basePath: string[] = [],
  baseConfig: RequestConfig = {},
): K extends Record<string, never>
  ? UnionToIntersection<Client<T>>
  : MergeClientWithApi<UnionToIntersection<Client<T>>, THIRD_API<K>> {
  const proxyFunction = function () {}
  const base = (baseApi ?? {}) as Record<string, unknown>

  return new Proxy(proxyFunction, {
    get(_, prop) {
      /** 获取请求地址 */
      if (prop === 'url') {
        return UrlProcessor.build({
          url: basePath.length ? (basePath.reduce((a, b) => (a as any)?.[b], base) ?? `/${basePath.join('/')}`) : '/',
          ...baseConfig,
        })
      }

      /** 绑定method */
      if (['get', 'post', 'put', 'delete'].includes(prop as string)) {
        return createApiProxy(baseApi, basePath, { ...baseConfig, method: prop as Methods })
      }

      /** 绑定请求参数 */
      if (['body', 'query', 'params'].includes(prop as string)) {
        return (args: any) => createApiProxy(baseApi, basePath, { ...baseConfig, [prop as string]: args })
      }

      if (['then', 'catch', 'finally'].includes(prop as string)) {
        const path = basePath.length ? (basePath.reduce((a, b) => (a as any)?.[b], base) ?? `/${basePath.join('/')}`) : '/'
        const promise = Fetch({ ...baseConfig, url: path })
        return (cb: any) => (promise as any)[prop](cb)
      }

      const newPath = [...basePath, normalizePathSegment(String(prop))]
      return createApiProxy(baseApi, newPath, baseConfig)
    },
    apply(_, __, args) {
      const path = basePath.length ? (basePath.reduce((a, b) => (a as any)?.[b], base) ?? `/${basePath.join('/')}`) : '/'
      return Fetch({ url: path, ...baseConfig, ...(args[0] ?? {}) })
    },
  }) as K extends Record<string, never>
    ? UnionToIntersection<Client<T>>
    : MergeClientWithApi<UnionToIntersection<Client<T>>, THIRD_API<K>>
}
