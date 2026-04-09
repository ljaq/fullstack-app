import { zValidator as zValidatorBase } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono/types'
import type { ZodSchema } from 'zod'
import { ValidationError } from 'server/errors/app-error'

/**
 * 将 Zod 校验错误转换为 ValidationError
 * @param error - Zod 验证错误对象
 * @throws ValidationError
 */
function throwValidationError(error: any) {
  const issues = error.issues.map((i: { path: any[]; message: string }) => ({
    path: i.path?.length ? i.path.map(String).join('.') : 'root',
    message: i.message,
  }))

  const message = issues.map(i => `${i.path}: ${i.message}`).join('；')

  throw new ValidationError(message, issues)
}

/**
 * Zod 校验中间件
 * 与 @hono/zod-validator 的 zValidator 相同，但校验失败时抛出 ValidationError，
 * 由全局错误处理中间件统一处理，避免在路由中手动返回错误响应。
 *
 * @param target - 校验目标（'json', 'query', 'param', 'form', 'header' 等）
 * @param schema - Zod 校验模式
 */
export function zValidator<T extends ZodSchema, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T
) {
  return zValidatorBase(target, schema, (result, c) => {
    if (result.success) return

    // 抛出 ValidationError，由全局错误处理中间件捕获
    throwValidationError(result.error)
  })
}

/**
 * 格式化 Zod 错误为前端可直接展示的结构（向后兼容）
 * @deprecated 推荐使用 zValidator 中间件，错误会自动处理
 */
export function formatZodError(error: {
  issues: Array<{ path: (string | number)[]; message: string; code?: string }>
}) {
  const issues = error.issues.map(i => ({
    path: i.path.length ? i.path.map(String).join('.') : 'root',
    message: i.message,
    code: i.code ?? '',
  }))
  const message = issues.map(i => `${i.path}: ${i.message}`).join('；')
  return { success: false as const, message, issues }
}
