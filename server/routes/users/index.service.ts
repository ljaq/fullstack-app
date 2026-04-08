import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { hashPassword } from 'server/utils/auth'
import { UsersService, type UserView } from './users.service'

export class UsersIndexService {
  /** 分页查询用户；`name` 时对用户名模糊匹配 */
  static async listUsers(params: { page: number; pageSize: number; name?: string }) {
    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)

    const qb = userRepo.createQueryBuilder('u').orderBy('u.id', 'ASC')
    if (params.name) {
      qb.andWhere('u.username LIKE :name', { name: `%${params.name}%` })
    }

    const [users, total] = await qb
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount()
    const roles = await UsersService.getAllRolesOrdered()
    const data = users.map(u => UsersService.mapUserRow(u, roles))

    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
    }
  }

  /** 新建用户；用户名重复时返回失败 */
  static async createUser(input: {
    username: string
    password: string
    roleCodes: string[]
  }): Promise<{ success: true; user: UserView } | { success: false; message: string }> {
    const ds = await getDataSource()
    const userRepo = ds.getRepository(UserEntity)

    const exists = await userRepo.findOne({ where: { username: input.username } })
    if (exists) {
      return { success: false, message: '用户名已存在' }
    }

    const passwordHash = await hashPassword(input.password)
    const user = await userRepo.save(
      userRepo.create({
        username: input.username,
        passwordHash,
        roles: input.roleCodes,
      }),
    )

    const allRoles = await UsersService.getAllRolesOrdered()
    return { success: true, user: UsersService.mapUserRow(user, allRoles) }
  }
}
