import { getDataSource } from 'server/db'
import { Role, RoleEntity } from 'server/entities/Role'

export type UserView = {
  id: number
  username: string
  roles: string[]
  roleNames: string[]
  createdAt?: Date
  updatedAt?: Date
}

export function mapUserRow(
  u: {
    id: number
    username: string
    roles: string[] | null
    createdAt?: Date
    updatedAt?: Date
  },
  allRoles: Role[],
): UserView {
  const codes = u.roles ?? []
  const matched = allRoles.filter(r => r.role && codes.includes(r.role))
  return {
    id: u.id,
    username: u.username,
    roles: codes,
    roleNames: matched.map(r => r.roleName),
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

export async function getAllRolesOrdered(): Promise<Role[]> {
  const ds = await getDataSource()
  const roleRepo = ds.getRepository(RoleEntity)
  return roleRepo.find({ order: { id: 'ASC' } })
}
