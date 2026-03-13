/**
 * 此路由文件 由vite-plugin-server-route 自动生成
 * 不要修改
 */
import { Hono } from 'hono'
import * as auth_login from 'server/routes/auth/login.ts'
import * as auth_logout from 'server/routes/auth/logout.ts'
import * as auth_me from 'server/routes/auth/me.ts'
import * as auth_register from 'server/routes/auth/register.ts'
import * as hello from 'server/routes/hello/index.ts'
import * as hello_text from 'server/routes/hello/text/index.ts'
import * as hello_user_name from 'server/routes/hello/user/[name].ts'
import * as rbac_role from 'server/routes/rbac/role/index.ts'
import * as rbac_role_menus from 'server/routes/rbac/role/menus.ts'
import * as rbac_user from 'server/routes/rbac/user/index.ts'

const route = new Hono()
  .basePath('/jaq')
  .post('/auth/login', ...auth_login.POST)
  .post('/auth/logout', ...auth_logout.POST)
  .get('/auth/me', ...auth_me.GET)
  .post('/auth/register', ...auth_register.POST)
  .get('/hello', ...hello.GET)
  .post('/hello', ...hello.POST)
  .get('/hello/text', ...hello_text.GET)
  .get('/hello/user/:name', ...hello_user_name.GET)
  .get('/rbac/role', ...rbac_role.GET)
  .post('/rbac/role', ...rbac_role.POST)
  .put('/rbac/role', ...rbac_role.PUT)
  .delete('/rbac/role', ...rbac_role.DELETE)
  .get('/rbac/role/menus', ...rbac_role_menus.GET)
  .post('/rbac/role/menus', ...rbac_role_menus.POST)
  .get('/rbac/user', ...rbac_user.GET)
  .post('/rbac/user', ...rbac_user.POST)

export default route
