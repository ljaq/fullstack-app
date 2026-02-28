import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'
import { createFactory } from 'hono/factory'

const factory = createFactory()

export const GET = factory.createHandlers(zValidator('query', z.object({ name: z.string().min(1) })), c => {
  const { name } = c.req.valid('query')
  return c.json({ result: `Hello ${name}!` })
})
