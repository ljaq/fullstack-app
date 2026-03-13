import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createFactory } from 'hono/factory'
import { getDataSource } from 'server/db'
import { RoleEntity } from 'server/entities/Role'
import { requireAuth } from 'server/utils/auth'

const factory = createFactory()

const menusBody = z.object({
  pageKeys: z.array(z.string()),
})

export const GET = factory.createHandlers(requireAuth, async c => {
  const id = Number(c.req.query('id'))
  const ds = await getDataSource()
  const repo = ds.getRepository(RoleEntity)
  const role = await repo.findOne({ where: { id } })
  const pageKeys = role?.pages ? (JSON.parse(role.pages) as string[]) : []
  return c.json({ pageKeys })
})

export const POST = factory.createHandlers(
  requireAuth,
  zValidator('json', menusBody),
  async c => {
    const id = Number(c.req.query('id'))
    const { pageKeys } = c.req.valid('json')

    const ds = await getDataSource()
    const repo = ds.getRepository(RoleEntity)
    await repo.update({ id }, { pages: JSON.stringify(pageKeys) })

    return c.json({ success: true })
  },
)

