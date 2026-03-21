import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const roleBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const GET = factory.createHandlers(requireAuth, async c => {
  const page = Number(c.req.query('page')) || 1
  const pageSize = Number(c.req.query('pageSize')) || Number(c.req.query('page_size')) || 10
  const name = c.req.query('name')?.trim()

  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)

  const qb = repo.createQueryBuilder('r').orderBy('r.id', 'ASC')
  if (name) {
    qb.andWhere('r.name LIKE :name', { name: `%${name}%` })
  }

  const [roles, total] = await qb
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount()

  return c.json({
    data: roles,
    total,
    page,
    pageSize,
  })
})

export const POST = factory.createHandlers(requireAuth, zValidator('json', roleBody), async c => {
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const body = c.req.valid('json')

  const exists = await repo.findOne({ where: { name: body.name } })
  if (exists) {
    return c.json({ message: '角色名已存在' }, 400)
  }

  const role = await repo.save(repo.create(body))
  return c.json(role, 201)
})
