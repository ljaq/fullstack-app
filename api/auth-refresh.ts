import type { RequestConfig } from './types'

/**
 * 由小程序 `main.ts` 注册：`ensureWechatLogin`（wx.login 换 JWT）。
 * Web 端不注册则 401 行为与原来一致。
 */
let refreshImpl: (() => Promise<unknown>) | undefined

/** 进行中的刷新；并发 401 共用一个 Promise（队列语义：先入先等，刷新完成后各自重试） */
let refreshInFlight: Promise<void> | null = null

export function registerAuthRefresh(fn: () => Promise<unknown>) {
  refreshImpl = fn
}

export function clearAuthRefresh() {
  refreshImpl = undefined
  refreshInFlight = null
}

export function scheduleAuthRefresh(): Promise<void> {
  if (!refreshImpl) return Promise.resolve()
  if (!refreshInFlight) {
    refreshInFlight = Promise.resolve(refreshImpl()).then(() => undefined).finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

/** 换票/注册等接口本身不可用刷新恢复，避免递归 */
const AUTH_PATHS_NO_REFRESH = new Set([
  '/app/auth/wechat/login',
  '/app/auth/login',
  '/app/auth/register',
])

function pathOnly(url: string): string {
  const i = url.indexOf('?')
  return i >= 0 ? url.slice(0, i) : url
}

export function shouldSilent401Refresh(url: string, config: RequestConfig): boolean {
  if (config.options?.skipAuthRetry) return false
  if (!refreshImpl) return false
  const p = pathOnly(url)
  if (!p.startsWith('/app/')) return false
  return !AUTH_PATHS_NO_REFRESH.has(p)
}
