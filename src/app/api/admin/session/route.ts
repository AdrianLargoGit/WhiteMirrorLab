import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import {
  createMarketplaceAdminSession,
  marketplaceAdminCookie,
  verifyMarketplaceAdminToken,
} from '@/lib/marketplaceAdmin'

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const limit = checkRateLimit({ key: `marketplace-admin:${getClientIp(request)}`, limit: 10, windowMs: 3600000 })
  if (!limit.ok) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  const length = Number(request.headers.get('content-length'))
  if (Number.isFinite(length) && length > 4096) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 413 })
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 415 })
  }
  let token: string
  try {
    const reader = request.body?.getReader()
    if (!reader) throw new Error('Missing body')
    const chunks: Uint8Array[] = []
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > 4096) {
        await reader.cancel()
        return NextResponse.json({ error: 'Invalid request' }, { status: 413 })
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    token = new URLSearchParams(new TextDecoder('utf-8', { fatal: true }).decode(bytes)).get('token') ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const response = NextResponse.redirect(new URL('/admin', request.url), 303)
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  if (verifyMarketplaceAdminToken(token)) {
    response.cookies.set(marketplaceAdminCookie.name, createMarketplaceAdminSession(), marketplaceAdminCookie.options)
  }
  return response
}
