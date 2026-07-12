import { validate, idParam } from 'server/utils/validate'
import { createFactory } from 'hono/factory'
import { requireAuth, requirePermission } from 'server/utils/auth'
import { BTN } from 'types/permissions'
import { roleService } from 'server/services/role.service'
import { menusBody } from './menus.types'

const factory = createFactory()

/** 获取角色菜单 */
export const GET = factory.createHandlers(
  requireAuth,
  validate('param', idParam),
  async c => {
    const { id } = c.req.valid('param')
    const menus = await roleService.getRoleMenus(id)
    return c.json({ pageKeys: menus.pageKeys, buttons: menus.buttons })
  }
)

/** 更新角色菜单 */
export const PUT = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.角色管理.新建),
  validate('param', idParam),
  validate('json', menusBody),
  async c => {
    const { id } = c.req.valid('param')
    const { pageKeys, buttons } = c.req.valid('json')
    await roleService.updateRoleMenus(id, { pageKeys, buttons: buttons || [] })
    return c.json({ success: true })
  }
)
