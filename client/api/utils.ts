import { message } from 'antd'
import storages from 'client/storages'
import { downloadFile, querystring } from '../utils/common'
import { RequestConfig } from './types'

/**
 * URL处理工具类
 */
export const UrlProcessor = {
  // 路径参数 :id -> 实际值
  replaceParams: (url: string, params: Record<string, any> = {}) =>
    Object.entries(params)
      .reduce((acc, [key, value]) => acc.replace(new RegExp(`/:${key}`, 'g'), `/${value}`), url)
      .replace(/\/:[\w\W]+/g, ''),
  // 查询参数 ?id=1 -> 添加查询参数
  addQuery: (url: string, query?: Record<string, any>) =>
    query ? `${url}${url.includes('?') ? '&' : '?'}${querystring.stringify(query)}` : url,

  // 组合所有URL处理步骤
  build: (options: RequestConfig) => {
    const { url, query, params } = options

    const processors = [
      (url: string) => UrlProcessor.replaceParams(url, params),
      (url: string) => UrlProcessor.addQuery(url, query),
    ]

    return processors.reduce((acc, processor) => processor(acc), url!)
  },
}

/**
 * 请求配置构建器
 */
export const RequestBuilder = {
  // 获取认证头
  getAuthHeader: () => {
    const token = localStorage.getItem(storages.TOKEN)
    return token ? `Bearer ${token.replace(/"/g, '')}` : ''
  },

  // 判断是否为FormData
  isFormData: (body: any): body is FormData => body instanceof FormData,

  // 构建请求头
  headers: (body?: any): HeadersInit => {
    const baseHeaders: HeadersInit = {
      Authorization: RequestBuilder.getAuthHeader(),
    }

    // FormData不需要设置Content-Type，让浏览器自动设置
    if (!RequestBuilder.isFormData(body)) {
      baseHeaders['Content-Type'] = 'application/json'
    }

    return baseHeaders
  },

  // 处理请求体
  processBody: (body: any) => {
    if (!body) return undefined
    return RequestBuilder.isFormData(body) ? body : JSON.stringify(body)
  },

  // 构建完整请求配置
  config: (options: RequestConfig): RequestInit => ({
    method: options.method || (options.body ? 'POST' : 'GET'),
    body: RequestBuilder.processBody(options.body),
    credentials: 'include',
    headers: {
      ...RequestBuilder.headers(options.body),
      ...options.headers,
    },
  }),
}

/**
 * 响应处理器
 */
export const ResponseHandler = {
  // 解析文件信息
  parseFileInfo: (contentDisposition: string) =>
    Object.fromEntries(
      contentDisposition
        .split(';')
        .map(item => item.split('='))
        .map(([key, value]) => [key.trim(), decodeURIComponent(value?.replace(/"/g, ''))]),
    ),

  handleSuccess: async (response: Response, options: RequestConfig['options']): Promise<any> => {
    // 根据响应头自动判断是否为文件下载
    const contentDisposition = response.headers.get('Content-Disposition')
    const contentType = response.headers.get('Content-Type') || ''

    // 判断是否为文件下载：有 Content-Disposition 且为 attachment，或 Content-Type 为二进制类型
    const isFileDownload =
      contentDisposition?.includes('attachment') ||
      contentType.startsWith('application/octet-stream') ||
      contentType.startsWith('application/pdf') ||
      contentType.startsWith('image/') ||
      contentType.startsWith('video/') ||
      contentType.startsWith('audio/') ||
      contentType.includes('download')

    if (isFileDownload) {
      if (!contentDisposition) {
        // 如果没有 Content-Disposition，尝试从 Content-Type 生成文件名
        const extension = ResponseHandler.getExtensionFromMimeType(contentType)
        const fileName = `download${extension}`
        const blob = await response.blob()
        downloadFile(blob, fileName)
        return Promise.resolve('')
      }

      const fileInfo = ResponseHandler.parseFileInfo(contentDisposition)

      const blob = await response.blob()
      downloadFile(blob, `${fileInfo.filename}`)
      return Promise.resolve('')
    }

    return response.json()
  },

  // 根据 MIME 类型获取文件扩展名
  getExtensionFromMimeType: (contentType: string): string => {
    const mimeToExt: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/vnd.ms-excel': '.xls',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'text/plain': '.txt',
      'application/zip': '.zip',
      'application/json': '.json',
    }

    const mimeType = contentType.split(';')[0].trim()
    return mimeToExt[mimeType] || ''
  },

  // 错误状态处理映射
  errorHandlers: {
    401: (_errorMessage: string, options: RequestConfig['options']) => {
      const autoRedirect = options?.autoRedirect ?? true
      if (autoRedirect) {
        location.href = '/login'
      }
    },
    404: (errorMessage: string) => message.error(errorMessage || '404'),
    default: (errorMessage: string) => message.error(errorMessage || '未知错误'),
  },

  // 处理错误响应
  handleError: async (response: Response, options: RequestConfig['options']) => {
    const errorText = await response.text()
    const error = (() => {
      try {
        return JSON.parse(errorText)
      } catch {
        return errorText
      }
    })()

    const errorMessage = typeof error === 'string' ? error : error.message
    const handler =
      ResponseHandler.errorHandlers[response.status as keyof typeof ResponseHandler.errorHandlers] ||
      ResponseHandler.errorHandlers.default

    handler(errorMessage, options)
    throw error
  },
}
