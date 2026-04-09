import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import { paramSchema, roleBody } from './index.schema'
import { getService } from 'server/container/service-helpers'

const factory = createFactory()

/** 获取角色 */
export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const service = getService()
  const result = await service.role.getRoleById(id)
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

    const service = getService()
    const role = await service.role.updateRole(id, body)
    return c.json(role)
  },
)

export const DELETE = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const service = getService()
  await service.role.deleteRole(id)
  return c.json({ message: '角色删除成功' }, 200)
})
