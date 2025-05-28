import { hc } from 'hono/client'
import app from '../../server/routes/hello'



export const token = { getToken: { method: 'GET', url: '/coze/token' } }

type AppType = typeof app
const client = hc<AppType>('')
