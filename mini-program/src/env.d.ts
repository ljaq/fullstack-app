declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface ImportMetaEnv {
  /** 小程序请求 API 根地址，未配置时开发环境默认 http://127.0.0.1:3606 */
  readonly VITE_MINI_API_ORIGIN?: string
  /** 与 Web、服务端相同的 `/app` 请求签名密钥（仓库根 `.env.*`） */
  readonly VITE_REQUEST_SIGN_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
