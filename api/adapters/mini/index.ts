/**
 * 小程序平台适配器实现
 *
 * 封装 uni-app 小程序的 API，实现平台适配器接口
 */
import CryptoJS from 'crypto-js'
import type {
  IStorage,
  IFetch,
  IMessage,
  ICrypto,
  IRouter,
  IPlatformAdapter,
} from '../platform.interface'

function wordArrayToArrayBuffer(wa: CryptoJS.lib.WordArray): ArrayBuffer {
  const { words, sigBytes } = wa
  const u8 = new Uint8Array(sigBytes)
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
  }
  return u8.buffer
}

function toWordArray(data: Uint8Array | ArrayBuffer): CryptoJS.lib.WordArray {
  const u8 = data instanceof ArrayBuffer ? new Uint8Array(data) : data
  return CryptoJS.lib.WordArray.create(u8)
}

function normalizeHashName(hash: AlgorithmIdentifier | undefined): string {
  if (hash === undefined) return ''
  if (typeof hash === 'string') return hash
  if (typeof hash === 'object' && hash !== null && 'name' in hash) {
    return String((hash as { name: string }).name)
  }
  return ''
}

const HMAC_SECRET = Symbol('cryptoJsHmacSecret')

/** 微信 `wx.request` 在 Content-Type 为 application/json 时期望 `data` 为对象；传 JSON 字符串会导致二次序列化，与服务端验签 body 不一致。 */
function uniRequestData(body: BodyInit | null | undefined, headers: HeadersInit | undefined): unknown {
  if (body === undefined || body === null || body === '') {
    return undefined
  }
  let contentType = ''
  if (headers && typeof headers === 'object' && !(headers instanceof Headers)) {
    const h = headers as Record<string, string>
    contentType = (h['Content-Type'] ?? h['content-type'] ?? '').toLowerCase()
  } else if (headers instanceof Headers) {
    contentType = (headers.get('Content-Type') ?? '').toLowerCase()
  }
  if (typeof body === 'string' && contentType.includes('application/json')) {
    try {
      return JSON.parse(body) as unknown
    } catch {
      return body
    }
  }
  return body
}

function miniRequestUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const raw = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    ?.VITE_MINI_API_ORIGIN
  const origin = (typeof raw === 'string' && raw.length > 0 ? raw : 'http://127.0.0.1:3606').replace(
    /\/$/,
    '',
  )
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * 小程序存储适配器
 * 使用 uni.getStorageSync / uni.setStorageSync / uni.removeStorageSync
 */
class MiniStorage implements IStorage {
  getItem(key: string): string | null {
    try {
      const value = uni.getStorageSync(key)
      // uni-app 返回空字符串表示不存在
      return value !== '' ? value : null
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    uni.setStorageSync(key, value)
  }

  removeItem(key: string): void {
    uni.removeStorageSync(key)
  }
}

/**
 * 小程序加密适配器
 * 使用 crypto-js
 */
export class MiniCrypto implements ICrypto {
  subtle = {
    async digest(algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
      if (algorithm !== 'SHA-256') {
        throw new Error(`MiniCrypto: unsupported digest ${algorithm}`)
      }
      return wordArrayToArrayBuffer(CryptoJS.SHA256(toWordArray(data)))
    },

    async importKey(
      _format: string,
      keyData: Uint8Array | ArrayBuffer,
      algorithm: { name: string; hash?: string },
      extractable: boolean,
      keyUsages: string[],
    ): Promise<CryptoKey> {
      if (algorithm.name !== 'HMAC' || normalizeHashName(algorithm.hash as AlgorithmIdentifier) !== 'SHA-256') {
        throw new Error(`MiniCrypto: unsupported importKey ${algorithm.name}/${String(algorithm.hash)}`)
      }
      const raw = keyData instanceof ArrayBuffer ? new Uint8Array(keyData) : new Uint8Array(keyData)
      return {
        algorithm,
        extractable,
        type: 'secret',
        usages: keyUsages,
        [HMAC_SECRET]: raw,
      } as CryptoKey & { [HMAC_SECRET]: Uint8Array }
    },

    async sign(_algorithm: { name: string }, key: CryptoKey, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
      if (_algorithm.name !== 'HMAC') {
        throw new Error(`MiniCrypto: unsupported sign ${_algorithm.name}`)
      }
      const secret = (key as CryptoKey & { [HMAC_SECRET]?: Uint8Array })[HMAC_SECRET]
      if (!secret) {
        throw new Error('MiniCrypto: missing HMAC secret on key')
      }
      return wordArrayToArrayBuffer(CryptoJS.HmacSHA256(toWordArray(data), toWordArray(secret)))
    },
  }
}

/**
 * 小程序 HTTP 请求适配器
 * 使用 uni.request
 */
class MiniFetch implements IFetch {
  /**
   * 使用 uni.request 发起请求
   * 返回兼容 Web 标准 Response 接口的对象
   */
  async fetch(url: string, init: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      uni.request({
        url: miniRequestUrl(url),
        method: (init.method?.toUpperCase() as any) || 'GET',
        data: uniRequestData(init.body, init.headers),
        header: init.headers as Record<string, string>,
        success: (res: any) => {
          // 构造兼容 Web Response 接口的对象
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusCode === 200 ? 'OK' : 'Error',
            headers: res.header || {},
            json: async () => res.data,
            text: async () =>
              typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
            blob: async () => {
              // 小程序环境返回模拟 Blob
              return new Blob([JSON.stringify(res.data)], {
                type: 'application/json',
              })
            },
          } as unknown as Response)
        },
        fail: (err: any) => {
          reject(err)
        },
      })
    })
  }

  /**
   * 模拟 FormData
   * 小程序环境不支持原生 FormData，使用对象模拟
   */
  FormData = class MiniFormData {
    private _data: Record<string, any> = {}

    append(name: string, value: string | Blob): void {
      this._data[name] = value
    }

    /** 转换为普通对象，用于 uni.request 传输 */
    toObject() {
      return this._data
    }
  } as any
}

/**
 * 小程序消息提示适配器
 * 使用 uni.showToast
 */
class MiniMessage implements IMessage {
  error(message: string): void {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 3000,
    })
  }

  success(message: string): void {
    uni.showToast({
      title: message,
      icon: 'success',
      duration: 2000,
    })
  }

  warning(message: string): void {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 3000,
    })
  }

  info(message: string): void {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    })
  }
}

/**
 * 小程序路由适配器
 * 使用 uni.navigateTo / uni.redirectTo / uni.navigateBack
 */
class MiniRouter implements IRouter {
  push(url: string): void {
    // uni.navigateTo 需要完整的 URL（如 '/pages/index/index'）
    // 自动添加前缀（如果需要）
    const targetUrl = url.startsWith('/') ? url : `/${url}`
    uni.navigateTo({ url: targetUrl })
  }

  replace(url: string): void {
    const targetUrl = url.startsWith('/') ? url : `/${url}`
    uni.redirectTo({ url: targetUrl })
  }

  back(): void {
    uni.navigateBack()
  }

  redirectToLogin(): void {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

/**
 * 小程序平台适配器工厂
 *
 * @returns 小程序平台适配器实例
 *
 * @example
 * ```ts
 * import { createMiniAdapter } from 'api/adapters/mini'
 *
 * const adapter = createMiniAdapter()
 * adapter.storage.getItem('token')
 * ```
 */
export function createMiniAdapter(): IPlatformAdapter {
  return {
    storage: new MiniStorage(),
    fetch: new MiniFetch(),
    message: new MiniMessage(),
    crypto: new MiniCrypto(),
    router: new MiniRouter(),
  }
}
