import { Hono } from 'hono'
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const helloRoute = new Hono()
  .get('/', c => {
    return c.json({ result: 'Hello World!' })
  })
  .post('/', c => {
    return c.json({ result: 'Hello World!' })
  })
  .get('/user', zValidator('query', z.object({ name: z.string().min(1) })), c => {
    const { name } = c.req.valid('query')
    return c.json({ result: `Hello ${name}!` })
  })
  .put(
    '/user',
    zValidator('query', z.object({ id: z.string().min(1) })),
    zValidator('json', z.object({ name: z.string().min(1) })),
    c => {
      const { name } = c.req.valid('json')
      return c.json({ result: `update ${name}!` })
    },
  )

export default helloRoute
