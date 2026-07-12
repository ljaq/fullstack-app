import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getCurrentUser, requireAuth, requirePermission } from 'server/utils/auth'
import { BTN } from 'types/permissions'
import { userService } from 'server/services/user.service'
import { paramSchema, updateBody } from './[id].schema'

const factory = createFactory()

/** 获取用户 */
export const GET = factory.createHandlers(
  requireAuth,
  zValidator('param', paramSchema),
  async c => {
    const { id } = c.req.valid('param')
    const user = await userService.getUserById(id)
    return c.json(user)
  }
)

/** 更新用户 */
export const PUT = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.用户管理.编辑),
  zValidator('param', paramSchema),
  zValidator('json', updateBody),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const user = await userService.updateUser(id, body)
    return c.json(user)
  }
)

export const DELETE = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.用户管理.删除),
  zValidator('param', paramSchema),
  async c => {
    const { id } = c.req.valid('param')
    const current = await getCurrentUser(c)
    await userService.deleteUser(id, current?.id)
    return c.json({ message: '用户删除成功' }, 200)
  }
)
