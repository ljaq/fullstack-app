/**
 * 此路由文件 由vite-plugin-server-route 自动生成
 * 不要修改
 */
import { Hono } from 'hono'
import * as hello from "/Users/lijiaqi/Documents/恭喜发财/fullstack-app/server/routes/hello/index.ts"
import * as hello_text from "/Users/lijiaqi/Documents/恭喜发财/fullstack-app/server/routes/hello/text/index.ts"
import * as hello_user_name from "/Users/lijiaqi/Documents/恭喜发财/fullstack-app/server/routes/hello/user/[name].ts"

const route = new Hono()
  .basePath('/jaq')
  .get('/hello', ...hello.GET)
  .post('/hello', ...hello.POST)
  .get('/hello/text', ...hello_text.GET)
  .get('/hello/user/:name', ...hello_user_name.GET)

export default route
