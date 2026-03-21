import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { RoleEntity } from 'server/entities/Role'
import { getCurrentUser, hashPassword, requireAuth } from 'server/utils/auth'

const factory = createFactory()

const paramSchema = z.object({ id: z.coerce.number().int() })

const updateBody = z.object({
  username: z.string().min(3).max(32).optional(),
  password: z.string().min(6).max(128).optional(),
  roleIds: z.array(z.number().int()).optional(),
})

function mapUserRow(
  u: { id: number; username: string; roles: string | null; createdAt?: Date; updatedAt?: Date },
  allRoles: { id: number; name: string }[],
) {
  const roleIds: number[] = u.roles ? JSON.parse(u.roles) : []
  const userRoles = allRoles.filter(r => roleIds.includes(r.id)).map(r => r.name)
  return {
    id: u.id,
    username: u.username,
    roles: userRoles,
    roleIds,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)
  const roleRepo = ds.getRepository(RoleEntity)

  const user = await userRepo.findOne({ where: { id } })
  if (!user) {
    return c.json({ message: '用户不存在' }, 404)
  }

  const roles = await roleRepo.find({ order: { id: 'ASC' } })
  return c.json(mapUserRow(user, roles))
})

export const PUT = factory.createHandlers(
  requireAuth,
  zValidator('param', paramSchema),
  zValidator('json', updateBody),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)
    const roleRepo = ds.getRepository(RoleEntity)

    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      return c.json({ message: '用户不存在' }, 404)
    }

    if (body.username && body.username !== user.username) {
      const taken = await userRepo.findOne({ where: { username: body.username } })
      if (taken) {
        return c.json({ message: '用户名已存在' }, 400)
      }
    }

    const patch: Partial<{ username: string; passwordHash: string; roles: string }> = {}
    if (body.username !== undefined) patch.username = body.username
    if (body.password !== undefined) patch.passwordHash = await hashPassword(body.password)
    if (body.roleIds !== undefined) patch.roles = JSON.stringify(body.roleIds)

    await userRepo.update({ id }, patch)

    const updated = await userRepo.findOne({ where: { id } })
    const roles = await roleRepo.find({ order: { id: 'ASC' } })
    return c.json(mapUserRow(updated!, roles))
  },
)

export const DELETE = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const current = await getCurrentUser(c)
  if (current?.id === id) {
    return c.json({ message: '不能删除当前登录用户' }, 400)
  }

  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)
  const res = await userRepo.delete({ id })
  if (!res.affected) {
    return c.json({ message: '用户不存在' }, 404)
  }
  return c.json({ message: '用户删除成功' }, 200)
})
