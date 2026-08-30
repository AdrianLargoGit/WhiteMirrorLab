import { BREVO_COUNT_FALLBACK } from './brevo-count'

export type SubscribeSource = 'general' | 'tech' | 'social' | 'faro'

const BREVO_CONTACTS_URL = 'https://api.brevo.com/v3/contacts'
const BREVO_LISTS_URL = `${BREVO_CONTACTS_URL}/lists`
const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email'

const parseListId = (value: string | undefined) => {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

const uniqueIds = (ids: Array<number | null | undefined>) => (
  Array.from(new Set(ids.filter((id): id is number => typeof id === 'number' && Number.isFinite(id) && id > 0)))
)

const getConfiguredListIds = (source: SubscribeSource) => {
  const generalListId = getBrevoListId('general')
  const sourceListId = source === 'general' ? null : getBrevoListId(source)

  return uniqueIds([generalListId, sourceListId])
}

export const getBrevoListId = (source: SubscribeSource) => {
  const generalListId = parseListId(process.env.BREVO_LIST_ID_GENERAL ?? process.env.BREVO_GENERAL_LIST_ID ?? process.env.BREVO_LIST_ID)

  if (source === 'tech') return parseListId(process.env.BREVO_LIST_ID_TECH ?? process.env.BREVO_TECH_LIST_ID)
  if (source === 'social') return parseListId(process.env.BREVO_LIST_ID_SOCIAL ?? process.env.BREVO_SOCIAL_LIST_ID)
  if (source === 'faro') return parseListId(process.env.FARO_BREVO_LIST_ID ?? process.env.BREVO_LIST_ID_FARO ?? process.env.BREVO_FARO_LIST_ID)
  return generalListId
}

const getExistingListIds = async (email: string, apiKey: string) => {
  const res = await fetch(`${BREVO_CONTACTS_URL}/${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: { 'api-key': apiKey },
  })

  if (res.status === 404) return []

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    console.error('Brevo contact lookup error:', data)
    return []
  }

  const data = await res.json().catch(() => null)
  return Array.isArray(data?.listIds)
    ? data.listIds.filter((id: unknown): id is number => typeof id === 'number' && Number.isFinite(id))
    : []
}

export const subscribeEmailToBrevo = async (email: string, source: SubscribeSource = 'general') => {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Brevo API key not configured' }
  }

  const configuredListIds = getConfiguredListIds(source)
  const existingListIds = await getExistingListIds(email, apiKey)
  const listIds = uniqueIds([...existingListIds, ...configuredListIds])

  const res = await fetch(BREVO_CONTACTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      emailBlacklisted: false,
      updateEnabled: true,
      ...(listIds.length > 0 ? { listIds } : {}),
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    console.error('Brevo error:', data)
    return { ok: false, status: 502, error: 'Error al suscribir' }
  }

  return { ok: true, status: 200 }
}

export const getBrevoListCount = async (source: SubscribeSource = 'general') => {
  const apiKey = process.env.BREVO_API_KEY
  const listId = getBrevoListId(source)

  if (!apiKey || !listId) {
    return { ok: false, status: 500, count: BREVO_COUNT_FALLBACK, error: 'Brevo list count not configured' }
  }

  const res = await fetch(`${BREVO_LISTS_URL}/${listId}/contacts?limit=1&offset=0`, {
    method: 'GET',
    headers: { 'api-key': apiKey },
    cache: 'no-store',
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    console.error('Brevo list count error:', data)
    return { ok: false, status: 502, count: BREVO_COUNT_FALLBACK, error: 'Error al leer el contador' }
  }

  return {
    ok: true,
    status: 200,
    count: typeof data?.count === 'number' && Number.isFinite(data.count) ? data.count : BREVO_COUNT_FALLBACK,
  }
}

export const getBrevoListContactEmails = async (listId: number) => {
  const apiKey = process.env.BREVO_API_KEY

  if (!apiKey) {
    return { ok: false as const, status: 500, emails: [], error: 'Brevo API key not configured' }
  }

  const emails: string[] = []
  let offset = 0
  const limit = 500

  while (offset < 10000) {
    const res = await fetch(`${BREVO_LISTS_URL}/${listId}/contacts?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: { 'api-key': apiKey },
      cache: 'no-store',
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      console.error('Brevo FARO contacts error:', data)
      return { ok: false as const, status: 502, emails: [], error: 'Error al leer contactos de Brevo' }
    }

    const contacts = Array.isArray(data?.contacts) ? data.contacts : []
    contacts.forEach((contact: { email?: unknown; emailBlacklisted?: unknown }) => {
      if (typeof contact.email === 'string' && contact.email.includes('@') && contact.emailBlacklisted !== true) {
        emails.push(contact.email.trim().toLowerCase())
      }
    })

    if (contacts.length < limit) break
    offset += limit
  }

  return { ok: true as const, status: 200, emails: Array.from(new Set(emails)) }
}

export const sendBrevoEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string
  subject: string
  htmlContent: string
  textContent: string
}) => {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.FARO_FROM_EMAIL ?? process.env.BREVO_FROM_EMAIL
  const senderName = process.env.FARO_FROM_NAME ?? process.env.BREVO_FROM_NAME ?? 'White Mirror Lab'

  if (!apiKey || !senderEmail) {
    return { ok: false as const, status: 500, error: 'Brevo sender not configured' }
  }

  const res = await fetch(BREVO_SMTP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    console.error('Brevo FARO send error:', data)
    return { ok: false as const, status: 502, error: 'Error al enviar email de FARO' }
  }

  return { ok: true as const, status: 200 }
}
