type MarketplaceEmailStatus = 'submitted' | 'approved' | 'rejected'

const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email'
const FALLBACK_FROM_EMAIL = 'Sender@whitemirrorlab.com'
const FALLBACK_FROM_NAME = 'White Mirror Lab'

const copy = {
  submitted: {
    subject: 'Hemos recibido tu skin en White Mirror Lab',
    title: 'Tu skin esta en revision.',
    body:
      'Hemos recibido tu pack correctamente. Nuestro equipo lo revisara antes de publicarlo en el marketplace de WML X.X.0.',
    footer:
      'Te avisaremos por este email cuando el pack sea aprobado o rechazado.',
  },
  approved: {
    subject: 'Tu skin ha sido aprobada en White Mirror Lab',
    title: 'Tu skin ha sido aprobada.',
    body:
      'Enhorabuena. Hemos revisado tu pack y ya esta preparado para entrar en el marketplace de WML X.X.0.',
    footer:
      'Conservaremos solo la informacion necesaria para publicar el producto, avisarte de cambios de estado y gestionar soporte.',
  },
  rejected: {
    subject: 'Tu skin no ha sido aprobada en White Mirror Lab',
    title: 'Tu skin no ha sido aprobada.',
    body:
      'Lo sentimos. Hemos revisado tu pack y no podemos publicarlo en el marketplace en este momento.',
    footer:
      'El ZIP y la informacion de esta subida se eliminaran de nuestros sistemas de revision.',
  },
} satisfies Record<MarketplaceEmailStatus, {
  subject: string
  title: string
  body: string
  footer: string
}>

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function sendMarketplaceStatusEmail(input: {
  to: string
  productTitle: string
  status: MarketplaceEmailStatus
}) {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    return { ok: false, error: 'Brevo API key not configured' }
  }

  const senderEmail = process.env.MARKETPLACE_FROM_EMAIL ??
    process.env.CONTACT_FROM_EMAIL ??
    process.env.BREVO_SENDER_EMAIL ??
    FALLBACK_FROM_EMAIL
  const senderName = process.env.MARKETPLACE_FROM_NAME ??
    process.env.CONTACT_FROM_NAME ??
    FALLBACK_FROM_NAME
  const message = copy[input.status]
  const safeTitle = escapeHtml(input.productTitle)

  const response = await fetch(BREVO_SMTP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: input.to }],
      subject: message.subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.55;">
          <h2>${message.title}</h2>
          <p><strong>Producto:</strong> ${safeTitle}</p>
          <p>${message.body}</p>
          <p>${message.footer}</p>
          <hr />
          <p style="color:#555;font-size:12px;">White Mirror Lab</p>
        </div>
      `,
      textContent: [
        message.title,
        '',
        `Producto: ${input.productTitle}`,
        '',
        message.body,
        message.footer,
        '',
        'White Mirror Lab',
      ].join('\n'),
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    console.error('Brevo marketplace status email error:', data)
    return { ok: false, error: 'Unable to send marketplace status email' }
  }

  return { ok: true }
}
