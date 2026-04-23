/**
 * 平台适配器接口定义
 *
 * 定义了平台无关的抽象接口，用于隔离不同运行平台的 API 差异
 * 支持的平台：Web (浏览器)、小程序 (uni-app)
 */

/** 存储适配器接口 */
export interface IStorage {
  /** 获取存储项 */
  getItem(key: string): string | null
  /** 设置存储项 */
  setItem(key: string, value: string): void
  /** 删除存储项 */
  removeItem(key: string): void
}

/** HTTP 请求适配器接口 */
export interface IFetch {
  /** 发起 HTTP 请求 */
  fetch(url: string, init: RequestInit): Promise<Response>
  /** FormData 构造函数 */
  FormData: new () => FormData
}

/** 消息提示适配器接口 */
export interface IMessage {
  /** 错误提示 */
  error(message: string): void
  /** 成功提示 */
  success(message: string): void
  /** 警告提示 */
  warning(message: string): void
  /** 信息提示 */
  info(message: string): void
}

/** 加密适配器接口 */
export interface ICrypto {
  /** 加密相关 API */
  subtle: {
    /** 计算消息摘要 */
    digest(algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer>
    /** 导入密钥 */
    importKey(
      format: string,
      keyData: Uint8Array | ArrayBuffer,
      algorithm: { name: string; hash?: string },
      extractable: boolean,
      keyUsages: string[],
    ): Promise<CryptoKey>
    /** 签名 */
    sign(algorithm: { name: string }, key: CryptoKey, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer>
  }
}

/** 路由适配器接口 */
export interface IRouter {
  /** 导航到指定 URL */
  push(url: string): void
  /** 替换当前页面 */
  replace(url: string): void
  /** 返回上一页 */
  back(): void
}

/** 平台适配器集合 */
export interface IPlatformAdapter {
  /** 存储适配器 */
  storage: IStorage
  /** HTTP 请求适配器 */
  fetch: IFetch
  /** 消息提示适配器 */
  message: IMessage
  /** 加密适配器 */
  crypto: ICrypto
  /** 路由适配器 */
  router: IRouter
}
