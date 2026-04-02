/** 与路由 Handler 导出方法名一致（大写） */
export type SnapshotHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface SnapshotCase<TQuery extends Record<string, string | undefined> = Record<string, string>, TBody = unknown, TParams extends Record<string, string> = Record<string, string>> {
  path?: string
  query?: TQuery
  body?: TBody
  params?: TParams
  headers?: Record<string, string>
}

type SnapshotMethods = Partial<Record<SnapshotHttpMethod, SnapshotCase>>

/** mock 用户 */
export interface DevSnapshotAsUser {
  username: string
}

export type DevSnapshotConfig = SnapshotMethods & {
  /**
   * 为 true 时，开发模式下对应路由文件或同名的 `*.snapshot.ts` 快照配置变更后才会生成与路由同名的 `*.snapshot.json`。
   */
  enabled: boolean
  /**
   * 按用户名查库并签发 JWT Cookie（仅开发快照逻辑），再执行各方法快照。
   * 若与某方法的 `headers.Cookie` 同时存在，后者优先。
   */
  asUser?: DevSnapshotAsUser
}

/**
 * 为各方法的 `query` / `body` / `params` 提供类型推断；`enabled` 控制是否生成快照文件。
 * 与同目录 `*.schema.ts` 对齐时，可用 `z.infer` + `satisfies`（见各路由 `*.snapshot.ts`）。
 */
export function defineDevSnapshot<const T extends DevSnapshotConfig>(config: T): T {
  return config
}
