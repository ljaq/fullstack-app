import { createFactory } from 'hono/factory'
import { getCurrentUser } from 'server/utils/auth'

const factory = createFactory()

export const GET = factory.createHandlers(async c => {
  const user = await getCurrentUser(c)
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
  return c.json({ user })
})
