import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'wml_marketplace_admin'
const SESSION_SECONDS = 8 * 60 * 60

function adminSecret() {
  return process.env.MARKETPLACE_ADMIN_TOKEN?.trim() || null
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left)
  const rightBytes = Buffer.from(right)
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes)
}

function signature(secret: string, payload: string) {
  return createHmac('sha256', secret).update(`marketplace-admin:v1:${payload}`).digest('hex')
}

export function verifyMarketplaceAdminToken(value: string) {
  const secret = adminSecret()
  return Boolean(secret && safeEqual(value, secret))
}

export function createMarketplaceAdminSession() {
  const secret = adminSecret()
  if (!secret) throw new Error('Missing MARKETPLACE_ADMIN_TOKEN')
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const payload = `${expires}.${randomBytes(16).toString('hex')}`
  return `${payload}.${signature(secret, payload)}`
}

export function verifyMarketplaceAdminSession(value: string | undefined) {
  const secret = adminSecret()
  if (!secret || !value || !/^\d{10}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(value)) return false
  const [expiresText, nonce, received] = value.split('.')
  const expires = Number(expiresText)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isSafeInteger(expires) || expires <= now || expires > now + SESSION_SECONDS) return false
  return safeEqual(received, signature(secret, `${expiresText}.${nonce}`))
}

export const marketplaceAdminCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SESSION_SECONDS,
  },
}

export async function isMarketplaceAdmin() {
  return verifyMarketplaceAdminSession((await cookies()).get(COOKIE_NAME)?.value)
}
