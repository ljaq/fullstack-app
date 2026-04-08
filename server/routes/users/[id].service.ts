import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { hashPassword } from 'server/utils/auth'
import { UsersService, type UserView } from './users.service'

export class UserIdService {
  /** 按 id 查询用户；不存在则失败 */
  static async getUserById(
    id: number,
  ): Promise<{ success: true; user: UserView } | { success: false; message: string }> {
    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)

    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    const roles = await UsersService.getAllRolesOrdered()
    return { success: true, user: UsersService.mapUserRow(user, roles) }
  }

  /** 部分更新：用户名唯一性、密码会重新哈希 */
  static async updateUserById(
    id: number,
    body: {
      username?: string
      password?: string
      roles?: string[]
    },
  ): Promise<{ success: true; user: UserView } | { success: false; message: string }> {
    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)

    const user = await userRepo.findOne({ where: { id } })
    if (!user) {
      return { success: false, message: '用户不存在' }
    }

    if (body.username && body.username !== user.username) {
      const taken = await userRepo.findOne({ where: { username: body.username } })
      if (taken) {
        return { success: false, message: '用户名已存在' }
      }
    }

    const patch: Partial<{ username: string; passwordHash: string; roles: string[] }> = {}
    if (body.username !== undefined) patch.username = body.username
    if (body.password !== undefined) patch.passwordHash = await hashPassword(body.password)
    if (body.roles !== undefined) patch.roles = body.roles

    await userRepo.update({ id }, patch)

    const updated = await userRepo.findOne({ where: { id } })
    const roles = await UsersService.getAllRolesOrdered()
    return { success: true, user: UsersService.mapUserRow(updated!, roles) }
  }

  /** 删除用户；`actorUserId === id` 时禁止自删 */
  static async deleteUserById(
    id: number,
    actorUserId: number | undefined,
  ): Promise<{ success: true } | { success: false; message: string }> {
    if (actorUserId === id) {
      return { success: false, message: '不能删除当前登录用户' }
    }

    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)
    const res = await userRepo.delete({ id })
    if (!res.affected) {
      return { success: false, message: '用户不存在' }
    }
    return { success: true }
  }
}
