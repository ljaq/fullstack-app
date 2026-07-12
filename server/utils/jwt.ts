import jwt from 'jsonwebtoken'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret'

export function signAuthToken(payload: { userId: number }) {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' })
}

export const signAuthTokenForDevSnapshot = (userId: number) => signAuthToken({ userId })

export function getAuthSecret() {
  return AUTH_SECRET
}
