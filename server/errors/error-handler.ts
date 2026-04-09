import type { Context, Next } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { AppError, ValidationError, InternalServerError } from './app-error'

/**
 * 错误响应格式
 */
interface ErrorResponse {
  message: string
  code?: string
  issues?: Array<{ path: string; message: string }>
  stack?: string
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next()
  } catch (error) {
    console.error('Error caught by error handler:', error)

    // AppError 及其子类
    if (error instanceof AppError) {
      const response: ErrorResponse = {
        message: error.message,
        code: error.code,
      }

      // ValidationError 包含详细的字段错误信息
      if (error instanceof ValidationError && error.issues) {
        response.issues = error.issues
      }

      // 开发环境返回堆栈信息
      if (process.env.NODE_ENV !== 'production' && error.stack) {
        response.stack = error.stack
      }

      return c.json(response, error.statusCode as ContentfulStatusCode)
    }

    // Zod 验证错误
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as any
      const issues = zodError.issues?.map((issue: any) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))

      return c.json(
        {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          issues,
        } as ErrorResponse,
        400,
      )
    }

    // JWT 错误
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

    // 未知错误
    const message =
      process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (error as Error).message || 'Unknown error'

    return c.json(
      {
        message,
        code: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV !== 'production' && { stack: (error as Error).stack }),
      } as ErrorResponse,
      500,
    )
  }
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
