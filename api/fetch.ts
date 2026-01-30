import { Client, MergeClientWithApi, Methods, RequestConfig, THIRD_API, UnionToIntersection } from './types'
import { RequestBuilder, ResponseHandler, UrlProcessor } from './utils'

export const Fetch = async <F = any, T = any>(config: RequestConfig<F>): Promise<T> => {
  // 构建请求并发送
  const response = await fetch(UrlProcessor.build(config), RequestBuilder.config(config))

  // 响应处理管道
  return response.ok
    ? ResponseHandler.handleSuccess(response, config.options)
    : ResponseHandler.handleError(response, config.options)
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

      const newPath = [...basePath, String(prop)]
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
