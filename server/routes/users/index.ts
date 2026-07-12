import { validate } from 'server/utils/validate'
import { createFactory } from 'hono/factory'
import { requireAuth } from 'server/utils/auth'
import { userService } from 'server/services/user.service'
import { createBody } from './index.types'

const factory = createFactory()

/** 获取用户列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const page = Number(c.req.query('page')) || 1
  const pageSize = Number(c.req.query('pageSize')) || Number(c.req.query('page_size')) || 10
  const name = c.req.query('name')?.trim()
  const result = await userService.listUsers({ page, pageSize, username: name })
  return c.json(result)
})

/** 创建用户 */
export const POST = factory.createHandlers(
  requireAuth,
  validate('json', createBody),
  async c => {
    const { username, password, roles = [] } = c.req.valid('json')
    const user = await userService.createUser({
      username,
      password,
      roles,
    })

    return c.json(user, 201)
  }
)
