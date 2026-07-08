import { hashPassword, verifyPassword } from 'server/utils/auth'
import { UserRepository } from 'server/repositories/user.repository'
import { RoleRepository } from 'server/repositories/role.repository'
import { UnauthorizedError, BusinessError } from 'server/errors/app-error'
import type { User } from 'server/entities/User'

/**
 * 用户信息视图（不含敏感信息）
 */
export interface UserView {
  id: number
  username: string
  roles: string[]
  roleNames: string[]
  pages: string[]
  buttons: string[]
}

/**
 * 认证服务
 * 处理用户登录、注册、认证相关逻辑
 */
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private roleRepo: RoleRepository,
  ) {}

  private async getUserView(user: User): Promise<UserView> {
    const roles: string[] = (user.roles ?? []).filter(Boolean)
    const roleEntities = roles.length ? await this.roleRepo.findByRoles(roles) : []
    const roleNames = roleEntities.map(r => r.roleName)
    const pages = Array.from(new Set(roleEntities.flatMap(r => r.pages ?? [])))
    const buttons = Array.from(new Set(roleEntities.flatMap(r => r.buttons ?? [])))
    return {
      id: user.id,
      username: user.username,
      roles,
      roleNames,
      pages,
      buttons,
    }
  }

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<UserView> {
    const user = await this.userRepo.findByUsername(username)
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误')
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('用户名或密码错误')
    }

    return this.getUserView(user)
  }

  /**
   * 用户注册
   */
  async register(username: string, password: string): Promise<UserView> {
    const exists = await this.userRepo.existsByUsername(username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    const passwordHash = await hashPassword(password)
    const user = await this.userRepo.create({
      username,
      passwordHash,
      roles: [],
    })

    return this.getUserView(user)
  }

  /**
   * 获取用户信息视图（包含角色权限）
   */
  async getUserViewById(userId: number): Promise<UserView> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new UnauthorizedError('用户不存在')
    }
    return this.getUserView(user)
  }

  /**
   * 修改密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new UnauthorizedError('用户不存在')
    }

    const isValid = await verifyPassword(oldPassword, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('原密码错误')
    }

    const passwordHash = await hashPassword(newPassword)
    await this.userRepo.update(userId, { passwordHash })
  }
}
