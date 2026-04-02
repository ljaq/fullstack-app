import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import * as roleIdService from './index.service'
import { paramSchema, roleBody } from './index.schema'

const factory = createFactory()

/** 获取角色 */
export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const result = await roleIdService.getRoleById(id)
  if (!result.success) {
    return c.json({ message: result.message }, 404)
  }
  return c.json(result.role)
})

/** 更新角色 */
export const PUT = factory.createHandlers(
  requireAuth,
  zValidator('param', paramSchema),
  zValidator('json', roleBody),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const result = await roleIdService.updateRoleById(id, body)
    if (!result.success) {
      const status = result.message === '角色不存在' ? 404 : 400
      return c.json({ message: result.message }, status)
    }
    return c.json(result.role)
  },
)

export const DELETE = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const result = await roleIdService.deleteRoleById(id)
  if (!result.success) {
    const status = result.message === '角色不存在' ? 404 : 400
    return c.json({ message: result.message }, status)
  }
  return c.json({ message: '角色删除成功' }, 200)
})
