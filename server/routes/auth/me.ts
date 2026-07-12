import { createFactory } from 'hono/factory'
import { getUserIdFromToken } from 'server/utils/auth'
import { authService } from 'server/services/auth.service'

const factory = createFactory()

/** 获取当前用户 */
export const GET = factory.createHandlers(async c => {
  const userId = await getUserIdFromToken(c)
  if (!userId) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
  const user = await authService.getUserViewById(userId)
  return c.json(user)
})
