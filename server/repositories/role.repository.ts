import { getDataSource } from 'server/db'
import { RoleEntity, type Role } from 'server/entities/Role'

/**
 * Role 数据访问层
 * 封装所有与 Role 实体相关的数据库操作
 */
export class RoleRepository {
  private async getRepo() {
    const ds = await getDataSource()
    return ds.getRepository(RoleEntity)
  }

  /**
   * 根据 ID 查找角色
   */
  async findById(id: number): Promise<Role | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { id } })
  }

  /**
   * 根据角色编码查找角色
   */
  async findByRole(role: string): Promise<Role | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { role } })
  }

  /**
   * 根据角色名称查找角色
   */
  async findByRoleName(roleName: string): Promise<Role | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { roleName } })
  }

  /**
   * 检查角色名称和编码组合是否存在
   */
  async existsByRoleNameAndRole(roleName: string, role: string): Promise<boolean> {
    const repo = await this.getRepo()
    const count = await repo.count({ where: { roleName, role } })
    return count > 0
  }

  /**
   * 获取角色列表（分页、搜索）
   */
  async findMany(options: {
    skip?: number
    take?: number
    name?: string
  }): Promise<{ roles: Role[]; total: number }> {
    const repo = await this.getRepo()
    const { skip = 0, take = 10, name } = options

    const queryBuilder = repo.createQueryBuilder('r').orderBy('r.id', 'ASC')

    if (name) {
      queryBuilder.andWhere('r.roleName LIKE :name', { name: `%${name}%` })
    }

    const [roles, total] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount()

    return { roles, total }
  }

  /**
   * 获取所有角色
   */
  async findAll(): Promise<Role[]> {
    const repo = await this.getRepo()
    return repo.find({ order: { id: 'ASC' } })
  }

  /**
   * 根据角色编码列表批量查找
   */
  async findByRoles(roles: string[]): Promise<Role[]> {
    const repo = await this.getRepo()
    return repo.find({ where: { role: Array.from(new Set(roles)) as any } })
  }

  /**
   * 创建新角色
   */
  async create(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const repo = await this.getRepo()
    const role = repo.create(roleData)
    return repo.save(role)
  }

  /**
   * 更新角色
   */
  async update(id: number, roleData: Partial<Role>): Promise<Role | null> {
    const repo = await this.getRepo()
    await repo.update(id, roleData)
    return this.findById(id)
  }

  /**
   * 删除角色
   */
  async delete(id: number): Promise<boolean> {
    const repo = await this.getRepo()
    const result = await repo.delete(id)
    return (result.affected ?? 0) > 0
  }

  /**
   * 更新角色的菜单权限
   */
  async updateMenus(id: number, pages?: string[], buttons?: string[]): Promise<Role | null> {
    return this.update(id, { pages, buttons })
  }
}
