/// <reference types="vite/client" />
// vite-env.d.ts
/// <reference types="vite-plugin-pages/client-react" />

interface ViteTypeOptions {}

interface ImportMetaEnv {
  readonly VITE_PORT: string
  readonly VITE_SERVER_BASE_PATH: string
  /** 前后端共用：为 `/jaq` 请求签名/验签；未设置则关闭验签 */
  readonly VITE_REQUEST_SIGN_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '~react-page-*' {
  import type { RouteObject } from 'react-router'
  const routes: RouteObject[]
  export default routes
}
