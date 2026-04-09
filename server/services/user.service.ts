import { hashPassword } from 'server/utils/auth'
import { UserRepository } from 'server/repositories/user.repository'
import { RoleRepository } from 'server/repositories/role.repository'
import { NotFoundError, BusinessError } from 'server/errors/app-error'

/**
 * 用户信息视图（不含敏感信息）
 */
export interface UserView {
  id: number
  username: string
  roles: string[]
  roleNames: string[]
}

/**
 * 用户服务
 * 处理用户 CRUD 相关业务逻辑
 */
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private roleRepo: RoleRepository
  ) {}

  /**
   * 获取用户列表（分页）
   */
  async listUsers(options: {
    page: number
    pageSize: number
    username?: string
  }) {
    const { page, pageSize, username } = options
    const skip = (page - 1) * pageSize

    const { users, total } = await this.userRepo.findMany({
      skip,
      take: pageSize,
      username,
    })

    // 获取所有角色用于映射
    const allRoles = await this.roleRepo.findAll()
    const roleMap = new Map(allRoles.map(r => [r.role, r.roleName]))

    // 构建用户视图
    const data = users.map(user => this.mapUserView(user, roleMap))

    return {
      data,
      total,
      page,
      pageSize,
    }
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(id: number): Promise<UserView> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new NotFoundError('用户')
    }

    const allRoles = await this.roleRepo.findAll()
    const roleMap = new Map(allRoles.map(r => [r.role, r.roleName]))

    return this.mapUserView(user, roleMap)
  }

  /**
   * 创建用户
   */
  async createUser(input: {
    username: string
    password: string
    roles?: string[]
  }): Promise<UserView> {
    // 检查用户名是否已存在
    const exists = await this.userRepo.existsByUsername(input.username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    // 验证角色是否存在
    if (input.roles && input.roles.length > 0) {
      const roles = await this.roleRepo.findByRoles(input.roles)
      if (roles.length !== input.roles.length) {
        throw new BusinessError('部分角色不存在', 'INVALID_ROLES')
      }
    }

    // 创建用户
    const passwordHash = await hashPassword(input.password)
    const user = await this.userRepo.create({
      username: input.username,
      passwordHash,
      roles: input.roles || [],
    })

    const allRoles = await this.roleRepo.findAll()
    const roleMap = new Map(allRoles.map(r => [r.role, r.roleName]))

    return this.mapUserView(user, roleMap)
  }

  /**
   * 更新用户
   */
  async updateUser(
    id: number,
    input: {
      username?: string
      password?: string
      roles?: string[]
    }
  ): Promise<UserView> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new NotFoundError('用户')
    }

    // 检查用户名是否被占用
    if (input.username && input.username !== user.username) {
      const exists = await this.userRepo.existsByUsername(input.username)
      if (exists) {
        throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
      }
    }

    // 验证角色是否存在
    if (input.roles) {
      const roles = await this.roleRepo.findByRoles(input.roles)
      if (roles.length !== input.roles.length) {
        throw new BusinessError('部分角色不存在', 'INVALID_ROLES')
      }
    }

    // 准备更新数据
    const updateData: Partial<any> = {}
    if (input.username !== undefined) updateData.username = input.username
    if (input.password !== undefined) {
      updateData.passwordHash = await hashPassword(input.password)
    }
    if (input.roles !== undefined) updateData.roles = input.roles

    // 更新用户
    const updatedUser = await this.userRepo.update(id, updateData)
    if (!updatedUser) {
      throw new NotFoundError('用户')
    }

    const allRoles = await this.roleRepo.findAll()
    const roleMap = new Map(allRoles.map(r => [r.role, r.roleName]))

    return this.mapUserView(updatedUser, roleMap)
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number, currentUserId?: number): Promise<void> {
    // 禁止删除自己
    if (currentUserId === id) {
      throw new BusinessError('不能删除当前登录用户', 'CANNOT_DELETE_SELF')
    }

    const deleted = await this.userRepo.delete(id)
    if (!deleted) {
      throw new NotFoundError('用户')
    }
  }

  /**
   * 将用户实体映射为视图
   */
  private mapUserView(user: any, roleMap: Map<string, string>): UserView {
    return {
      id: user.id,
      username: user.username,
      roles: user.roles || [],
      roleNames: (user.roles || [])
        .map((role: string) => roleMap.get(role))
        .filter(Boolean) as string[],
    }
  }
}
