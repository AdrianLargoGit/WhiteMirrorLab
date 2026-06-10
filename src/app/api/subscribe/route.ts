import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const apiKey = process.env.LOOPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Loops API key not configured' }, { status: 500 })
  }

  let email: string
  try {
    const body = await req.json()
    email = (body.email ?? '').trim().toLowerCase()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 422 })
  }

  try {
    const res = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        source: 'wml-landing',
        subscribed: true,
        userGroup: 'waitlist',
      }),
    })

    const data = await res.json()

    if (!res.ok && res.status !== 409) {
      console.error('Loops error:', data)
      return NextResponse.json({ error: 'Error al suscribir' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Loops fetch error:', err)
    return NextResponse.json({ error: 'Error de red' }, { status: 500 })
  }
}
