import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { In } from 'typeorm'
import { getDataSource } from '../db'

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

export async function getCurrentUser(c: Context) {
  const token = getCookie(c, AUTH_COOKIE_KEY)
  if (!token) return null
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as { userId: number }
    const ds = await getDataSource()
    const userRepo = ds.getRepository('User')
    const roleRepo = ds.getRepository('Role')

    const user = await userRepo.findOne({ where: { id: decoded.userId } })
    if (!user) return null

    const roleCodes: string[] = (user.roles ?? []).filter(Boolean) as string[]
    const roleEntities = roleCodes.length
      ? await roleRepo.findBy({ role: In(roleCodes) })
      : []

    const roles = roleCodes
    const roleNames = roleEntities.map(r => r.roleName)
    const paegs = Array.from(
      new Set(roleEntities.flatMap(r => (r.pages ?? []))),
    )

    return {
      id: user.id,
      username: user.username,
      roles,
      roleNames,
      paegs,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export async function requireAuth(c: Context, next: () => Promise<void>) {
  const currentUser = await getCurrentUser(c)
  if (!currentUser) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
  c.set('user', currentUser)
  await next()
}
