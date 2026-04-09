import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { BtnPermissionCode } from 'types/permissions'
import { UnauthorizedError, ForbiddenError } from 'server/errors/app-error'

const AUTH_COOKIE_KEY = 'auth_token'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret'

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

/** 与 setAuthCookie 使用同一密钥与 payload，仅供开发态快照等场景，不校验密码 */
export function signAuthTokenForDevSnapshot(userId: number) {
  return jwt.sign({ userId }, AUTH_SECRET, { expiresIn: '7d' })
}

export function setAuthCookie(c: Context, payload: { userId: number }) {
  const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' })
  setCookie(c, AUTH_COOKIE_KEY, token, {
    httpOnly: true,
    secure: process.env.VITE_ENVIRONMENT === 'production',
    sameSite: 'Lax',
    path: '/',
  })
}

export function clearAuthCookie(c: Context) {
  deleteCookie(c, AUTH_COOKIE_KEY, { path: '/' })
}

/** 从 token 中获取用户 ID（不含完整用户信息） */
export async function getUserIdFromToken(c: Context): Promise<number | null> {
  const token = getCookie(c, AUTH_COOKIE_KEY)
  if (!token) return null

  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as { userId: number }
    return decoded.userId
  } catch (error) {
    return null
  }
}

/** 获取当前用户（包含角色权限信息） */
export async function getCurrentUser(c: Context) {
  const userId = await getUserIdFromToken(c)
  if (!userId) return null

  try {
    // 动态导入以避免循环依赖
    const { getService } = await import('server/container/service-helpers')
    const service = getService()

    const user = await service.userRepo.findById(userId)
    if (!user) return null

    const roles: string[] = (user.roles ?? []).filter(Boolean)
    const roleEntities = roles.length ? await service.roleRepo.findByRoles(roles) : []

    const roleNames = roleEntities.map(r => r.roleName)
    const pages = Array.from(new Set(roleEntities.flatMap(r => r.pages ?? [])))
    const buttons = Array.from(new Set(roleEntities.flatMap(r => r.buttons ?? [])))

    return {
      id: user.id,
      username: user.username,
      roles,
      roleNames,
      pages,
      buttons,
    }
  } catch (error) {
    console.log('Error getting current user:', error)
    return null
  }
}

/**
 * 认证中间件
 * 验证用户是否已登录，未登录则抛出 UnauthorizedError
 */
export async function requireAuth(c: Context, next: () => Promise<void>) {
  const currentUser = await getCurrentUser(c)
  if (!currentUser) {
    throw new UnauthorizedError('用户未登录')
  }
  c.set('user', currentUser)
  await next()
}

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

/**
 * 权限校验中间件
 * 需在 requireAuth 之后使用：校验当前用户是否具备指定按钮权限（管理员角色放行）
 * @param code - 按钮权限编码
 */
export function requirePermission(code: BtnPermissionCode) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user') as CurrentUser | undefined
    if (!user) {
      throw new UnauthorizedError('用户未登录')
    }

    // 管理员放行
    if (user.roles?.includes('admin')) {
      await next()
      return
    }

    // 检查按钮权限
    const keys = user.buttons ?? []
    if (!keys.includes(code)) {
      throw new ForbiddenError('权限不足')
    }

    await next()
  }
}
