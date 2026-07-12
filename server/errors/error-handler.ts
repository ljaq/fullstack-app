import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { AppError, ValidationError } from './app-error'

/**
 * Rolldown 打 server bundle 时可能出现多份 `app-error` 模块，`ForbiddenError` 与入口里的 `AppError` 非同一引用，
 * `instanceof AppError` 会失败并误走 500。用结构判断兜底。
 */
function isAppErrorShape(error: unknown): error is AppError {
  if (error instanceof AppError) return true
  if (error === null || typeof error !== 'object') return false
  const e = error as { statusCode?: unknown; message?: unknown }
  return (
    typeof e.statusCode === 'number' &&
    typeof e.message === 'string' &&
    e.statusCode >= 400 &&
    e.statusCode < 600
  )
}

/**
 * 错误响应格式
 */
interface ErrorResponse {
  message: string
  code?: string
  issues?: Array<{ path: string; message: string }>
  details?: Record<string, unknown>
  stack?: string
}

/**
 * Hono `compose` 会在路由/中间件抛错时调用实例上的 `errorHandler`，错误不会继续抛给外层 `app.use` 的 try/catch，
 * 因此必须在 `app.onError(...)` 里统一映射业务异常；否则一律走框架默认的纯文本 500。
 *
 * @see https://hono.dev/docs/api/hono#error-handling
 */
export function appOnError(error: Error, c: Context): Response {
  console.error('Error caught by error handler:', error)

  if ('getResponse' in error && typeof (error as { getResponse?: () => Response }).getResponse === 'function') {
    const res = (error as { getResponse: () => Response }).getResponse()
    return c.newResponse(res.body, res)
  }

  if (isAppErrorShape(error)) {
    const response: ErrorResponse = {
      message: error.message,
      code: error.code,
    }

    const issues = (error as ValidationError).issues
    if (Array.isArray(issues) && issues.length) {
      response.issues = issues
    }

    const details = (error as { details?: Record<string, unknown> }).details
    if (details && typeof details === 'object' && Object.keys(details).length > 0) {
      response.details = details
    }

    if (process.env.NODE_ENV !== 'production' && error.stack) {
      response.stack = error.stack
    }

    return c.json(response, error.statusCode as ContentfulStatusCode)
  }

  if (error && typeof error === 'object' && 'name' in error) {
    if (error.name === 'JsonWebTokenError') {
      return c.json(
        {
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        } as ErrorResponse,
        401,
      )
    }
    if (error.name === 'TokenExpiredError') {
      return c.json(
        {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        } as ErrorResponse,
        401,
      )
    }
  }

  const message =
    process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message || 'Unknown error'

  return c.json(
    {
      message,
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV !== 'production' && error.stack ? { stack: error.stack } : {}),
    } as ErrorResponse,
    500,
  )
}

/**
 * 404 处理器
 */
export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      message: 'Resource not found',
      code: 'NOT_FOUND',
    },
    404,
  )
}
