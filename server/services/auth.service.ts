import { hashPassword, verifyPassword } from 'server/utils/auth'
import { UserRepository } from 'server/repositories/user.repository'
import { UnauthorizedError, BusinessError } from 'server/errors/app-error'

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
  constructor(private userRepo: UserRepository) {}

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

    // 获取用户完整信息（包含角色权限）
    return this.getUserView(user)
  }

  /**
   * 用户注册
   */
  async register(username: string, password: string): Promise<UserView> {
    // 检查用户名是否已存在
    const exists = await this.userRepo.existsByUsername(username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    // 创建新用户
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
   * 构建用户视图（包含角色权限信息）
   * 注意：这个方法需要访问 RoleRepository，暂时简化处理
   * TODO: 通过依赖注入传入 RoleRepository
   */
  private async getUserView(user: any): Promise<UserView> {
    // 暂时返回基础信息，后续注入 RoleRepository 后完善
    return {
      id: user.id,
      username: user.username,
      roles: user.roles || [],
      roleNames: [],
      pages: [],
      buttons: [],
    }
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
