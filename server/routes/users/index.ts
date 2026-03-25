import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { User, UserEntity } from 'server/entities/User'
import { Role, RoleEntity } from 'server/entities/Role'
import { hashPassword, requireAuth } from 'server/utils/auth'

const factory = createFactory()

const createBody = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
  roles: z.array(z.string().min(1)).optional(),
})

function mapUserRow(u: User, allRoles: Role[]) {
  const codes = u.roles ?? []
  const matched = allRoles.filter(r => r.role && codes.includes(r.role))
  const roleNames = matched.map(r => r.roleName)
  return {
    id: u.id,
    username: u.username,
    roles: codes,
    roleNames,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

/** 获取用户列表 */
export const GET = factory.createHandlers(requireAuth, async c => {
  const page = Number(c.req.query('page')) || 1
  const pageSize = Number(c.req.query('pageSize')) || Number(c.req.query('page_size')) || 10
  const name = c.req.query('name')?.trim()

  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)
  const roleRepo = ds.getRepository(RoleEntity)

  const qb = userRepo.createQueryBuilder('u').orderBy('u.id', 'ASC')
  if (name) {
    qb.andWhere('u.username LIKE :name', { name: `%${name}%` })
  }

  const [users, total] = await qb
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount()
  const roles = await roleRepo.find({ order: { id: 'ASC' } })

  const data = users.map(u => mapUserRow(u, roles))

  return c.json({
    data,
    total,
    page,
    pageSize,
  })
})

/** 创建用户 */
export const POST = factory.createHandlers(requireAuth, zValidator('json', createBody), async c => {
  const { username, password, roles: roleCodes = [] } = c.req.valid('json')

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
      roles: roleCodes,
    }),
  )

  const roleRepo = ds.getRepository(RoleEntity)
  const allRoles = await roleRepo.find({ order: { id: 'ASC' } })
  return c.json(mapUserRow(user, allRoles), 201)
})
