import { getRepo } from 'server/db/get-repo'
import { paginate } from 'server/db/query-helpers'
import { NotFoundError, BusinessError } from 'server/errors/app-error'
import { RoleEntity } from 'server/entities/Role'

export interface RoleMenus {
  pageKeys: string[]
  buttons: string[]
}

class RoleService {
  async listRoles(options: {
    page?: number
    pageSize?: number
    name?: string
  }) {
    const { page = 1, pageSize = 10, name } = options
    const skip = (page - 1) * pageSize
    const roleRepo = await getRepo(RoleEntity)

    const { items: roles, total } = await paginate(roleRepo, 'r', {
      skip,
      take: pageSize,
      filters: name ? [{ sql: 'r.roleName LIKE :name', params: { name: `%${name}%` } }] : [],
    })

    return { data: roles, total, page, pageSize }
  }

  async getAllRoles() {
    const roleRepo = await getRepo(RoleEntity)
    return roleRepo.find({ order: { id: 'ASC' } })
  }

  async getRoleById(id: number) {
    const roleRepo = await getRepo(RoleEntity)
    const role = await roleRepo.findOne({ where: { id } })
    if (!role) {
      throw new NotFoundError('角色')
    }
    return role
  }

  async createRole(input: {
    roleName: string
    role: string
    description?: string
    pages?: string[]
    buttons?: string[]
  }) {
    const roleRepo = await getRepo(RoleEntity)
    const exists = await roleRepo.count({ where: { roleName: input.roleName, role: input.role } })
    if (exists > 0) {
      throw new BusinessError('角色已存在', 'ROLE_EXISTS')
    }

    return roleRepo.save(
      roleRepo.create({
        roleName: input.roleName,
        role: input.role,
        description: input.description,
        pages: input.pages || [],
        buttons: input.buttons || [],
      }),
    )
  }

  async updateRole(
    id: number,
    input: {
      roleName?: string
      role?: string
      description?: string
    },
  ) {
    const roleRepo = await getRepo(RoleEntity)
    const role = await roleRepo.findOne({ where: { id } })
    if (!role) {
      throw new NotFoundError('角色')
    }

    if (input.roleName || input.role) {
      const newRoleName = input.roleName || role.roleName
      const newRole = input.role || role.role

      if (newRoleName !== role.roleName || newRole !== role.role) {
        const conflict = await roleRepo.count({
          where: { roleName: newRoleName, role: newRole },
        })
        if (conflict > 0) {
          throw new BusinessError('角色已存在', 'ROLE_EXISTS')
        }
      }
    }

    await roleRepo.update(id, input)
    const updated = await roleRepo.findOne({ where: { id } })
    if (!updated) {
      throw new NotFoundError('角色')
    }

    return updated
  }

  async deleteRole(id: number): Promise<void> {
    const roleRepo = await getRepo(RoleEntity)
    const result = await roleRepo.delete(id)
    if ((result.affected ?? 0) === 0) {
      throw new NotFoundError('角色')
    }
  }

  async getRoleMenus(id: number): Promise<RoleMenus> {
    const role = await this.getRoleById(id)
    return {
      pageKeys: role.pages || [],
      buttons: role.buttons || [],
    }
  }

  async updateRoleMenus(id: number, menus: RoleMenus): Promise<void> {
    const roleRepo = await getRepo(RoleEntity)
    const role = await roleRepo.findOne({ where: { id } })
    if (!role) {
      throw new NotFoundError('角色')
    }

    await roleRepo.update(id, { pages: menus.pageKeys, buttons: menus.buttons })
  }
}

export const roleService = new RoleService()
