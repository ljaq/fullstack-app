import type { Context } from 'hono'
import jwt from 'jsonwebtoken'
import type { BtnPermissionCode } from '../../types/permissions'
import { UnauthorizedError, ForbiddenError } from '../errors/app-error'
import { getAuthSecret } from './jwt'

export { signAuthToken, signAuthTokenForDevSnapshot } from './jwt'

function getBearerToken(c: Context): string | null {
  const auth = c.req.header('Authorization') ?? c.req.header('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  return token || null
}

export async function getUserIdFromToken(c: Context): Promise<number | null> {
  const token = getBearerToken(c)
  if (!token) return null

  try {
    const decoded = jwt.verify(token, getAuthSecret()) as { userId: number }
    return decoded.userId
  } catch {
    return null
  }
}

export async function getCurrentUser(c: Context) {
  const userId = await getUserIdFromToken(c)
  if (!userId) return null

  try {
    const { authService } = await import('../services/auth.service')
    return await authService.loadSession(userId)
  } catch (error) {
    console.log('Error getting current user:', error)
    return null
  }
}

export async function requireAuth(c: Context, next: () => Promise<void>) {
  const currentUser = await getCurrentUser(c)
  if (!currentUser) {
    throw new UnauthorizedError('用户未登录')
  }
  c.set('user', currentUser)
  await next()
}

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>

export function requirePermission(code: BtnPermissionCode) {
  return async (c: Context, next: () => Promise<void>) => {
    const user = c.get('user') as CurrentUser | undefined
    if (!user) {
      throw new UnauthorizedError('用户未登录')
    }

    if (user.roles?.includes('admin')) {
      await next()
      return
    }

    const keys = user.buttons ?? []
    if (!keys.includes(code)) {
      throw new ForbiddenError('权限不足')
    }

    await next()
  }
}

export async function requireAdmin(c: Context, next: () => Promise<void>) {
  const user = c.get('user') as CurrentUser | undefined
  if (!user) {
    throw new UnauthorizedError('用户未登录')
  }
  if (!user.roles?.includes('admin')) {
    throw new ForbiddenError('需要管理员权限')
  }
  await next()
}
