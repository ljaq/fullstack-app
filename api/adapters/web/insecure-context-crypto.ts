/**
 * HTTP（非安全上下文）下浏览器不提供 `crypto.subtle`，仅 HTTPS / localhost 可用。
 * 请求签名仍需要 SHA-256 / HMAC-SHA256，此处用 crypto-js 与 Web Crypto 行为对齐。
 */
import CryptoJS from 'crypto-js'
import type { ICrypto } from '../platform.interface'

function u8ToWordArray(u8: Uint8Array): CryptoJS.lib.WordArray {
  if (u8.length === 0) {
    return CryptoJS.lib.WordArray.create([], 0)
  }
  const words: number[] = []
  for (let i = 0; i < u8.length; i++) {
    words[i >>> 2] |= u8[i]! << (24 - (i % 4) * 8)
  }
  return CryptoJS.lib.WordArray.create(words, u8.length)
}

function wordArrayToArrayBuffer(wa: CryptoJS.lib.WordArray): ArrayBuffer {
  const u8 = new Uint8Array(wa.sigBytes)
  for (let i = 0; i < wa.sigBytes; i++) {
    u8[i] = (wa.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
  }
  return u8.buffer
}

type SoftRawKey = { __softRaw: Uint8Array }

export function createInsecureContextSubtle(): ICrypto['subtle'] {
  return {
    async digest(_algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data)
      const wa = CryptoJS.SHA256(u8ToWordArray(u8))
      return wordArrayToArrayBuffer(wa)
    },
    async importKey(
      _format: string,
      keyData: Uint8Array | ArrayBuffer,
      _algorithm: { name: string; hash?: string | { name: string } },
      _extractable: boolean,
      _keyUsages: string[],
    ): Promise<CryptoKey> {
      const u8 = keyData instanceof Uint8Array ? keyData : new Uint8Array(keyData)
      return { __softRaw: new Uint8Array(u8) } as unknown as CryptoKey
    },
    async sign(_algorithm: { name: string }, key: CryptoKey, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
      const raw = (key as unknown as SoftRawKey).__softRaw
      if (!raw) throw new Error('Invalid key for insecure-context crypto')
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data)
      const hmac = CryptoJS.HmacSHA256(u8ToWordArray(u8), u8ToWordArray(raw))
      return wordArrayToArrayBuffer(hmac)
    },
  }
}
