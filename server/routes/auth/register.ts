import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { hashPassword, setAuthCookie } from 'server/utils/auth'

const factory = createFactory()

const registerBody = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
})

export const POST = factory.createHandlers(zValidator('json', registerBody), async c => {
  const { username, password } = c.req.valid('json')

  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)

  const exists = await userRepo.findOne({ where: { username } })
  if (exists) {
    return c.json({ message: '用户名已存在' }, 400)
  }

  const passwordHash = await hashPassword(password)

  const user = await userRepo.save(
    userRepo.create({
      username,
      passwordHash,
    }),
  )

  setAuthCookie(c, { userId: user.id })

  return c.json({ id: user.id, username: user.username })
})
