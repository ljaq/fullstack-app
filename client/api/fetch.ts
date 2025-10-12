import { Client, Methods, RequestConfig, THIRD_API, UnionToIntersection } from './types'
import { RequestBuilder, ResponseHandler, UrlProcessor } from './utils'

export const Fetch = async <F = any, T = any>(config: RequestConfig<F>): Promise<T> => {
  // 构建请求并发送
  const response = await fetch(UrlProcessor.build(config), RequestBuilder.config(config))

  // 响应处理管道
  return response.ok
    ? ResponseHandler.handleSuccess(response, config.options)
    : ResponseHandler.handleError(response, config.options)
}

export function createApiProxy<T, K>(
  baseApi: K,
  basePath: string[] = [],
  baseConfig: RequestConfig = {},
): THIRD_API<K> & UnionToIntersection<Client<T>> {
  const proxyFunction = function () {}

  return new Proxy(proxyFunction, {
    get(_, prop) {
      /** 获取请求地址 */
      if (prop === 'url') {
        return UrlProcessor.build({
          url: basePath.reduce((a, b) => a?.[b], baseApi) ?? `/${basePath.join('/')}`,
          ...baseConfig,
        })
      }

      /** 绑定method */
      if (['get', 'post', 'put', 'delete'].includes(prop as any)) {
        return createApiProxy(baseApi, basePath, { ...baseConfig, method: prop as Methods })
      }

      /** 绑定请求参数 */
      if (['body', 'query', 'params'].includes(prop as any)) {
        return (args: any) => createApiProxy(baseApi, basePath, { ...baseConfig, [prop as any]: args })
      }

      if (['then', 'catch', 'finally'].includes(prop as any)) {
        const path = basePath.reduce((a, b) => a?.[b], baseApi) ?? `/${basePath.join('/')}`
        return cb => Fetch({ ...baseConfig, url: path })[prop as any](cb)
      }

      const newPath = [...basePath, String(prop)]
      return createApiProxy(baseApi, newPath, baseConfig)
    },
    apply(_, __, args) {
      const path = basePath.reduce((a, b) => a?.[b], baseApi) ?? `/${basePath.join('/')}`
      return Fetch({ url: path, ...baseConfig, ...args[0] })
    },
  }) as any
}
