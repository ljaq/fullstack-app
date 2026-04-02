import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import * as userIndexService from './index.service'
import { createBody } from './index.schema'

const factory = createFactory()

/** 获取用户列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const page = Number(c.req.query('page')) || 1
  const pageSize = Number(c.req.query('pageSize')) || Number(c.req.query('page_size')) || 10
  const name = c.req.query('name')?.trim()

  const result = await userIndexService.listUsers({ page, pageSize, name })
  return c.json(result)
})

/** 创建用户 */
export const POST = factory.createHandlers(requireAuth, zValidator('json', createBody), async c => {
  const { username, password, roles: roleCodes = [] } = c.req.valid('json')

  const result = await userIndexService.createUser({
    username,
    password,
    roleCodes,
  })
  if (!result.success) {
    return c.json({ message: result.message }, 400)
  }
  return c.json(result.user, 201)
})
