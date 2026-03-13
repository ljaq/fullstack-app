import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { In } from 'typeorm'
import { getDataSource } from 'server/db'

const AUTH_COOKIE_KEY = 'auth_token'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret'

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
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

    const roleIds: number[] = user.roles ? JSON.parse(user.roles) : []
    const roleEntities = roleIds.length ? await roleRepo.findBy({ id: In(roleIds) }) : []

    const roles = roleEntities.map(r => r.name)
    const allowedPages = Array.from(
      new Set(
        roleEntities.flatMap(r => (r.pages ? (JSON.parse(r.pages) as string[]) : [])),
      ),
    )

    return {
      id: user.id,
      username: user.username,
      roles,
      allowedPages,
    }
  } catch {
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

