import { getDataSource } from 'server/db'
import { Role, RoleEntity } from 'server/entities/Role'

export class RolesIndexService {
  /** 查询角色列表；`name` 时对 `roleName` 模糊匹配 */
  static async listRoles(name?: string) {
    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)

    const qb = repo.createQueryBuilder('r').orderBy('r.id', 'ASC')
    if (name) {
      qb.andWhere('r.roleName LIKE :name', { name: `%${name}%` })
    }

    const [roles, total] = await qb.getManyAndCount()
    return { data: roles, total }
  }

  /** 新建角色；同一 `roleName` + `role` 已存在则失败 */
  static async createRole(body: {
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
}
