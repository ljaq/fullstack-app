import { zValidator as zValidatorBase } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono/types'
import type { ZodSchema } from 'zod'

/** 将 Zod 校验失败转为前端可直接展示的 JSON（含顶层 message + issues 数组） */
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

/**
 * 与 @hono/zod-validator 的 zValidator 相同，但校验失败时返回结构化错误体，
 * 避免整颗 ZodError 被 JSON 序列化成难读的嵌套结构。
 */
export function zValidator<T extends ZodSchema, Target extends keyof ValidationTargets>(target: Target, schema: T) {
  return zValidatorBase(target, schema, (result, c) => {
    if (result.success) return
    return c.json(formatZodError(result.error), 400)
  })
}
