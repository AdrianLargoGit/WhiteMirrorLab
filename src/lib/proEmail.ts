import { isValidEmailAddress } from './emailValidation'
import { ProError, proOrigin, type ProBillingPlan } from './proConfig'
import type { ProLicense } from './proLicense'

export async function sendPaidProLicenseEmail(input: {
  email: string
  plan: ProBillingPlan
  paidUntil: number
  license: ProLicense
  purpose?: 'renewal' | 'recovery'
}) {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const sender = process.env.WML_PRO_FROM_EMAIL?.trim() || process.env.CONTACT_FROM_EMAIL?.trim() || process.env.BREVO_SENDER_EMAIL?.trim() || process.env.FARO_FROM_EMAIL?.trim() || 'Sender@whitemirrorlab.com'
  if (!apiKey || !sender || !isValidEmailAddress(input.email) || !isValidEmailAddress(sender)) {
    throw new ProError('pro_email_not_configured')
  }

  const until = new Date(input.paidUntil * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  const cadence = input.plan === 'annual' ? 'anual' : 'mensual'
  const recovery = input.purpose === 'recovery'
  const portalUrl = `${proOrigin()}/api/pro/portal`
  // Brevo accepts .txt attachments, not .json. The attached text contains the
  // exact signed JSON and is directly importable through the widget's file picker.
  const content = Buffer.from(`${JSON.stringify(input.license, null, 2)}\n`, 'utf8').toString('base64')
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { name: 'White Mirror Lab', email: sender },
      to: [{ email: input.email }],
      subject: recovery ? 'Recupera tu licencia WML Pro' : 'Tu nuevo periodo WML Pro está activo',
      htmlContent: `<div style="font-family:Arial,sans-serif;color:#1d2127;line-height:1.6;max-width:600px;margin:auto"><div style="padding:28px;background:#1d2127;color:#fff"><p style="letter-spacing:.18em;font-size:12px">WHITE MIRROR LAB · PRO</p><h1 style="margin:8px 0 0;font-size:26px">${recovery ? 'Aquí tienes tu licencia Pro.' : 'Tu Pro continúa contigo.'}</h1></div><div style="padding:28px;border:1px solid #ddd"><p>${recovery ? 'Tu plan sigue activo.' : `Hemos confirmado tu pago ${cadence}.`} Tu acceso está cubierto hasta el <strong>${until}</strong>.</p><p>${recovery ? 'Adjuntamos una copia de tu licencia activa' : 'Tu widget actualizará la licencia automáticamente cuando se conecte. También adjuntamos una copia nueva'}, <strong>pro-license.txt</strong>. Descárgala e impórtala desde Ajustes → Importar licencia. El archivo contiene el JSON firmado; no edites su contenido. La licencia es personal y permanece vinculada al ordenador donde se activó.</p><p>Gestiona la renovación en el <a href="${portalUrl}">portal de suscripción</a>, con verificación de email.</p></div></div>`,
      textContent: `${recovery ? 'Aquí tienes tu licencia WML Pro.' : 'Tu Pro continúa contigo.'}\n\n${recovery ? 'Tu plan sigue activo.' : `Pago ${cadence} confirmado.`} Acceso cubierto hasta el ${until}.\n\nDescarga el archivo adjunto pro-license.txt y selecciónalo en Ajustes > Importar licencia. Contiene tu licencia firmada; no edites su contenido. Es personal y sigue vinculada al ordenador donde se activó.\n\nGestiona la renovación en ${portalUrl} (verificación de email).\n\nWhite Mirror Lab`,
      attachment: [{ name: 'pro-license.txt', content }],
    }),
  })
  if (!response.ok) throw new ProError('pro_email_delivery_failed')
}
