import { HonoBase } from 'hono/hono-base'

export type Methods = 'GET' | 'POST' | 'DELETE' | 'PUT'

export interface RequestConfig<T = any> {
  url?: string
  method?: Methods
  query?: T
  body?: T
  params?: T
  inlineQuery?: T
  responseType?: 'blob'
}

export type BaseConfig = string | { target: string; baseConfig: RequestConfig }

export type UrlObj = { [key: string]: BaseConfig }

export type API_REQ_FUNCTION = (config?: RequestConfig) => Promise<any>

export type THIRD_API<T> = {
  [X in keyof T]: {
    [K in keyof T[X]]: API_REQ_FUNCTION
  }
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
