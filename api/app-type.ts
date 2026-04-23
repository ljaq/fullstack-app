import route from 'server/routes/_route.gen'

/**
 * 与 `app.ts` 中 `app.route('/', route)` 暴露的 JSON API 面一致。
 * 单独放此文件，避免小程序等项目 `import type` 时拉入整份 `app.ts`（Node 静态服务、代理等）。
 */
export type AppType = typeof route
