import { getPublicEnv } from 'api/runtime-env'
import {
  buildCanonicalRequest,
  EMPTY_BODY_SHA256,
  normalizePathWithQuery,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
} from 'utils/request-signature'
import type { ICrypto } from './adapters/platform.interface'

/** 部分小程序/旧 WebView 无 `TextEncoder`，与 `TextEncoder#encode` 等价的 UTF-8 字节 */
function utf8Bytes(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str)
  }
  const out: number[] = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) {
      out.push(c)
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
    } else {
      i++
      c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      )
    }
  }
  return new Uint8Array(out)
}

async function sha256HexUtf8(text: string, crypto: ICrypto): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', utf8Bytes(text))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hmacSha256Hex(secret: string, message: string, crypto: ICrypto): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    utf8Bytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign({ name: 'HMAC' }, key, utf8Bytes(message))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * ## 签名规则
 *
 * **密钥**：`VITE_REQUEST_SIGN_SECRET`，由 Node 在返回 HTML 时写入 `window.__VITE_PUBLIC_ENV__`（与 `process.env` 同源）；与验签中间件读取的 `process.env.VITE_REQUEST_SIGN_SECRET` 一致即可。未配置时不加签名。
 *
 * **新增请求头**
 * - `X-Request-Timestamp`：毫秒时间戳字符串（`Date.now().toString()`）
 * - `X-Request-Signature`：HMAC-SHA256 的 **hex 小写**（64 字节）
 *
 * **规范串（canonical）**：4 行，行与行之间用 `\n`（LF）连接，无末尾换行：
 * 1. HTTP 方法的大写形式，如 `GET`、`POST`、`PUT`、`DELETE`
 * 2. `pathname + search`，须与本次请求 URL 完全一致（含 `?` 与 query，顺序与浏览器发出的相同）
 * 3. 与请求头 `X-Request-Timestamp` 相同的字符串
 * 4. 请求 body 的 UTF-8 字节做 **SHA-256**，再输出为 **hex 小写**；无 body 或空 body 时固定为 `EMPTY_BODY_SHA256`（即空字符串的 SHA256）
 *
 * **body 的序列化**：JSON 请求须与 `Fetch` 发送时一致，即对非 FormData 的 body 使用 `JSON.stringify(body)` 得到的字符串再算 SHA256（与服务端 `await c.req.text()` 得到的原始文本一致）。
 *
 * **签名计算**：`HMAC-SHA256(secret, canonical)`，密钥为 UTF-8 字符串，输出 digest 转 hex。
 *
 * **服务端**：会校验时间戳与服务器时间差不超过 `utils/request-signature` 中的 `SIGNATURE_MAX_SKEW_MS`（默认 30 分钟），防止重放。
 */
export async function signAppRequestHeaders(
  method: string,
  fullUrl: string,
  bodySerialized: string | undefined,
  crypto: ICrypto,
): Promise<Record<string, string>> {
  const secret = getPublicEnv().VITE_REQUEST_SIGN_SECRET as string | undefined
  if (!secret) {
    return {}
  }

  const pathWithQuery = normalizePathWithQuery(
    (() => {
      try {
        const u = new URL(fullUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
        return u.pathname + u.search
      } catch {
        return fullUrl
      }
    })(),
  )

  const ts = Date.now().toString()
  const bodySha =
    bodySerialized === undefined || bodySerialized === ''
      ? EMPTY_BODY_SHA256
      : await sha256HexUtf8(bodySerialized, crypto)
  const canonical = buildCanonicalRequest(method, pathWithQuery, ts, bodySha)
  const sig = await hmacSha256Hex(secret, canonical, crypto)
  return { [TIMESTAMP_HEADER]: ts, [SIGNATURE_HEADER]: sig }
}
