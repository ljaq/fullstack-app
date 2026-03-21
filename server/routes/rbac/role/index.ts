import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { UserEntity } from 'server/entities/User'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const roleBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const GET = factory.createHandlers(requireAuth, async c => {
  const page = Number(c.req.query('page')) || 1
  const pageSize = Number(c.req.query('pageSize')) || 10

  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const [roles, total] = await repo.findAndCount({
    order: { id: 'ASC' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  return c.json({
    data: roles,
    total,
    page,
    pageSize,
  })
})

export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', roleBody),
  zValidator('query', z.object({ id: z.coerce.number() })),
  async c => {
    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    const body = c.req.valid('json')
    const role = await repo.save(repo.create(body))
    return c.json(role)
  },
)

export const PUT = factory.createHandlers(
  requireAuth,
  zValidator('json', roleBody),
  zValidator('query', z.object({ id: z.coerce.number() })),
  async c => {
    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    const { id } = c.req.valid('query')
    const body = c.req.valid('json')
    const role = await repo.save({ id, ...body })
    return c.json(role)
  },
)

export const DELETE = factory.createHandlers(requireAuth, async c => {
  const ds = await getDataSource()
  const roleRepo = ds.getRepository(RoleEntity)
  const userRepo = ds.getRepository(UserEntity)

  const id = Number(c.req.query('id'))

  // 检查是否有用户包含该角色 id
  const users = await userRepo.find()
  const used = users.some(u => (u.roles ? (JSON.parse(u.roles) as number[]) : []).includes(id))
  if (used) {
    return c.json({ message: '该角色已分配给用户，不能删除' }, 400)
  }

  await roleRepo.delete({ id })
  return c.json({ success: true })
})
