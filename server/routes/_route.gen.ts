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
import * as roles_id_menus from 'server/routes/roles/[id]/menus.ts'
import * as roles_id from 'server/routes/roles/[id].ts'
import * as roles from 'server/routes/roles/index.ts'
import * as users_id from 'server/routes/users/[id].ts'
import * as users from 'server/routes/users/index.ts'

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
  .get('/roles/:id/menus', ...roles_id_menus.GET)
  .put('/roles/:id/menus', ...roles_id_menus.PUT)
  .get('/roles/:id', ...roles_id.GET)
  .put('/roles/:id', ...roles_id.PUT)
  .delete('/roles/:id', ...roles_id.DELETE)
  .get('/roles', ...roles.GET)
  .post('/roles', ...roles.POST)
  .get('/users/:id', ...users_id.GET)
  .put('/users/:id', ...users_id.PUT)
  .delete('/users/:id', ...users_id.DELETE)
  .get('/users', ...users.GET)
  .post('/users', ...users.POST)

export default route
