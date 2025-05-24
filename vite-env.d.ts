/// <reference types="vite/client" />
// vite-env.d.ts
/// <reference types="vite-plugin-pages/client-react" />

interface ViteTypeOptions {}

interface ImportMetaEnv {
  readonly VITE_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
