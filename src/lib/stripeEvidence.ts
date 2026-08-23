import type { UnsolvedSerialCase } from './unsolvedSerialCases'

type StripeCheckoutSession = {
  id: string
  amount_total?: number | null
  currency?: string | null
  url?: string | null
  status?: string | null
  payment_status?: string | null
  metadata?: Record<string, string> | null
}

const STRIPE_API_BASE = 'https://api.stripe.com/v1'
const DEFAULT_EVIDENCE_PRICE_CENTS = 82
const DEFAULT_EVIDENCE_CURRENCY = 'eur'
const CASE_EVIDENCE_PRICE_CENTS: Record<string, number> = {
  'freeway-phantom': 68,
  'the-doodler': 68,
  'cleveland-torso': 134,
}

function requireEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

function readPositiveInteger(value: string | undefined) {
  if (!value) return null

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function priceEnvNameForSlug(slug: string) {
  return `STRIPE_BLOG_EVIDENCE_PRICE_CENTS_${slug.toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_')}`
}

export function getBlogEvidencePriceCents(caseFile?: Pick<UnsolvedSerialCase, 'slug'>) {
  if (caseFile) {
    return (
      readPositiveInteger(process.env[priceEnvNameForSlug(caseFile.slug)]) ??
      CASE_EVIDENCE_PRICE_CENTS[caseFile.slug] ??
      readPositiveInteger(process.env.STRIPE_BLOG_EVIDENCE_PRICE_CENTS) ??
      DEFAULT_EVIDENCE_PRICE_CENTS
    )
  }

  return readPositiveInteger(process.env.STRIPE_BLOG_EVIDENCE_PRICE_CENTS) ?? DEFAULT_EVIDENCE_PRICE_CENTS
}

export function getBlogEvidenceCurrency() {
  return (process.env.STRIPE_BLOG_EVIDENCE_CURRENCY ?? DEFAULT_EVIDENCE_CURRENCY).toLowerCase()
}

export function formatBlogEvidencePriceCents(locale: string, cents: number, currency = getBlogEvidenceCurrency()) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export function formatBlogEvidencePrice(locale: string, caseFile?: Pick<UnsolvedSerialCase, 'slug'>) {
  return formatBlogEvidencePriceCents(locale, getBlogEvidencePriceCents(caseFile))
}

export function getCheckoutSessionPrice(session: StripeCheckoutSession) {
  const amountTotal = session.amount_total

  if (!Number.isInteger(amountTotal) || !session.currency) {
    return null
  }

  return {
    cents: amountTotal as number,
    currency: session.currency,
  }
}

export function isStripeCheckoutSessionId(value: string | null | undefined) {
  return Boolean(value && /^cs_(test|live)_[A-Za-z0-9]+/.test(value))
}

async function stripeRequest<T>(endpoint: string, init: RequestInit) {
  const secretKey = requireEnv('STRIPE_SECRET_KEY')
  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...init.headers,
    },
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(`Stripe API error ${response.status}: ${JSON.stringify(payload)}`)
  }

  return payload as T
}

export async function createBlogEvidenceCheckout(input: {
  caseFile: UnsolvedSerialCase
  locale: 'es' | 'en'
  origin: string
}) {
  const { caseFile, locale, origin } = input
  const params = new URLSearchParams()
  const priceCents = getBlogEvidencePriceCents(caseFile)
  const receiptUrl = `${origin}/blog/evidence/receipt?case=${encodeURIComponent(caseFile.slug)}&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = new URL(locale === 'en' ? `/en/blog/${caseFile.slug}` : `/blog/${caseFile.slug}`, origin)

  params.set('mode', 'payment')
  params.set('success_url', receiptUrl)
  params.set('cancel_url', cancelUrl.toString())
  params.set('metadata[case_slug]', caseFile.slug)
  params.set('metadata[dossier_code]', caseFile.dossierCode)
  params.set('metadata[age_confirmed]', 'true')
  params.set('metadata[price_cents]', String(priceCents))
  params.set('line_items[0][quantity]', '1')
  params.set('line_items[0][price_data][currency]', getBlogEvidenceCurrency())
  params.set('line_items[0][price_data][unit_amount]', String(priceCents))
  params.set('line_items[0][price_data][product_data][name]', `WML evidence dossier: ${caseFile.title}`)
  params.set(
    'line_items[0][price_data][product_data][description]',
    'Downloadable public-source evidence ZIP from White Mirror Lab. Best viewed on PC.',
  )

  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
  })
}

export function isPaidEvidenceSession(session: StripeCheckoutSession, caseSlug: string) {
  return (
    session.payment_status === 'paid' &&
    session.status === 'complete' &&
    session.metadata?.case_slug === caseSlug &&
    session.metadata?.age_confirmed === 'true'
  )
}
