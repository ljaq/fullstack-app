import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import * as rolesIndexService from './index.service'
import { roleBody } from './index.schema'

const factory = createFactory()

/** 获取角色列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const name = c.req.query('name')?.trim()
  const result = await rolesIndexService.listRoles(name)
  return c.json(result)
})

/** 创建角色 */
export const POST = factory.createHandlers(requireAuth, zValidator('json', roleBody), async c => {
  const body = c.req.valid('json')
  const result = await rolesIndexService.createRole(body)
  if (!result.success) {
    return c.json({ message: result.message }, 400)
  }
  return c.json(result.role, 201)
})
