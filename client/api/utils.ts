import { message } from 'antd'
import { downloadFile, querystring } from '../utils/common'
import { Client, Methods, RequestConfig, THIRD_API, UnionToIntersection } from './types'

export async function Fetch<F = any, T = any>({
  url,
  method,
  body,
  query,
  params,
  inlineQuery,
  responseType,
}: RequestConfig<F>): Promise<T> {
  if (params) {
    Object.keys(params).forEach(key => {
      const reg = new RegExp(`/:${key}`, 'g')
      url = url!.replace(reg, `/${params[key]}`)
    })
  }
  if (query) {
    url += `${/\?(.*?)/.test(url!) ? '&' : '?'}${querystring.stringify(query)}`
  }
  if (inlineQuery) {
    for (const key in inlineQuery) {
      const reg = new RegExp(`/\\{${key}\\}/`, 'g')
      url = url!.replace(reg, `/${inlineQuery[key]}/`)
    }
  }
  const response = await fetch(url!, {
    method: method || (body ? 'POST' : 'GET'),
    body: body && JSON.stringify(body),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (response.ok) {
    if (responseType === 'blob') {
      const fileInfo: { fileName: string; fileType: string } = response.headers
        .get('Content-Disposition')
        ?.split(';')
        ?.map(item => item.split('='))
        ?.reduce((a, [key, value]) => {
          a[key] = decodeURIComponent(value)
          return a
        }, {} as any)
      downloadFile(await response.blob(), `${fileInfo.fileName}.${fileInfo.fileType}`)
      return Promise.resolve('' as any)
    }
    return await response.json()
  }
  const errMsg = await response.text()
  switch (response.status) {
    case 401:
      location.href = '/login'
      break
    case 404:
      message.error(errMsg || '404')
      break
    default:
      message.error(errMsg || '未知错误')
  }

  throw errMsg
}

export const getBaseRequest = (url: string | { method?: Methods; url: string }) => (config: Partial<RequestConfig>) => {
  const _conf = typeof url === 'string' ? { url: url } : url
  return Fetch({ ..._conf, ...config })
}
export type BaseRequest = (config?: Partial<RequestConfig>) => Promise<any>

export function paseRequest<T, K extends keyof T>(apis: T) {
  return Object.entries(apis as any).reduce(
    (prev, next) => {
      const [name, url] = next
      prev[name] = getBaseRequest(url as string)
      return prev
    },
    {} as { [x in K]: BaseRequest },
  )
}

export function createApiProxy<T, K>(
  baseApi: K,
  basePath: string[] = [],
): UnionToIntersection<Client<T>> & THIRD_API<K> {
  const proxyFunction = function () {}

  return new Proxy(proxyFunction, {
    get(target, prop) {
      if (typeof prop === 'symbol') return Reflect.get(target, prop)

      const newPath = [...basePath, String(prop)]
      return createApiProxy(baseApi, newPath)
    },
    apply(_, __, args) {
      const path = basePath.reduce((a, b) => a?.[b], baseApi) ?? `/${basePath.join('/')}`
      const request = getBaseRequest({ url: import.meta.env.DEV ? `${path}?pretty` : path })
      return request(args[0])
    },
  }) as any
}
