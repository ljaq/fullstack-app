import { validate, idParam } from 'server/utils/validate'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import { roleBody } from './index.types'
import { roleService } from 'server/services/role.service'

const factory = createFactory()

/** 获取角色 */
export const GET = factory.createHandlers(requireAuth, validate('param', idParam), async c => {
  const { id } = c.req.valid('param')
  const result = await roleService.getRoleById(id)
  return c.json(result)
})

/** 更新角色 */
export const PUT = factory.createHandlers(
  requireAuth,
  validate('param', idParam),
  validate('json', roleBody),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const role = await roleService.updateRole(id, body)
    return c.json(role)
  },
)

export const DELETE = factory.createHandlers(requireAuth, validate('param', idParam), async c => {
  const { id } = c.req.valid('param')
  await roleService.deleteRole(id)
  return c.json({ message: '角色删除成功' }, 200)
})
