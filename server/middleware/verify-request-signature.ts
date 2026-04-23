import { createMiddleware } from 'hono/factory'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import {
  buildCanonicalRequest,
  EMPTY_BODY_SHA256,
  SIGNATURE_HEADER,
  SIGNATURE_MAX_SKEW_MS,
  TIMESTAMP_HEADER,
} from 'utils/request-signature'
import { ForbiddenError } from 'server/errors/app-error'

function sha256Hex(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

function hmacSha256Hex(secret: string, message: string): string {
  return createHmac('sha256', secret).update(message, 'utf8').digest('hex')
}

/**
 * 当环境变量 `VITE_REQUEST_SIGN_SECRET` 存在时，校验 `/app` 请求的 HMAC 签名（与客户端共用同一变量）。
 * 未设置密钥时不校验（便于本地或渐进启用）。
 * multipart 等流式 body 跳过验签（当前业务 API 均为 JSON）。
 */
export const verifyRequestSignature = createMiddleware(async (c, next) => {
  const secret = process.env.VITE_REQUEST_SIGN_SECRET
  if (!secret) {
    await next()
    return
  }

  if (c.req.method === 'OPTIONS') {
    await next()
    return
  }

  const url = new URL(c.req.url)
  if (!url.pathname.startsWith('/app')) {
    await next()
    return
  }

  const contentType = c.req.header('Content-Type') || ''
  if (contentType.includes('multipart/form-data')) {
    await next()
    return
  }

  const timestamp = c.req.header(TIMESTAMP_HEADER)
  const signature = c.req.header(SIGNATURE_HEADER)
  if (!timestamp || !signature) {
    throw new ForbiddenError('缺少请求签名')
  }

  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > SIGNATURE_MAX_SKEW_MS) {
    throw new ForbiddenError('请求签名已过期')
  }

  const pathWithQuery = url.pathname + url.search
  const method = c.req.method.toUpperCase()

  let bodyText = ''
  if (method !== 'GET' && method !== 'HEAD') {
    bodyText = await c.req.text()
    c.req.raw = new Request(c.req.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: bodyText,
    })
  }

  const bodySha256 = bodyText.length === 0 ? EMPTY_BODY_SHA256 : sha256Hex(bodyText)
  const canonical = buildCanonicalRequest(method, pathWithQuery, timestamp, bodySha256)
  const expected = hmacSha256Hex(secret, canonical)

  let ok = false
  try {
    const a = Buffer.from(signature.trim(), 'hex')
    const b = Buffer.from(expected, 'hex')
    ok = a.length === b.length && timingSafeEqual(a, b)
  } catch {
    ok = false
  }

  if (!ok) {
    throw new ForbiddenError('无效请求签名')
  }

  await next()
})
