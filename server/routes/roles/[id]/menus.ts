import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { requireAuth, requirePermission } from 'server/utils/auth'
import { BTN } from 'types/permissions'

const factory = createFactory()

const paramSchema = z.object({ id: z.coerce.number().int() })

const buttonPermissionCodeSchema = z.enum(
  Object.values(BTN).flatMap(btn => Object.values(btn)) as [string, ...string[]],
)

const menusBody = z.object({
  pageKeys: z.array(z.string()),
  buttons: z.array(buttonPermissionCodeSchema).optional(),
})

/** 获取角色菜单 */
export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const role = await repo.findOne({ where: { id } })
  if (!role) {
    return c.json({ message: '角色不存在' }, 404)
  }
  const pageKeys = role.pages ? role.pages : []
  const buttons = role.buttons ? role.buttons : []
  return c.json({ pageKeys, buttons })
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

    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    const role = await repo.findOne({ where: { id } })
    if (!role) {
      return c.json({ message: '角色不存在' }, 404)
    }

    await repo.update({ id }, { pages: pageKeys, buttons: buttons ?? [] })
    return c.json({ success: true })
  },
)
