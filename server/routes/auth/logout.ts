import { createFactory } from 'hono/factory'
import { clearAuthCookie } from 'server/utils/auth'

const factory = createFactory()

/** 登出 */
export const POST = factory.createHandlers(c => {
  clearAuthCookie(c)
  return c.json({ success: true })
})
