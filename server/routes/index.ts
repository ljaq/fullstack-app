import { Hono } from 'hono'
import helloRoute from './hello'

const routes: [string, Hono][] = [
  ['/hello', helloRoute]
]

export default routes