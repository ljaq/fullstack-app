import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { UserEntity } from 'server/entities/User'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const paramSchema = z.object({ id: z.coerce.number().int() })

const roleBody = z.object({
  roleName: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
})

/** 获取角色 */
export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const role = await repo.findOne({ where: { id } })
  if (!role) {
    return c.json({ message: '角色不存在' }, 404)
  }
  return c.json(role)
})

/** 更新角色 */
export const PUT = factory.createHandlers(
  requireAuth,
  zValidator('param', paramSchema),
  zValidator('json', roleBody),
  async c => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')

    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)

    const existing = await repo.findOne({ where: { id } })
    if (!existing) {
      return c.json({ message: '角色不存在' }, 404)
    }

    if (body.role !== existing.role) {
      const taken = await repo.findOne({ where: { role: body.role } })
      if (taken) {
        return c.json({ message: '角色名已存在' }, 400)
      }
    }

    const role = await repo.save({ id, ...body })
    return c.json(role)
  },
)

export const DELETE = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const ds = await getDataSource()
  const roleRepo = ds.getRepository(RoleEntity)
  const userRepo = ds.getRepository(UserEntity)

  const role = await roleRepo.findOne({ where: { id } })
  if (!role) {
    return c.json({ message: '角色不存在' }, 404)
  }

  const users = await userRepo.find()
  const code = role.role
  const used = code != null && users.some(u => (u.roles ?? []).includes(code))
  if (used) {
    return c.json({ message: '该角色已分配给用户，不能删除' }, 400)
  }

  const res = await roleRepo.delete({ id })
  if (!res.affected) {
    return c.json({ message: '角色不存在' }, 404)
  }
  return c.json({ message: '角色删除成功' }, 200)
})
