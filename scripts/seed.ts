/**
 * 初始化种子数据：创建 admin 账号及管理员角色，并赋予全部页面权限
 * 默认作用于本地 SQLite（DATABASE_URL，如 file:./dev.db）
 * 运行: pnpm seed 或 pnpm prisma db seed
 */
import 'reflect-metadata'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { getDataSource } from '../server/db'

dotenv.config({ path: `.env.${process.env.mode || 'development'}` })

// 与 CMS 路由树一致的页面 key（有新增页面时需同步）
const ALL_PAGE_KEYS = [
  '/cms/about',
  '/cms/home',
  '/cms/list',
  '/cms/list/list1',
  '/cms/list/list2',
  '/cms/role',
  '/cms/user',
]

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_ROLE_CODE = 'admin'

async function main() {
  const ds = await getDataSource()
  const userRepo = ds.getRepository('User')
  const roleRepo = ds.getRepository('Role')

  try {
    // 1. 创建或获取管理员角色
    let adminRole = await roleRepo.findOne({ where: { role: ADMIN_ROLE_CODE } })
    if (!adminRole) {
      adminRole = await roleRepo.save(
        roleRepo.create({
          roleName: '管理员',
          role: ADMIN_ROLE_CODE,
          description: '超级管理员，拥有全部菜单权限',
        }),
      )
      console.log('已创建角色:', adminRole.roleName)
    } else {
      console.log('角色已存在:', adminRole.roleName)
    }

    // 2. 为管理员角色分配全部页面权限
    const pagesArr = Array.isArray(adminRole.pages) ? adminRole.pages : []
    const existingKeys = new Set(pagesArr)
    const toAdd = ALL_PAGE_KEYS.filter(k => !existingKeys.has(k))
    const newPages = Array.from(new Set([...existingKeys, ...toAdd]))
    await roleRepo.update({ id: adminRole.id }, { pages: newPages })
    console.log('已为角色添加页面权限:', newPages.length, '个')

    // 3. 创建或更新 admin 用户
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    let adminUser = await userRepo.findOne({ where: { username: ADMIN_USERNAME } })
    if (!adminUser) {
      adminUser = await userRepo.save(
        userRepo.create({ username: ADMIN_USERNAME, passwordHash, roles: null }),
      )
      console.log('已创建用户:', adminUser.username)
    } else {
      await userRepo.update({ id: adminUser.id }, { passwordHash })
      console.log('已更新用户密码:', adminUser.username)
    }

    // 4. 将 admin 用户绑定到管理员角色（User.roles 存角色编码 role，非 id）
    const roleCode = adminRole.role || ADMIN_ROLE_CODE
    const currentCodes: string[] = Array.isArray(adminUser.roles) ? adminUser.roles : []
    if (!roleCode) {
      console.log('角色缺少 role 编码，跳过用户绑定')
    } else if (currentCodes.includes(roleCode)) {
      console.log('用户已拥有角色:', adminRole.roleName)
    } else {
      await userRepo.update({ id: adminUser.id }, { roles: [...new Set([...currentCodes, roleCode])] })
      console.log('已为用户分配角色:', adminRole.roleName)
    }

    console.log('\n种子数据执行完成。')
    console.log('默认管理员账号:', ADMIN_USERNAME, '密码:', ADMIN_PASSWORD)
  } finally {
    // typeorm DataSource 由全局单例管理，这里无需显式断开
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
