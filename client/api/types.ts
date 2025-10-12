import { HonoBase } from 'hono/hono-base'
import { IRequest } from 'types'

export type Methods = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'get' | 'post' | 'put' | 'delete'

export interface RequestConfig<T = any> {
  url?: string
  method?: Methods
  query?: T
  body?: T
  params?: T
  headers?: { [key: string]: string }
  options?: {
    autoRedirect?: boolean
  }
}

export type BaseConfig = string | { target: string; baseConfig: RequestConfig }

export type UrlObj = { [key: string]: BaseConfig }

export interface API_REQ_FUNCTION<T = any> extends Promise<IRequest<T>> {
  (config?: RequestConfig): Promise<IRequest<T>>
  /**
   * ## get 查询
   */
  get: API_REQ_FUNCTION<T>
  /**
   * ## post 新增
   */
  post: API_REQ_FUNCTION<T>
  /**
   * ## put 修改
   */
  put: API_REQ_FUNCTION<T>
  /**
   * ## delete 删除
   */
  delete: API_REQ_FUNCTION<T>
  /**
   * ## query 参数
   * `/api/test?id=1&name=2`
   */
  query: (query: Record<string, any>) => API_REQ_FUNCTION<T>
  /**
   * ## params 路由参数
   * `/api/test/:id/:name`
   */
  params: (params: Record<string, any>) => API_REQ_FUNCTION<T>
  /**
   * ## body 请求体
   * `/api/test`
   * ```
   * { id: 1, name: 2 }
   * ```
   */
  body: (body: Record<string, any>) => API_REQ_FUNCTION<T>
  /**
   * ## 请求地址
   */
  url: string
}

export type THIRD_API<T> = {
  [X in keyof T]: T[X] extends string ? API_REQ_FUNCTION : THIRD_API<T[X]>
}

export type Endpoint = {
  input: any
  output: any
  // outputFormat: ResponseFormat;
  // status: StatusCode;
}

export type Schema = {
  [Path: string]: {
    [Method: `$${Lowercase<string>}`]: Endpoint
  }
}

type PathToChain<Path extends string, E extends Schema, Original extends string = Path> = Path extends `/${infer P}`
  ? PathToChain<P, E, Path>
  : Path extends `${infer P}/${infer R}`
    ? {
        [K in P]: PathToChain<R, E, Original>
      }
    : {
        [K in Path extends '' ? 'index' : Path]: API_REQ_FUNCTION
      }

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type Client<T> =
  T extends HonoBase<any, infer S, any>
    ? S extends Record<infer K, Schema>
      ? K extends string
        ? PathToChain<K, S>
        : never
      : never
    : never
