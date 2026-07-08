import { VITE_PUBLIC_ENV_WINDOW_KEY } from 'utils/public-runtime-env'

declare global {
  interface Window {
    __VITE_PUBLIC_ENV__?: Record<string, string>
  }
}

/**
 * 合并 `import.meta.env` 与 HTML 注入的 `window.__VITE_PUBLIC_ENV__`（后者优先）。
 * Web 多页由服务端注入，与 Node 侧 `process.env` 一致；勿在 `vite define` 中再固化这些键。
 */
export function getPublicEnv(): ImportMetaEnv {
  const w =
    typeof window !== 'undefined' ? window[VITE_PUBLIC_ENV_WINDOW_KEY] : undefined
  if (w && typeof w === 'object' && Object.keys(w).length > 0) {
    return { ...import.meta.env, ...w }
  }
  return import.meta.env
}
