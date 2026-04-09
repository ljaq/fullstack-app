import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import { getService } from 'server/container/service-helpers'
import { roleBody } from './index.schema'

const factory = createFactory()

/** 获取角色列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const name = c.req.query('name')?.trim()
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '10')

  const service = getService()
  const result = await service.role.listRoles({ page, pageSize, name })
  return c.json(result)
})

/** 创建角色 */
export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', roleBody),
  async c => {
    const body = c.req.valid('json')
    const service = getService()

    const role = await service.role.createRole({
      roleName: body.roleName,
      role: body.role,
      description: body.description,
    })

    return c.json(role, 201)
  }
)
