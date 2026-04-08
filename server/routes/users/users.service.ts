import { getDataSource } from 'server/db'
import { Role, RoleEntity } from 'server/entities/Role'

/** 列表/详情返回给前端的用户视图（含角色编码与展示名） */
export type UserView = {
  id: number
  username: string
  roles: string[]
  roleNames: string[]
  createdAt?: Date
  updatedAt?: Date
}

/** 用户模块共享：实体行与角色列表的映射、全量角色查询 */
export class UsersService {
  /** 将用户行与全量角色表对齐，补全 `roleNames` */
  static mapUserRow(
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

  /** 按 id 升序拉取全部角色，供 `mapUserRow` 与列表映射使用 */
  static async getAllRolesOrdered(): Promise<Role[]> {
    const ds = await getDataSource()
    const roleRepo = ds.getRepository(RoleEntity)
    return roleRepo.find({ order: { id: 'ASC' } })
  }
}
