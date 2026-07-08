/**
 * 浏览器可展示的 `VITE_*` 白名单：由 Node 在返回 HTML 时内联注入到 `window`，与 `process.env` 同源。
 * 勿把仅服务端使用的密钥（如 AUTH_SECRET）加入此列表。
 */
export const VITE_PUBLIC_RUNTIME_KEYS = [
  'VITE_REQUEST_SIGN_SECRET',
  'VITE_STATIC_URL',
  'VITE_SERVER_BASE_PATH',
] as const

export const VITE_PUBLIC_ENV_WINDOW_KEY = '__VITE_PUBLIC_ENV__' as const

export function pickPublicRuntimeEnv(processEnv: NodeJS.ProcessEnv): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of VITE_PUBLIC_RUNTIME_KEYS) {
    const v = processEnv[k]
    if (v !== undefined && v !== '') {
      out[k] = v
    }
  }
  return out
}

/** 内联脚本须在任何 `type="module"` 执行前运行，故由服务端插在 `</head>` 前。 */
export function buildPublicRuntimeEnvScript(processEnv: NodeJS.ProcessEnv): string {
  const payload = pickPublicRuntimeEnv(processEnv)
  const json = JSON.stringify(payload).replace(/</g, '\\u003c')
  return `<script>window.${VITE_PUBLIC_ENV_WINDOW_KEY}=Object.freeze(${json});</script>`
}

export function injectPublicRuntimeEnv(html: string, processEnv: NodeJS.ProcessEnv): string {
  const script = buildPublicRuntimeEnvScript(processEnv)
  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}</head>`)
  }
  return `${script}${html}`
}

/**
 * 与 `injectPublicRuntimeEnv` 同源：在 Node 启动时从 `process.env` 读取，不依赖 Vite 构建期内联。
 * 用于 `build/app.js` 监听端口（`@hono/vite-build` 否则会把构建时的端口写进产物）。
 */
export function resolveHttpListenPort(env: NodeJS.ProcessEnv): number {
  const raw = env.VITE_PORT ?? env.PORT
  const n = Number(String(raw ?? '').trim())
  if (Number.isFinite(n) && n > 0) {
    return n
  }
  throw new Error(
    '未配置 HTTP 监听端口：请在 .env.<mode> 或 .env.local 中设置 VITE_PORT，或设置环境变量 PORT',
  )
}
