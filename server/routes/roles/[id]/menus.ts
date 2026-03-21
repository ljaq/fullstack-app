import * as z from 'zod'
import { zValidator } from 'server/utils/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const paramSchema = z.object({ id: z.coerce.number().int() })

const menusBody = z.object({
  pageKeys: z.array(z.string()),
})

export const GET = factory.createHandlers(requireAuth, zValidator('param', paramSchema), async c => {
  const { id } = c.req.valid('param')
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const role = await repo.findOne({ where: { id } })
  if (!role) {
    return c.json({ message: '角色不存在' }, 404)
  }
  const pageKeys = role.pages ? (JSON.parse(role.pages) as string[]) : []
  return c.json({ pageKeys })
})

export const PUT = factory.createHandlers(
  requireAuth,
  zValidator('param', paramSchema),
  zValidator('json', menusBody),
  async c => {
    const { id } = c.req.valid('param')
    const { pageKeys } = c.req.valid('json')

    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    const role = await repo.findOne({ where: { id } })
    if (!role) {
      return c.json({ message: '角色不存在' }, 404)
    }

    await repo.update({ id }, { pages: JSON.stringify(pageKeys) })
    return c.json({ success: true })
  },
)
