import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { requireAuth, requirePermission } from 'server/utils/auth'
import { BTN } from 'types/permissions'
import * as roleMenusService from './menus.service'
import { menusBody, paramSchema } from './menus.schema'

const factory = createFactory()

/** 获取角色菜单 */
export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const result = await roleMenusService.getRoleMenus(id)
  if (!result.success) {
    return c.json({ message: result.message }, 404)
  }
  return c.json({ pageKeys: result.pageKeys, buttons: result.buttons })
})

/** 更新角色菜单 */
export const PUT = factory.createHandlers(
  requireAuth,
  requirePermission(BTN.角色管理.新建),
  zValidator('param', paramSchema),
  zValidator('json', menusBody),
  async c => {
    const { id } = c.req.valid('param')
    const { pageKeys, buttons } = c.req.valid('json')

    const result = await roleMenusService.updateRoleMenus(id, { pageKeys, buttons })
    if (!result.success) {
      return c.json({ message: result.message }, 404)
    }
    return c.json({ success: true })
  },
)
