import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { signAuthToken } from 'server/utils/auth'
import { getService } from 'server/container/service-helpers'
import { loginBody } from './login.schema'

const factory = createFactory()

/** 登录 */
export const POST = factory.createHandlers(
  zValidator('json', loginBody),
  async c => {
    const { username, password } = c.req.valid('json')
    const service = getService()

    const userView = await service.auth.login(username, password)

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
