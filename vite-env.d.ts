/// <reference types="vite/client" />
// vite-env.d.ts
/// <reference types="vite-plugin-pages/client-react" />

interface ViteTypeOptions {}

interface ImportMetaEnv {
  readonly VITE_PORT: string
  readonly VITE_SERVER_BASE_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '~react-page-*' {
  import type { RouteObject } from 'react-router'
  const routes: RouteObject[]
  export default routes
}
