/**
 * 应用错误基类
 * 所有业务异常都应继承此类
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 认证错误 (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * 权限错误 (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * 资源未找到错误 (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * 验证错误 (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, public issues?: Array<{ path: string; message: string }>) {
    super(400, message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * 业务逻辑错误 (400)
 */
export class BusinessError extends AppError {
  constructor(message: string, code?: string) {
    super(400, message, code || 'BUSINESS_ERROR')
    this.name = 'BusinessError'
  }
}

/**
 * 内部服务器错误 (500)
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(500, message, 'INTERNAL_SERVER_ERROR')
    this.name = 'InternalServerError'
  }
}
