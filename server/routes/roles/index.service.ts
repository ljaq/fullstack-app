import { getDataSource } from 'server/db'
import { Role, RoleEntity } from 'server/entities/Role'

export async function listRoles(name?: string) {
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)

  const qb = repo.createQueryBuilder('r').orderBy('r.id', 'ASC')
  if (name) {
    qb.andWhere('r.roleName LIKE :name', { name: `%${name}%` })
  }

  const [roles, total] = await qb.getManyAndCount()
  return { data: roles, total }
}

export async function createRole(body: {
  roleName: string
  role: string
  description?: string
}): Promise<{ success: true; role: Role } | { success: false; message: string }> {
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)

  const exists = await repo.findOne({ where: { roleName: body.roleName, role: body.role } })
  if (exists) {
    return { success: false, message: '角色已存在' }
  }

  const role = await repo.save(repo.create(body))
  return { success: true, role }
}
