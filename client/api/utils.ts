import { message } from 'antd'
import storages from 'client/storages'
import { downloadFile, querystring } from '../utils/common'
import { authority } from './api'
import { Client, Methods, RequestConfig, THIRD_API, UnionToIntersection } from './types'

export async function Fetch<F = any, T = any>(options: RequestConfig<F>): Promise<T> {
  let { url, method, body, query, params, inlineQuery, responseType } = options
  if (params) {
    Object.keys(params).forEach(key => {
      const reg = new RegExp(`/:${key}`, 'g')
      url = url!.replace(reg, `/${params[key]}`)
    })
  }
  url = url!.replace(/\/:[\w\W]+/g, '')
  if (query) {
    url += `${/\?(.*?)/.test(url!) ? '&' : '?'}${querystring.stringify(query)}`
  }
  if (inlineQuery) {
    for (const key in inlineQuery) {
      const reg = new RegExp(`/\\{${key}\\}/`, 'g')
      url = url!.replace(reg, `/${inlineQuery[key]}/`)
    }
  }
  const token = localStorage.getItem(storages.TOKEN)

  const response = await fetch(url!, {
    method: method || (body ? 'POST' : 'GET'),
    body: body && JSON.stringify(body),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token.replace(/"/g, '')}` : '',
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

  let err: any = await response.text()
  try {
    err = JSON.parse(err)
  } catch {}
  const errMsg = typeof err === 'string' ? err : err.message

  switch (response.status) {
    case 401:
      if (!options.url?.includes(authority.login)) {
        location.href = '/login'
      }
      break
    case 404:
      message.error(errMsg || '404')
      break
    default:
      message.error(errMsg || '未知错误')
  }

  throw err
}

export const getBaseRequest =
  (url: string | { method?: Methods; url: string }) => (config?: Partial<RequestConfig>) => {
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
  baseConfig: RequestConfig = {},
): THIRD_API<K> & UnionToIntersection<Client<T>> {
  const proxyFunction = function () {}

  return new Proxy(proxyFunction, {
    get(target, prop) {
      /** 获取请求地址 */
      if (prop === 'url') {
        return basePath.reduce((a, b) => a?.[b], baseApi) ?? `/${basePath.join('/')}`
      }

      /** 绑定method */
      if (['get', 'post', 'put', 'delete'].includes(prop as any)) {
        return createApiProxy(baseApi, basePath, { ...baseConfig, method: prop as Methods })
      }

      /** 绑定请求参数 */
      if (prop === 'body') {
        return body => createApiProxy(baseApi, basePath, { ...baseConfig, body })
      }
      if (prop === 'query') {
        return query => createApiProxy(baseApi, basePath, { ...baseConfig, query })
      }
      if (prop === 'params') {
        return params => createApiProxy(baseApi, basePath, { ...baseConfig, params })
      }

      if (typeof prop === 'symbol') return Reflect.get(target, prop)

      const newPath = [...basePath, String(prop)]
      return createApiProxy(baseApi, newPath, baseConfig)
    },
    apply(_, __, args) {
      const isThen = basePath[basePath.length - 1] === 'then'

      const _basePath = isThen ? basePath.slice(0, -1) : basePath
      const path = _basePath.reduce((a, b) => a?.[b], baseApi) ?? `/${_basePath.join('/')}`

      const request = getBaseRequest({ url: path, ...baseConfig })

      /** 设置完参数后 then的自动调用 */
      if (isThen) {
        return request({}).then(args[0])
      } else {
        return request(args[0])
      }
    },
  }) as any
}
