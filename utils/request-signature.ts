/** 与客户端、服务端验签逻辑共用的规范与常量 */

export const TIMESTAMP_HEADER = 'X-Request-Timestamp'
export const SIGNATURE_HEADER = 'X-Request-Signature'

/** 允许的时间偏差（防重放） */
export const SIGNATURE_MAX_SKEW_MS = 30 * 60 * 1000

/** SHA256("") 的 hex，用于无 body 的请求 */
export const EMPTY_BODY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

/**
 * 规范串：method、path+query、时间戳、body 的 SHA256(hex) 四行，与 HMAC-SHA256 一起使用。
 * pathWithQuery 须与浏览器实际请求的 pathname + search 一致。
 */
export function buildCanonicalRequest(
  method: string,
  pathWithQuery: string,
  timestamp: string,
  bodySha256Hex: string,
): string {
  return [method.toUpperCase(), normalizePathWithQuery(pathWithQuery), timestamp, bodySha256Hex].join('\n')
}

/** 去掉无参数的尾随 `?`，避免客户端 URL 拼接与服务端 URL 解析不一致导致验签失败 */
export function normalizePathWithQuery(pathWithQuery: string): string {
  const q = pathWithQuery.indexOf('?')
  if (q === -1) return pathWithQuery
  const search = pathWithQuery.slice(q + 1)
  if (search === '') return pathWithQuery.slice(0, q)
  return pathWithQuery
}
