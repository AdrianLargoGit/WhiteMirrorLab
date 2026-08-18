import type { SubscribeSource } from './brevo-subscribe'

export const BREVO_COUNT_FALLBACK = 597

export const fetchBrevoCount = async (source: SubscribeSource) => {
  try {
    const res = await fetch(`/api/brevo-count?source=${source}`, { cache: 'no-store' })
    if (!res.ok) return BREVO_COUNT_FALLBACK

    const data = await res.json()
    return typeof data?.count === 'number' && Number.isFinite(data.count)
      ? data.count
      : BREVO_COUNT_FALLBACK
  } catch {
    return BREVO_COUNT_FALLBACK
  }
}
