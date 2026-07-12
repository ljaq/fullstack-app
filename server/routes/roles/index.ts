import { validate } from 'server/utils/validate'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import { roleService } from 'server/services/role.service'
import { roleBody } from './index.types'

const factory = createFactory()

/** 获取角色列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const name = c.req.query('name')?.trim()
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '10')

  const result = await roleService.listRoles({ page, pageSize, name })
  return c.json(result)
})

/** 创建角色 */
export const POST = factory.createHandlers(
  requireAuth,
  validate('json', roleBody),
  async c => {
    const body = c.req.valid('json')
    const role = await roleService.createRole({
      roleName: body.roleName,
      role: body.role,
      description: body.description,
    })

    return c.json(role, 201)
  }
)
