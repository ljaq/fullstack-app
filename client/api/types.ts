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

// --- Hono Schema / Endpoint (compatible with Hono's route types) ---
export type Endpoint = {
  input: any
  output: any
}

export type Schema = {
  [Path: string]: {
    [Method: `$${Lowercase<string>}`]: Endpoint
  }
}

// --- Helpers for PathSchema (Record<$method, Endpoint> at one path) ---
type DollarMethod = `$${Lowercase<string>}`

/** Declared method names for a path: 'get' | 'put' | ... */
type DeclaredMethods<S extends Record<string, Endpoint>> = keyof S extends DollarMethod
  ? keyof S extends `$${infer M}`
    ? Lowercase<M>
    : never
  : never

/** Query type union from all endpoints at this path */
type QueryUnion<S extends Record<string, Endpoint>> = S[keyof S] extends infer E
  ? E extends Endpoint
    ? E['input'] extends { query?: infer Q }
      ? Q
      : never
    : never
  : never

/** Body type union (json | form) from all endpoints at this path */
type BodyUnion<S extends Record<string, Endpoint>> = S[keyof S] extends infer E
  ? E extends Endpoint
    ? E['input'] extends { json?: infer J }
      ? J
      : E['input'] extends { form?: infer F }
        ? F
        : never
    : never
  : never

/** Param type union from all endpoints at this path */
type ParamUnion<S extends Record<string, Endpoint>> = S[keyof S] extends infer E
  ? E extends Endpoint
    ? E['input'] extends { param?: infer P }
      ? P
      : never
    : never
  : never

/** Config for one method: method + optional query/body/param from that endpoint */
type ConfigForMethod<S extends Record<string, Endpoint>, M extends string> = S[`$${Lowercase<M>}`] extends infer E
  ? E extends Endpoint
    ? {
        method: M
        query?: E['input'] extends { query?: infer Q } ? Q : never
        body?: E['input'] extends { json?: infer J } ? J : E['input'] extends { form?: infer F } ? F : never
        params?: E['input'] extends { param?: infer P } ? P : never
      }
    : never
  : never

/** Config union: call node(config) with method and optional query/body/params per method */
type ConfigUnion<S extends Record<string, Endpoint>> = DeclaredMethods<S> extends infer M
  ? M extends string
    ? ConfigForMethod<S, M>
    : never
  : never

/** Response body union from all endpoints at this path (from route's c.json(...)) */
type OutputUnion<S extends Record<string, Endpoint>> = S[keyof S] extends infer E
  ? E extends Endpoint
    ? E['output']
    : never
  : never

/** Single method on request node: thenable + no-arg call, resolves to route response body */
export interface ReqMethod<E extends Endpoint = Endpoint> extends Promise<E['output']> {
  (): Promise<E['output']>
}

/** Request node at one path: only declared methods + query/body/params + call(config) + url */
export interface RequestNode<PathSchema extends Record<string, Endpoint>> {
  url: string
  query: (q: QueryUnion<PathSchema>) => RequestNodeWithMethods<PathSchema>
  body: (b: BodyUnion<PathSchema>) => RequestNodeWithMethods<PathSchema>
  params: (p: ParamUnion<PathSchema>) => RequestNodeWithMethods<PathSchema>
  /** Resolves to response body (union of all methods' output when config.method not narrowed) */
  (config?: ConfigUnion<PathSchema>): Promise<OutputUnion<PathSchema>>
}

/** Add only declared method keys to RequestNode (no index signature so undeclared methods error) */
type RequestNodeWithMethods<PathSchema extends Record<string, Endpoint>> = RequestNode<PathSchema> &
  {
    [M in DeclaredMethods<PathSchema>]: ReqMethod<PathSchema[`$${Lowercase<M>}`]>
  }

/** Legacy: untyped request function for THIRD_API / manual api.ts */
export interface API_REQ_FUNCTION<T = any> extends Promise<IRequest<T>> {
  (config?: RequestConfig): Promise<IRequest<T>>
  get: API_REQ_FUNCTION<T>
  post: API_REQ_FUNCTION<T>
  put: API_REQ_FUNCTION<T>
  delete: API_REQ_FUNCTION<T>
  query: (query: Record<string, any>) => API_REQ_FUNCTION<T>
  params: (params: Record<string, any>) => API_REQ_FUNCTION<T>
  body: (body: Record<string, any>) => API_REQ_FUNCTION<T>
  url: string
}

export type THIRD_API<T> = {
  [X in keyof T]: T[X] extends string ? API_REQ_FUNCTION : THIRD_API<T[X]>
}

// --- PathToChain: path string -> nested object, leaf = RequestNode from Schema[path] ---
type PathToChain<Path extends string, E extends Schema, Original extends string = Path> = Path extends `/${infer P}`
  ? PathToChain<P, E, Original>
  : Path extends `${infer P}/${infer R}`
    ? {
        [K in P]: PathToChain<R, E, Original>
      }
    : {
        [K in Path extends '' ? 'index' : Path]: E[Original] extends Record<string, Endpoint>
          ? RequestNodeWithMethods<E[Original]>
          : API_REQ_FUNCTION
      }

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/** Client type from Hono app: chain from Schema paths, only declared methods and typed query/body/params */
export type Client<T> = T extends HonoBase<any, infer S, any>
  ? S extends Record<infer K, Schema>
    ? K extends string
      ? UnionToIntersection<PathToChain<K, S>>
      : never
    : never
  : never
