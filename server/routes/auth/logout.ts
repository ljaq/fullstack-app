import { createFactory } from 'hono/factory'
import { clearAuthCookie } from 'server/utils/auth'

const factory = createFactory()

export const POST = factory.createHandlers(c => {
  clearAuthCookie(c)
  return c.json({ success: true })
})

