import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getCurrentUser, requireAuth, requirePermission } from 'server/utils/auth'
import { BTN } from 'types/permissions'
import * as userIdService from './[id].service'
import { paramSchema, updateBody } from './[id].dto'

const factory = createFactory()

/** 获取用户 */
export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const result = await userIdService.getUserById(id)
  if (!result.success) {
    return c.json({ message: result.message }, 404)
  }
  return c.json(result.user)
})

/** 更新用户 */
export const PUT = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.用户管理.编辑),
  zValidator('param', paramSchema),
  zValidator('json', updateBody),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await userIdService.updateUserById(id, body)
    if (!result.success) {
      const status = result.message === '用户不存在' ? 404 : 400
      return c.json({ message: result.message }, status)
    }
    return c.json(result.user)
  },
)

export const DELETE = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.用户管理.删除),
  zValidator('param', paramSchema),
  async c => {
    const { id } = c.req.valid('param')
    const current = await getCurrentUser(c)
    const result = await userIdService.deleteUserById(id, current?.id)
    if (!result.success) {
      const status = result.message === '用户不存在' ? 404 : 400
      return c.json({ message: result.message }, status)
    }
    return c.json({ message: '用户删除成功' }, 200)
  },
)
