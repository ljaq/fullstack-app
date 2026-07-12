import { In } from 'typeorm'
import { hashPassword, verifyPassword } from 'server/utils/password'
import { getRepo } from 'server/db/get-repo'
import { UnauthorizedError, BusinessError } from 'server/errors/app-error'
import { UserEntity, type User } from 'server/entities/User'
import { RoleEntity } from 'server/entities/Role'
import { existsBy } from 'server/db/query-helpers'

export interface UserView {
  id: number
  username: string
  roles: string[]
  roleNames: string[]
  pages: string[]
  buttons: string[]
}

class AuthService {
  private async getUserView(user: User): Promise<UserView> {
    const roles: string[] = (user.roles ?? []).filter(Boolean)
    const roleRepo = await getRepo(RoleEntity)
    const roleEntities = roles.length
      ? await roleRepo.find({ where: { role: In(Array.from(new Set(roles))) } })
      : []
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

  async login(username: string, password: string): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const user = await userRepo.findOne({ where: { username } })
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误')
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('用户名或密码错误')
    }

    return this.getUserView(user)
  }

  async register(username: string, password: string): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const exists = await existsBy(userRepo, 'username', username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    const passwordHash = await hashPassword(password)
    const user = await userRepo.save(
      userRepo.create({
        username,
        passwordHash,
        roles: [],
      }),
    )

    return this.getUserView(user)
  }

  async getUserViewById(userId: number): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedError('用户不存在')
    }
    return this.getUserView(user)
  }

  async loadSession(userId: number): Promise<UserView | null> {
    const userRepo = await getRepo(UserEntity)
    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) return null
    return this.getUserView(user)
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const userRepo = await getRepo(UserEntity)
    const user = await userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new UnauthorizedError('用户不存在')
    }

    const isValid = await verifyPassword(oldPassword, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('原密码错误')
    }

    const passwordHash = await hashPassword(newPassword)
    await userRepo.update(userId, { passwordHash })
  }
}

export const authService = new AuthService()
