import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const roleBody = z.object({
  roleName: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
})

/** 获取角色列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const name = c.req.query('name')?.trim()

  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)

  const qb = repo.createQueryBuilder('r').orderBy('r.id', 'ASC')
  if (name) {
    qb.andWhere('r.name LIKE :name', { name: `%${name}%` })
  }

  const [roles, total] = await qb.getManyAndCount()

  return c.json({
    data: roles,
    total,
  })
})

/** 创建角色 */
export const POST = factory.createHandlers(requireAuth, zValidator('json', roleBody), async c => {
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const body = c.req.valid('json')

  const exists = await repo.findOne({ where: { roleName: body.roleName, role: body.role } })
  if (exists) {
    return c.json({ message: '角色已存在' }, 400)
  }

  const role = await repo.save(repo.create(body))
  return c.json(role, 201)
})
