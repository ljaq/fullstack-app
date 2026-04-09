import { RoleRepository } from 'server/repositories/role.repository'
import { NotFoundError, BusinessError } from 'server/errors/app-error'

/**
 * 角色菜单权限
 */
export interface RoleMenus {
  pageKeys: string[]
  buttons: string[]
}

/**
 * 角色服务
 * 处理角色 CRUD 相关业务逻辑
 */
export class RoleService {
  constructor(private roleRepo: RoleRepository) {}

  /**
   * 获取角色列表（分页）
   */
  async listRoles(options: {
    page?: number
    pageSize?: number
    name?: string
  }) {
    const { page = 1, pageSize = 10, name } = options
    const skip = (page - 1) * pageSize

    const { roles, total } = await this.roleRepo.findMany({
      skip,
      take: pageSize,
      name,
    })

    return {
      data: roles,
      total,
      page,
      pageSize,
    }
  }

  /**
   * 获取所有角色（不分页）
   */
  async getAllRoles() {
    return this.roleRepo.findAll()
  }

  /**
   * 根据 ID 获取角色
   */
  async getRoleById(id: number) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw new NotFoundError('角色')
    }
    return role
  }

  /**
   * 创建角色
   */
  async createRole(input: {
    roleName: string
    role: string
    description?: string
    pages?: string[]
    buttons?: string[]
  }) {
    // 检查角色名称和编码是否已存在
    const exists = await this.roleRepo.existsByRoleNameAndRole(
      input.roleName,
      input.role
    )
    if (exists) {
      throw new BusinessError('角色已存在', 'ROLE_EXISTS')
    }

    const role = await this.roleRepo.create({
      roleName: input.roleName,
      role: input.role,
      description: input.description,
      pages: input.pages || [],
      buttons: input.buttons || [],
    })

    return role
  }

  /**
   * 更新角色
   */
  async updateRole(
    id: number,
    input: {
      roleName?: string
      role?: string
      description?: string
    }
  ) {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw new NotFoundError('角色')
    }

    // 如果更新了 roleName 或 role，检查是否冲突
    if (input.roleName || input.role) {
      const newRoleName = input.roleName || role.roleName
      const newRole = input.role || role.role

      if (newRoleName !== role.roleName || newRole !== role.role) {
        const exists = await this.roleRepo.existsByRoleNameAndRole(
          newRoleName,
          newRole
        )
        if (exists) {
          throw new BusinessError('角色已存在', 'ROLE_EXISTS')
        }
      }
    }

    const updated = await this.roleRepo.update(id, input)
    if (!updated) {
      throw new NotFoundError('角色')
    }

    return updated
  }

  /**
   * 删除角色
   */
  async deleteRole(id: number): Promise<void> {
    const deleted = await this.roleRepo.delete(id)
    if (!deleted) {
      throw new NotFoundError('角色')
    }
  }

  /**
   * 获取角色的菜单权限
   */
  async getRoleMenus(id: number): Promise<RoleMenus> {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw new NotFoundError('角色')
    }

    return {
      pageKeys: role.pages || [],
      buttons: role.buttons || [],
    }
  }

  /**
   * 更新角色的菜单权限
   */
  async updateRoleMenus(
    id: number,
    menus: RoleMenus
  ): Promise<void> {
    const role = await this.roleRepo.findById(id)
    if (!role) {
      throw new NotFoundError('角色')
    }

    await this.roleRepo.updateMenus(
      id,
      menus.pageKeys,
      menus.buttons
    )
  }
}
