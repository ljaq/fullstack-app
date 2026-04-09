import { In } from 'typeorm'
import { getDataSource } from 'server/db'
import { UserEntity, type User } from 'server/entities/User'

/**
 * User 数据访问层
 * 封装所有与 User 实体相关的数据库操作
 */
export class UserRepository {
  private async getRepo() {
    const ds = await getDataSource()
    return ds.getRepository(UserEntity)
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id: number): Promise<User | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { id } })
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string): Promise<User | null> {
    const repo = await this.getRepo()
    return repo.findOne({ where: { username } })
  }

  /**
   * 创建新用户
   */
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const repo = await this.getRepo()
    const user = repo.create(userData)
    return repo.save(user)
  }

  /**
   * 更新用户
   */
  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const repo = await this.getRepo()
    await repo.update(id, userData)
    return this.findById(id)
  }

  /**
   * 删除用户
   */
  async delete(id: number): Promise<boolean> {
    const repo = await this.getRepo()
    const result = await repo.delete(id)
    return (result.affected ?? 0) > 0
  }

  /**
   * 获取用户列表（分页）
   */
  async findMany(options: {
    skip?: number
    take?: number
    username?: string
  }): Promise<{ users: User[]; total: number }> {
    const repo = await this.getRepo()
    const { skip = 0, take = 10, username } = options

    const queryBuilder = repo.createQueryBuilder('u').orderBy('u.id', 'ASC')

    if (username) {
      queryBuilder.andWhere('u.username LIKE :username', { username: `%${username}%` })
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount()

    return { users, total }
  }

  /**
   * 批量查找用户（根据角色）
   */
  async findByRoles(roles: string[]): Promise<User[]> {
    const repo = await this.getRepo()
    // SQLite 不支持 JSON 查询，需要在内存中过滤
    const allUsers = await repo.find()
    return allUsers.filter(user =>
      user.roles?.some(role => roles.includes(role))
    )
  }

  /**
   * 检查用户名是否存在
   */
  async existsByUsername(username: string): Promise<boolean> {
    const repo = await this.getRepo()
    const count = await repo.count({ where: { username } })
    return count > 0
  }
}
