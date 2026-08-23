import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email'
const FALLBACK_CONTACT_EMAIL = 'whitemirrorlab.info@gmail.com'

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

export async function POST(req: Request) {
  const clientIp = getClientIp(req)
  const rateLimit = checkRateLimit({
    key: `contact:${clientIp}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Prueba mas tarde.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  let payload: {
    name?: string
    email?: string
    subject?: string
    message?: string
    locale?: string
  }

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = (payload.name ?? '').trim()
  const email = (payload.email ?? '').trim().toLowerCase()
  const subject = (payload.subject ?? '').trim()
  const message = (payload.message ?? '').trim()
  const locale = payload.locale === 'en' ? 'en' : 'es'

  if (!name || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 422 })
  }

  const apiKey = process.env.BREVO_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL ?? process.env.BREVO_CONTACT_TO_EMAIL ?? FALLBACK_CONTACT_EMAIL
  const senderEmail = process.env.CONTACT_FROM_EMAIL ?? process.env.BREVO_SENDER_EMAIL ?? FALLBACK_CONTACT_EMAIL
  const senderName = process.env.CONTACT_FROM_NAME ?? 'White Mirror Lab'

  if (!apiKey) {
    return NextResponse.json({ error: 'Brevo API key not configured' }, { status: 500 })
  }

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />')

  const res = await fetch(BREVO_SMTP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: toEmail }],
      replyTo: { name, email },
      subject: `Contacto WML: ${subject}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Idioma:</strong> ${locale}</p>
          <p><strong>Asunto:</strong> ${safeSubject}</p>
          <hr />
          <p>${safeMessage}</p>
        </div>
      `,
      textContent: [
        'Nuevo mensaje de contacto',
        `Nombre: ${name}`,
        `Email: ${email}`,
        `Idioma: ${locale}`,
        `Asunto: ${subject}`,
        '',
        message,
      ].join('\n'),
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    console.error('Brevo contact email error:', data)
    return NextResponse.json({ error: 'Error al enviar' }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { headers: rateLimitHeaders(rateLimit) })
}
