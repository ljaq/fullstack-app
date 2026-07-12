import { In } from 'typeorm'
import { hashPassword } from 'server/utils/password'
import { getRepo } from 'server/db/get-repo'
import { existsBy, paginate } from 'server/db/query-helpers'
import { NotFoundError, BusinessError } from 'server/errors/app-error'
import { UserEntity, type User } from 'server/entities/User'
import { RoleEntity } from 'server/entities/Role'

export interface UserView {
  id: number
  username: string
  roles: string[]
  roleNames: string[]
}

class UserService {
  private async findRolesByCodes(roles: string[]) {
    const roleRepo = await getRepo(RoleEntity)
    return roleRepo.find({ where: { role: In(Array.from(new Set(roles))) } })
  }

  private async getRoleMap() {
    const roleRepo = await getRepo(RoleEntity)
    const allRoles = await roleRepo.find({ order: { id: 'ASC' } })
    return new Map(allRoles.map(r => [r.role, r.roleName]))
  }

  private mapUserView(user: User, roleMap: Map<string, string>): UserView {
    return {
      id: user.id,
      username: user.username,
      roles: user.roles || [],
      roleNames: (user.roles || [])
        .map(role => roleMap.get(role))
        .filter(Boolean) as string[],
    }
  }

  async listUsers(options: {
    page: number
    pageSize: number
    username?: string
  }) {
    const { page, pageSize, username } = options
    const skip = (page - 1) * pageSize
    const userRepo = await getRepo(UserEntity)

    const { items: users, total } = await paginate(userRepo, 'u', {
      skip,
      take: pageSize,
      filters: username
        ? [{ sql: 'u.username LIKE :username', params: { username: `%${username}%` } }]
        : [],
    })

    const roleMap = await this.getRoleMap()
    const data = users.map(user => this.mapUserView(user, roleMap))

    return { data, total, page, pageSize }
  }

  async getUserById(id: number): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundError('用户')
    }

    const roleMap = await this.getRoleMap()
    return this.mapUserView(user, roleMap)
  }

  async createUser(input: {
    username: string
    password: string
    roles?: string[]
  }): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const exists = await existsBy(userRepo, 'username', input.username)
    if (exists) {
      throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
    }

    if (input.roles && input.roles.length > 0) {
      const roles = await this.findRolesByCodes(input.roles)
      if (roles.length !== input.roles.length) {
        throw new BusinessError('部分角色不存在', 'INVALID_ROLES')
      }
    }

    const passwordHash = await hashPassword(input.password)
    const user = await userRepo.save(
      userRepo.create({
        username: input.username,
        passwordHash,
        roles: input.roles || [],
      }),
    )

    const roleMap = await this.getRoleMap()
    return this.mapUserView(user, roleMap)
  }

  async updateUser(
    id: number,
    input: {
      username?: string
      password?: string
      roles?: string[]
    },
  ): Promise<UserView> {
    const userRepo = await getRepo(UserEntity)
    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundError('用户')
    }

    if (input.username && input.username !== user.username) {
      const exists = await existsBy(userRepo, 'username', input.username)
      if (exists) {
        throw new BusinessError('用户名已存在', 'USERNAME_EXISTS')
      }
    }

    if (input.roles) {
      const roles = await this.findRolesByCodes(input.roles)
      if (roles.length !== input.roles.length) {
        throw new BusinessError('部分角色不存在', 'INVALID_ROLES')
      }
    }

    const updateData: Partial<User> = {}
    if (input.username !== undefined) updateData.username = input.username
    if (input.password !== undefined) {
      updateData.passwordHash = await hashPassword(input.password)
    }
    if (input.roles !== undefined) updateData.roles = input.roles

    await userRepo.update(id, updateData)
    const updatedUser = await userRepo.findOne({ where: { id } })
    if (!updatedUser) {
      throw new NotFoundError('用户')
    }

    const roleMap = await this.getRoleMap()
    return this.mapUserView(updatedUser, roleMap)
  }

  async deleteUser(id: number, currentUserId?: number): Promise<void> {
    if (currentUserId === id) {
      throw new BusinessError('不能删除当前登录用户', 'CANNOT_DELETE_SELF')
    }

    const userRepo = await getRepo(UserEntity)
    const result = await userRepo.delete(id)
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundError('用户')
    }
  }
}

export const userService = new UserService()
