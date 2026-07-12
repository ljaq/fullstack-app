import { typiaValidator } from '@hono/typia-validator'
import type { Validation } from '@hono/typia-validator'
import type { ValidationTargets } from 'hono/types'
import type { IValidation } from 'typia'
import { ValidationError } from 'server/errors/app-error'

export type { Validation } from '@hono/typia-validator'

function throwValidationError(errors: IValidation.IError[]) {
  const issues = errors.map(e => ({
    path: e.path.replace(/^\$input\.?/, '') || 'root',
    message: `Expected ${e.expected}, but got ${JSON.stringify(e.value)}`,
  }))
  const message = issues.map(i => `${i.path}: ${i.message}`).join('；')
  throw new ValidationError(message, issues)
}

/**
 * Typia 校验中间件
 * 与 @hono/typia-validator 的 typiaValidator 相同，但校验失败时抛出 ValidationError，
 * 由全局错误处理中间件统一处理。
 */
export function validate<T extends Validation, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) {
  return typiaValidator(target, schema, (result, _c) => {
    if (!result.success) {
      throwValidationError(result.errors)
    }
  })
}

export interface IdParam {
  id: number
}

/** Hono path param `id`（字符串）→ 整数 */
export function idParam(input: unknown): IValidation<IdParam> {
  const fail = (value: unknown): IValidation<IdParam> => ({
    success: false,
    errors: [{ path: '$input.id', expected: 'integer', value }],
    data: { id: Number.NaN },
  })

  if (typeof input !== 'object' || input === null || !('id' in input)) {
    return fail(input)
  }

  const raw = (input as { id: unknown }).id
  if (typeof raw !== 'string') {
    return fail(raw)
  }

  const num = Number(raw)
  if (!Number.isInteger(num) || !Number.isFinite(num)) {
    return fail(raw)
  }

  return { success: true, data: { id: num } }
}
