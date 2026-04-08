import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'

export class RoleMenusService {
  /** 读取角色已配置的页面 key 与按钮权限 */
  static async getRoleMenus(
    id: number,
  ): Promise<
    | { success: true; pageKeys: string[]; buttons: string[] }
    | { success: false; message: string }
  > {
    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    const role = await repo.findOne({ where: { id } })
    if (!role) {
      return { success: false, message: '角色不存在' }
    }
    const pageKeys = role.pages ? role.pages : []
    const buttons = role.buttons ? role.buttons : []
    return { success: true, pageKeys, buttons }
  }

  /** 覆盖写入角色的 `pages` / `buttons` */
  static async updateRoleMenus(
    id: number,
    input: { pageKeys: string[]; buttons?: string[] },
  ): Promise<{ success: true } | { success: false; message: string }> {
    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    const role = await repo.findOne({ where: { id } })
    if (!role) {
      return { success: false, message: '角色不存在' }
    }

    await repo.update({ id }, { pages: input.pageKeys, buttons: input.buttons ?? [] })
    return { success: true }
  }
}
