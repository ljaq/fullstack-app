import { Hono } from 'hono'

const helloRoute = new Hono()
  .get('/', c => {
    return c.json({ result: 'Hello World!' })
  })
  .post('/', c => {
    return c.json({ result: 'Hello World!' })
  })

export default helloRoute
