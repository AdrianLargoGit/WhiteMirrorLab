import { NextResponse } from 'next/server'
import { subscribeEmailToBrevo, type SubscribeSource } from '@/lib/brevo-subscribe'

export async function POST(req: Request) {
  let email: string
  let source: SubscribeSource = 'general'

  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
    source = body.source === 'tech' || body.source === 'social' ? body.source : 'general'
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invÃ¡lido' }, { status: 422 })
  }

  try {
    const result = await subscribeEmailToBrevo(email, source)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Brevo fetch error:', err)
    return NextResponse.json({ error: 'Error de red' }, { status: 500 })
  }
}
