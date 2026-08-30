import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getBrevoListContactEmails, getBrevoListId, sendBrevoEmail } from '@/lib/brevo-subscribe'
import { getFaroDailyPassword, getFaroTodayKey } from '@/lib/faro'

const getCronSecret = (req: Request) => {
  const auth = req.headers.get('authorization') ?? ''
  if (auth.startsWith('Bearer ')) return auth.slice('Bearer '.length).trim()

  const { searchParams } = new URL(req.url)
  return searchParams.get('secret') ?? ''
}

const getFaroListId = () => {
  const faroListId = Number(process.env.FARO_BREVO_LIST_ID)
  if (Number.isFinite(faroListId) && faroListId > 0) return faroListId

  return getBrevoListId('general')
}

const pickDailyEmail = (emails: string[], dateKey: string) => {
  const secret = process.env.FARO_PASSWORD_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'wml-faro-local-secret'
  const digest = crypto.createHmac('sha256', secret).update(`faro-pick:${dateKey}`).digest()
  const index = digest.readUInt32BE(0) % emails.length

  return emails[index]
}

export async function POST(req: Request) {
  if (!process.env.FARO_CRON_SECRET || getCronSecret(req) !== process.env.FARO_CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const listId = getFaroListId()
  if (!listId) {
    return NextResponse.json({ error: 'FARO_BREVO_LIST_ID no configurado' }, { status: 500 })
  }

  const dateKey = getFaroTodayKey()
  const contacts = await getBrevoListContactEmails(listId)

  if (!contacts.ok) {
    return NextResponse.json({ error: contacts.error }, { status: contacts.status })
  }

  if (contacts.emails.length === 0) {
    return NextResponse.json({ error: 'La lista de FARO no tiene contactos' }, { status: 422 })
  }

  const email = pickDailyEmail(contacts.emails, dateKey)
  const password = getFaroDailyPassword(dateKey)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.FARO_SITE_URL ?? new URL(req.url).origin).replace(/\/$/, '')
  const faroUrl = `${siteUrl}/faro?clave=${encodeURIComponent(password)}`

  const sendResult = await sendBrevoEmail({
    to: email,
    subject: 'Hoy FARO te mira a ti',
    textContent: [
      'Hoy te toca escribir el mensaje de FARO.',
      'Que le quieres decir al mundo?',
      '',
      `Contraseña de hoy: ${password}`,
      `Entra aquí antes de las 20:00, horario peninsular: ${faroUrl}`,
      '',
      'A las 20:00 se actualizará FARO con tu frase. Después de subirla no podrás editarla ni volver a entrar con esta contraseña.',
    ].join('\n'),
    htmlContent: `
      <p>Hoy te toca escribir el mensaje de <strong>FARO</strong>.</p>
      <p><strong>¿Qué le quieres decir al mundo?</strong></p>
      <p><strong>Contraseña de hoy:</strong> ${password}</p>
      <p>Entra antes de las <strong>20:00, horario peninsular</strong>:</p>
      <p><a href="${faroUrl}">${faroUrl}</a></p>
      <p>A las 20:00 se actualizará FARO con tu frase. Después de subirla no podrás editarla ni volver a entrar con esta contraseña.</p>
    `,
  })

  if (!sendResult.ok) {
    return NextResponse.json({ error: sendResult.error }, { status: sendResult.status })
  }

  return NextResponse.json({
    ok: true,
    dateKey,
    sentTo: email,
    listId,
  })
}
