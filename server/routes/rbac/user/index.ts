import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { RoleEntity } from 'server/entities/Role'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const assignBody = z.object({
  roleIds: z.array(z.number().int()),
})

export const GET = factory.createHandlers(requireAuth, async c => {
  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)
  const roleRepo = ds.getRepository(RoleEntity)

  const [users, roles] = await Promise.all([
    userRepo.find({ order: { id: 'ASC' } }),
    roleRepo.find(),
  ])

  const data = users.map(u => {
    const roleIds: number[] = u.roles ? JSON.parse(u.roles) : []
    const userRoles = roles.filter(r => roleIds.includes(r.id)).map(r => r.name)
    return {
      id: u.id,
      username: u.username,
      roles: userRoles,
    }
  })

  return c.json({ data })
})

export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', assignBody),
  zValidator('query', z.object({ id: z.coerce.number() })),
  async c => {
    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)
    const userId = Number(c.req.query('id'))
    const { roleIds } = c.req.valid('json')

    await userRepo.update({ id: userId }, { roles: JSON.stringify(roleIds) })

    return c.json({ success: true })
  },
)

