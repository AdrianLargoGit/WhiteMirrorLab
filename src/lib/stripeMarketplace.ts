import {
  getMarketplaceCurrency,
  getMarketplacePlatformFeeCents,
  toMinorCurrencyUnit,
} from './marketplacePricing'

type StripeCheckoutSession = {
  id: string
  url?: string | null
  status?: string | null
  payment_status?: string | null
  metadata?: Record<string, string> | null
}

const STRIPE_API_BASE = 'https://api.stripe.com/v1'

function requireEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

async function stripeRequest<T>(endpoint: string, init: RequestInit) {
  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv('STRIPE_SECRET_KEY')}`,
      ...init.headers,
    },
  })
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(`Stripe API error ${response.status}: ${JSON.stringify(payload)}`)
  }

  return payload as T
}

export function isStripeCheckoutSessionId(value: string | null | undefined) {
  return Boolean(value && /^cs_(test|live)_[A-Za-z0-9]+/.test(value))
}

export function isStripeConnectAccountId(value: string | null | undefined) {
  return Boolean(value && /^acct_[A-Za-z0-9]+$/.test(value))
}

export async function createMarketplaceStripeCheckout(input: {
  id: string
  title: string
  description?: string | null
  price: number
  creatorEmail: string
  stripeAccountId: string
  origin: string
}) {
  const amount = toMinorCurrencyUnit(input.price)
  const platformFee = getMarketplacePlatformFeeCents(input.price)
  const params = new URLSearchParams()
  const receiptUrl = `${input.origin}/marketplace/receipt?product=${encodeURIComponent(input.id)}&session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = new URL(`/marketplace/${input.id}`, input.origin)

  params.set('mode', 'payment')
  params.set('managed_payments[enabled]', 'false')
  params.set('success_url', receiptUrl)
  params.set('cancel_url', cancelUrl.toString())
  params.set('metadata[marketplace_product_id]', input.id)
  params.set('metadata[creator_email]', input.creatorEmail)
  params.set('metadata[stripe_account_id]', input.stripeAccountId)
  params.set('payment_intent_data[metadata][marketplace_product_id]', input.id)
  params.set('payment_intent_data[metadata][creator_email]', input.creatorEmail)
  params.set('payment_intent_data[metadata][stripe_account_id]', input.stripeAccountId)
  params.set('payment_intent_data[application_fee_amount]', String(platformFee))
  params.set('payment_intent_data[transfer_data][destination]', input.stripeAccountId)
  params.set('line_items[0][quantity]', '1')
  params.set('line_items[0][price_data][currency]', getMarketplaceCurrency().toLowerCase())
  params.set('line_items[0][price_data][unit_amount]', String(amount))
  params.set('line_items[0][price_data][product_data][name]', input.title)
  params.set(
    'line_items[0][price_data][product_data][description]',
    input.description?.trim() || 'White Mirror Lab marketplace creator pack.',
  )

  return stripeRequest<StripeCheckoutSession>('/checkout/sessions', {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

export async function retrieveMarketplaceStripeCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
  })
}

export function isPaidMarketplaceSession(
  session: StripeCheckoutSession,
  product: { id: string; stripe_account_id?: string | null },
) {
  return (
    session.payment_status === 'paid' &&
    session.status === 'complete' &&
    session.metadata?.marketplace_product_id === product.id &&
    (!product.stripe_account_id || session.metadata?.stripe_account_id === product.stripe_account_id)
  )
}
