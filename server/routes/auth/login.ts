import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { signAuthToken } from 'server/utils/auth'
import { authService } from 'server/services/auth.service'
import { loginBody } from './login.schema'

const factory = createFactory()

/** 登录 */
export const POST = factory.createHandlers(
  zValidator('json', loginBody),
  async c => {
    const { username, password } = c.req.valid('json')
    const userView = await authService.login(username, password)

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
