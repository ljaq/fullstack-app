/**
 * 小程序平台适配器实现
 *
 * 封装 uni-app 小程序的 API，实现平台适配器接口
 */

import type {
  IStorage,
  IFetch,
  IMessage,
  ICrypto,
  IRouter,
  IPlatformAdapter,
} from '../platform.interface'

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
        data: init.body,
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
 * 小程序加密适配器
 *
 * 注意：小程序环境对加密 API 有所限制
 * 生产环境建议使用专门的加密插件，如 crypto-js 或 uni-app 加密模块
 */
class MiniCrypto implements ICrypto {
  subtle = {
    /**
     * 计算消息摘要
     * 小程序环境使用简化实现（生产环境需使用加密库）
     */
    async digest(_algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
      // 将 ArrayBuffer/Uint8Array 转换为字符串
      const decoder = new TextDecoder()
      const dataStr = decoder.decode(data)

      // 简化版本：使用字符串哈希模拟
      // 生产环境应该使用 crypto-js 或其他加密库
      const hash = await this.simpleHash(dataStr)
      const encoder = new TextEncoder()
      return encoder.encode(hash).buffer
    },

    /**
     * 导入密钥（简化实现）
     */
    async importKey(
      _format: string,
      _keyData: Uint8Array | ArrayBuffer,
      algorithm: { name: string; hash?: string },
      extractable: boolean,
      keyUsages: string[],
    ): Promise<CryptoKey> {
      // 简化实现，返回模拟的 CryptoKey 对象
      // 生产环境应该使用真实的加密库
      return {
        algorithm,
        extractable,
        type: 'secret',
        usages: keyUsages,
      } as CryptoKey
    },

    /**
     * 签名（简化实现）
     */
    async sign(_algorithm: { name: string }, key: CryptoKey, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
      // 简化实现，使用简单的哈希
      const decoder = new TextDecoder()
      const dataStr = decoder.decode(data)
      const hash = await this.simpleHash(dataStr + JSON.stringify(key.algorithm))
      const encoder = new TextEncoder()
      return encoder.encode(hash).buffer
    },

    /**
     * 简单的哈希函数（仅用于示例，生产环境请使用真实加密库）
     */
    async simpleHash(str: string): Promise<string> {
      // 使用 crypto-js 的 SHA256 实现（生产环境）
      // import SHA256 from 'crypto-js/sha256'
      // return SHA256(str).toString()

      // 临时简化实现（不安全，仅用于开发测试）
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16).padStart(64, '0')
    },
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
