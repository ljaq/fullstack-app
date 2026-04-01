import { getDataSource } from 'server/db'
import { Role, RoleEntity } from 'server/entities/Role'
import { UserEntity } from 'server/entities/User'

export async function getRoleById(
  id: number,
): Promise<{ success: true; role: Role } | { success: false; message: string }> {
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const role = await repo.findOne({ where: { id } })
  if (!role) {
    return { success: false, message: '角色不存在' }
  }
  return { success: true, role }
}

export async function updateRoleById(
  id: number,
  body: { roleName: string; role: string; description?: string },
): Promise<{ success: true; role: Role } | { success: false; message: string }> {
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)

  const existing = await repo.findOne({ where: { id } })
  if (!existing) {
    return { success: false, message: '角色不存在' }
  }

  if (body.role !== existing.role) {
    const taken = await repo.findOne({ where: { role: body.role } })
    if (taken) {
      return { success: false, message: '角色名已存在' }
    }
  }

  const role = await repo.save({ id, ...body })
  return { success: true, role }
}

export async function deleteRoleById(
  id: number,
): Promise<{ success: true } | { success: false; message: string }> {
  const ds = await getDataSource()
  const roleRepo = ds.getRepository(RoleEntity)
  const userRepo = ds.getRepository(UserEntity)

  const role = await roleRepo.findOne({ where: { id } })
  if (!role) {
    return { success: false, message: '角色不存在' }
  }

  const users = await userRepo.find()
  const code = role.role
  const used = code != null && users.some(u => (u.roles ?? []).includes(code))
  if (used) {
    return { success: false, message: '该角色已分配给用户，不能删除' }
  }

  const res = await roleRepo.delete({ id })
  if (!res.affected) {
    return { success: false, message: '角色不存在' }
  }
  return { success: true }
}
