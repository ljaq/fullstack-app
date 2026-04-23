/**
 * Web 平台适配器实现
 *
 * 封装浏览器平台的 API，实现平台适配器接口
 */

// import { message } from 'antd'
import type {
  IStorage,
  IFetch,
  IMessage,
  ICrypto,
  IRouter,
  IPlatformAdapter,
} from '../platform.interface'

/**
 * Web 存储适配器
 * 使用浏览器的 localStorage
 */
class WebStorage implements IStorage {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}

/**
 * Web HTTP 请求适配器
 * 使用浏览器的 fetch API
 */
class WebFetch implements IFetch {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return window.fetch(input, init)
  }

  FormData = window.FormData
}

/**
 * Web 消息提示适配器
 * 使用 Ant Design 的 message 组件
 */
class WebMessage implements IMessage {
  error(message: string): void {
    console.error(message)
  }
  success(message: string): void {
    console.log(message)
  }
  warning(message: string): void {
    console.warn(message)
  }
  info(message: string): void {
    console.info(message)
  }
}

/**
 * Web 加密适配器
 * 使用浏览器的 Web Crypto API
 */
class WebCrypto implements ICrypto {
  subtle = {
    digest: crypto.subtle.digest.bind(crypto.subtle),
    importKey: crypto.subtle.importKey.bind(crypto.subtle),
    sign: crypto.subtle.sign.bind(crypto.subtle),
  }
}

/**
 * Web 路由适配器
 * 使用浏览器的 location 和 history API
 */
class WebRouter implements IRouter {
  push(url: string): void {
    // location.href = url
  }

  replace(url: string): void {
    location.replace(url)
  }

  back(): void {
    history.back()
  }

  redirectToLogin(): void {
    location.href = '/login'
  }
}

/**
 * Web 平台适配器工厂
 *
 * @returns Web 平台适配器实例
 *
 * @example
 * ```ts
 * import { createWebAdapter } from 'api/adapters/web'
 *
 * const adapter = createWebAdapter()
 * adapter.storage.getItem('token')
 * ```
 */
export function createWebAdapter(): IPlatformAdapter {
  return {
    storage: new WebStorage(),
    fetch: new WebFetch(),
    message: new WebMessage(),
    crypto: new WebCrypto(),
    router: new WebRouter(),
  }
}
