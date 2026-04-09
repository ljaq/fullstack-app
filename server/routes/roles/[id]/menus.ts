import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth, requirePermission } from 'server/utils/auth'
import { BTN } from 'types/permissions'
import { getService } from 'server/container/service-helpers'
import { menusBody, paramSchema } from './menus.schema'

const factory = createFactory()

/** 获取角色菜单 */
export const GET = factory.createHandlers(
  requireAuth,
  zValidator('param', paramSchema),
  async c => {
    const { id } = c.req.valid('param')
    const service = getService()

    const menus = await service.role.getRoleMenus(id)
    return c.json({ pageKeys: menus.pageKeys, buttons: menus.buttons })
  }
)

/** 更新角色菜单 */
export const PUT = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.角色管理.新建),
  zValidator('param', paramSchema),
  zValidator('json', menusBody),
  async c => {
    const { id } = c.req.valid('param')
    const { pageKeys, buttons } = c.req.valid('json')
    const service = getService()

    await service.role.updateRoleMenus(id, { pageKeys, buttons: buttons || [] })
    return c.json({ success: true })
  }
)
