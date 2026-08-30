import { NextResponse } from 'next/server'
import { subscribeEmailToBrevo, type SubscribeSource } from '@/lib/brevo-subscribe'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

export async function POST(req: Request) {
  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit({
    key: `subscribe:${clientIp}`,
    limit: 12,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Prueba mas tarde.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  let email: string
  let source: SubscribeSource = 'general'

  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
    source = body.source === 'tech' || body.source === 'social' || body.source === 'faro' ? body.source : 'general'
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 422 })
  }

  try {
    const result = await subscribeEmailToBrevo(email, source)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(rateLimit) })
  } catch (err) {
    console.error('Brevo fetch error:', err)
    return NextResponse.json({ error: 'Error de red' }, { status: 500 })
  }
}
