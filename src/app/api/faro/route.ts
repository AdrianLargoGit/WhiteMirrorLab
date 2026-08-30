import { NextResponse } from 'next/server'
import {
  getFaroPublicState,
  setFaroAdminMessage,
  submitFaroMessage,
  verifyFaroPassword,
} from '@/lib/faro'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const password = searchParams.get('clave') ?? ''
  const adminSecret = searchParams.get('admin') ?? ''
  const isAdmin = Boolean(process.env.FARO_ADMIN_SECRET && adminSecret === process.env.FARO_ADMIN_SECRET)

  return NextResponse.json({
    ...getFaroPublicState(),
    canAccessForm: isAdmin || (password ? verifyFaroPassword(password) : false),
    isAdmin,
  })
}

export async function POST(req: Request) {
  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit({
    key: `faro:${clientIp}`,
    limit: 8,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Prueba mas tarde.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  let body: {
    password?: string
    adminSecret?: string
    message?: string
    author?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const result = body.adminSecret
    ? setFaroAdminMessage(body.adminSecret, body.message ?? '')
    : submitFaroMessage(body.password ?? '', body.message ?? '', body.author)

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status, headers: rateLimitHeaders(rateLimit) },
    )
  }

  return NextResponse.json(
    { ok: true, state: getFaroPublicState() },
    { headers: rateLimitHeaders(rateLimit) },
  )
}
