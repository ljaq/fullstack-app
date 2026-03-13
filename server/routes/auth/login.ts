import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { verifyPassword, setAuthCookie } from 'server/utils/auth'

const factory = createFactory()

const loginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const POST = factory.createHandlers(zValidator('json', loginBody), async c => {
  const { username, password } = c.req.valid('json')

  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)

  const user = await userRepo.findOne({ where: { username } })
  if (!user) {
    return c.json({ message: '用户名或密码错误' }, 400)
  }

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) {
    return c.json({ message: '用户名或密码错误' }, 400)
  }

  setAuthCookie(c, { userId: user.id })

  return c.json({ id: user.id, username: user.username })
})
