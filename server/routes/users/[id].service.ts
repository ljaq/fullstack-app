import { getDataSource } from 'server/db'
import { UserEntity } from 'server/entities/User'
import { hashPassword } from 'server/utils/auth'
import { getAllRolesOrdered, mapUserRow, type UserView } from './users.service'

export async function getUserById(
  id: number,
): Promise<{ success: true; user: UserView } | { success: false; message: string }> {
  const ds = await getDataSource()
  const userRepo = ds.getRepository(UserEntity)

  const user = await userRepo.findOne({ where: { id } })
  if (!user) {
    return { success: false, message: '用户不存在' }
  }

  const roles = await getAllRolesOrdered()
  return { success: true, user: mapUserRow(user, roles) }
}

export async function updateUserById(
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
  const roles = await getAllRolesOrdered()
  return { success: true, user: mapUserRow(updated!, roles) }
}

export async function deleteUserById(
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
