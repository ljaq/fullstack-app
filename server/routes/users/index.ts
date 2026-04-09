import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import { getService } from 'server/container/service-helpers'
import { createBody } from './index.schema'

const factory = createFactory()

/** 获取用户列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const page = Number(c.req.query('page')) || 1
  const pageSize = Number(c.req.query('pageSize')) || Number(c.req.query('page_size')) || 10
  const name = c.req.query('name')?.trim()
  const service = getService()

  const result = await service.user.listUsers({ page, pageSize, username: name })
  return c.json(result)
})

/** 创建用户 */
export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', createBody),
  async c => {
    const { username, password, roles = [] } = c.req.valid('json')
    const service = getService()

    const user = await service.user.createUser({
      username,
      password,
      roles,
    })

    return c.json(user, 201)
  }
)
