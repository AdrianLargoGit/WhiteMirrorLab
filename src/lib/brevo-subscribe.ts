export type SubscribeSource = 'general' | 'tech' | 'social'

const BREVO_CONTACTS_URL = 'https://api.brevo.com/v3/contacts'

const parseListId = (value: string | undefined) => {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : null
}

const uniqueIds = (ids: Array<number | null | undefined>) => (
  Array.from(new Set(ids.filter((id): id is number => typeof id === 'number' && Number.isFinite(id) && id > 0)))
)

const getConfiguredListIds = (source: SubscribeSource) => {
  const generalListId = parseListId(process.env.BREVO_LIST_ID_GENERAL ?? process.env.BREVO_GENERAL_LIST_ID ?? process.env.BREVO_LIST_ID)
  const sourceListId = source === 'tech'
    ? parseListId(process.env.BREVO_LIST_ID_TECH ?? process.env.BREVO_TECH_LIST_ID)
    : source === 'social'
      ? parseListId(process.env.BREVO_LIST_ID_SOCIAL ?? process.env.BREVO_SOCIAL_LIST_ID)
      : null

  return uniqueIds([generalListId, sourceListId])
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
