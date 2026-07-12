import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { signAuthToken } from 'server/utils/auth'
import { authService } from 'server/services/auth.service'
import { registerBody } from './register.schema'

const factory = createFactory()

/** 注册 */
export const POST = factory.createHandlers(
  zValidator('json', registerBody),
  async c => {
    const { username, password } = c.req.valid('json')
    const userView = await authService.register(username, password)

    return c.json({
      id: userView.id,
      username: userView.username,
      roles: userView.roles,
      roleNames: userView.roleNames,
      pages: userView.pages,
      buttons: userView.buttons,
      token: signAuthToken({ userId: userView.id }),
    })
  }
)
