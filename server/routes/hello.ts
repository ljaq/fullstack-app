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
  .get(
    '/user',
    zValidator(
      'query',
      z.object({
        name: z.string().min(1),
      }),
    ),
    c => {
      const { name } = c.req.valid('query')
      return c.json({ result: `Hello ${name}!` })
    },
  )
  .put('/user/:id', zValidator('json', z.object({ id2: z.string().min(1) })), c => {
    const { id2 } = c.req.valid('json')
    return c.json({ result: `Hello ${id2}!` })
  })

export default helloRoute
