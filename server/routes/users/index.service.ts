import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { hashPassword } from 'server/utils/auth'
import { getAllRolesOrdered, mapUserRow, type UserView } from './users.service'

export async function listUsers(params: { page: number; pageSize: number; name?: string }) {
  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)

  const qb = userRepo.createQueryBuilder('u').orderBy('u.id', 'ASC')
  if (params.name) {
    qb.andWhere('u.username LIKE :name', { name: `%${params.name}%` })
  }

  const [users, total] = await qb
    .skip((params.page - 1) * params.pageSize)
    .take(params.pageSize)
    .getManyAndCount()
  const roles = await getAllRolesOrdered()
  const data = users.map(u => mapUserRow(u, roles))

  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function createUser(input: {
  username: string
  password: string
  roleCodes: string[]
}): Promise<{ success: true; user: UserView } | { success: false; message: string }> {
  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)

  const exists = await userRepo.findOne({ where: { username: input.username } })
  if (exists) {
    return { success: false, message: '用户名已存在' }
  }

  const passwordHash = await hashPassword(input.password)
  const user = await userRepo.save(
    userRepo.create({
      username: input.username,
      passwordHash,
      roles: input.roleCodes,
    }),
  )

  const allRoles = await getAllRolesOrdered()
  return { success: true, user: mapUserRow(user, allRoles) }
}
