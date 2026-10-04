import { randomUUID } from 'node:crypto'
import { PRO_PLANS, PRO_PRICE_LOOKUP_VERSION, ProError, proEnv, proOrigin, proPriceId, type ProBillingPlan } from './proConfig'
import { proHash } from './proLicense'
import { makeProLicense } from './proLicense'
import { sendPaidProLicenseEmail } from './proEmail'

type StripeList<T> = { data: T[]; has_more?: boolean }
type Price = { id: string; active: boolean; currency: string; unit_amount: number; recurring?: { interval: string; interval_count: number } }
type Charge = { id: string; amount: number; amount_refunded: number; disputed: boolean; invoice?: string | null }
type Invoice = {
  id: string; subscription: string; status: string; paid: boolean; charge?: string | Charge | null
  amount_paid?: number; currency?: string; hosted_invoice_url?: string | null
  lines: StripeList<{ price?: Price; subscription_item?: string; period: { start: number; end: number } }>
}
export type ProSubscription = {
  id: string; customer: string; created: number; status: string; current_period_end: number; cancel_at?: number | null
  metadata: Record<string, string>; latest_invoice?: string | Invoice | null
  items: StripeList<{ id: string; price: Price; quantity: number }>
}
export type ProCheckout = {
  id: string; url?: string; mode: string; status: string; payment_status: string
  subscription: string | null; customer: string | null; metadata: Record<string, string>
}

// Pin the wire schema (invoice.charge, invoice.subscription, current_period_end).
// Stripe continues to support this API version independently of Dashboard defaults.
export async function proStripeRequest<T>(endpoint: string, params?: URLSearchParams, idempotencyKey?: string): Promise<T> {
  const key = process.env.WML_PRO_STRIPE_SECRET_KEY?.trim() || proEnv('STRIPE_SECRET_KEY')
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: params ? 'POST' : 'GET',
    body: params,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${key}`,
      'Stripe-Version': '2024-06-20',
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    if (payload?.error?.type === 'idempotency_error') throw new ProError('device_limit_reached', 403)
    if (payload?.error?.code === 'resource_already_exists') throw new ProError('stripe_resource_exists', 409)
    if (payload?.error?.code === 'resource_missing') throw new ProError('pro_not_found', 404)
    throw new ProError('stripe_unavailable')
  }
  return response.json() as Promise<T>
}

export async function existingProSubscriber(email: string) {
  // Email alone never grants a private portal session or a license. Existing
  // subscribers go to Stripe's email verification page to manage their plan.
  const customers = await proStripeRequest<StripeList<{ id: string }>>(`/customers?email=${encodeURIComponent(email)}&limit=100`)
  if (customers.has_more) throw new ProError('pro_customer_lookup_incomplete')
  for (const customer of customers.data) {
    let cursor = ''
    while (true) {
      const page = await proStripeRequest<StripeList<ProSubscription>>(`/subscriptions?customer=${customer.id}&status=all&limit=100${cursor ? `&starting_after=${cursor}` : ''}`)
      if (page.data.some(sub => sub.metadata?.wml_product === 'wml-pro' && ['active', 'past_due', 'unpaid', 'trialing'].includes(sub.status))) return true
      if (!page.has_more || !page.data.length) break
      cursor = page.data.at(-1)!.id
    }
  }
  return false
}

export async function paidProEntitlementForEmail(email: string) {
  const customers = await proStripeRequest<StripeList<{ id: string }>>(`/customers?email=${encodeURIComponent(email)}&limit=100`)
  if (customers.has_more) throw new ProError('pro_customer_lookup_incomplete')
  for (const customer of customers.data) {
    let cursor = ''
    while (true) {
      const page = await proStripeRequest<StripeList<ProSubscription>>(`/subscriptions?customer=${customer.id}&status=all&limit=100${cursor ? `&starting_after=${cursor}` : ''}`)
      for (const subscription of page.data) {
        if (subscription.metadata?.wml_product !== 'wml-pro' || !['active', 'past_due'].includes(subscription.status)) continue
        try {
          return await paidProEntitlement(await retrieveProSubscription(subscription.id))
        } catch (error) {
          if (!(error instanceof ProError) || !['license_inactive', 'license_revoked', 'invalid_pro_subscription'].includes(error.code)) throw error
        }
      }
      if (!page.has_more || !page.data.length) break
      cursor = page.data.at(-1)!.id
    }
  }
  return null
}

function isProPrice(price: Price, plan: ProBillingPlan, expectedId?: string) {
  const expected = PRO_PLANS[plan]
  return /^price_[A-Za-z0-9]+$/.test(price.id) && (!expectedId || price.id === expectedId) &&
    price.currency === 'eur' &&
    price.unit_amount === expected.amount &&
    price.recurring?.interval === expected.interval && price.recurring.interval_count === 1
}

function checkPrice(price: Price, plan: ProBillingPlan, expectedId?: string) {
  if (!isProPrice(price, plan, expectedId)) throw new ProError('pro_price_mismatch')
}

export async function resolveProPrice(plan: ProBillingPlan) {
  const configured = proPriceId(plan)
  let price: Price
  if (configured) {
    price = await proStripeRequest<Price>(`/prices/${configured}`)
  } else {
    const lookup = `wml-pro-${plan}-eur-${PRO_PRICE_LOOKUP_VERSION}`
    const prices = await proStripeRequest<StripeList<Price>>(`/prices?lookup_keys[]=${lookup}&limit=1`)
    if (prices.data.length) {
      price = prices.data[0]
    } else {
      // A stable product ID and price lookup key survive restarts and key rotation.
      // Concurrent instances share the same idempotency key.
      const product = await proStripeRequest<{ id: string }>('/products', new URLSearchParams({
        id: 'wml_pro_v1', name: 'WML X.X.0 Pro', 'metadata[wml_product]': 'wml-pro',
      }), 'wml-pro-product-v1').catch(async error => {
        if (!(error instanceof ProError) || error.code !== 'stripe_resource_exists') throw error
        return proStripeRequest<{ id: string }>('/products/wml_pro_v1')
      })
      price = await proStripeRequest<Price>('/prices', new URLSearchParams({
        product: product.id, currency: 'eur', unit_amount: String(PRO_PLANS[plan].amount),
        'recurring[interval]': PRO_PLANS[plan].interval, lookup_key: lookup,
      }), `wml-pro-price-${plan}-${PRO_PRICE_LOOKUP_VERSION}`)
    }
  }
  checkPrice(price, plan, configured)
  if (!price.active) throw new ProError('pro_price_inactive')
  return price.id
}

export async function createProCheckout(input: { email: string; plan: ProBillingPlan; locale: 'es' | 'en'; accessToken: string; origin?: string }) {
  const priceId = await resolveProPrice(input.plan)
  const origin = input.origin ?? proOrigin()
  const params = new URLSearchParams({
    mode: 'subscription',
    customer_email: input.email,
    locale: input.locale,
    'payment_method_types[0]': 'card',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/api/pro/return?session_id={CHECKOUT_SESSION_ID}&lang=${input.locale}`,
    cancel_url: `${origin}${input.locale === 'en' ? '/en/download' : '/descargar'}?pro=cancelled`,
    'metadata[wml_product]': 'wml-pro',
    'metadata[wml_access_hash]': proHash(input.accessToken),
    'metadata[wml_checkout_origin]': origin,
    'subscription_data[metadata][wml_product]': 'wml-pro',
    'subscription_data[metadata][wml_plan]': input.plan,
    'subscription_data[metadata][wml_price_id]': priceId,
    'subscription_data[metadata][wml_license_id]': randomUUID(),
  })
  return proStripeRequest<ProCheckout>('/checkout/sessions', params, `wml-pro-checkout-${randomUUID()}`)
}

export function isProSessionId(value: unknown): value is string {
  return typeof value === 'string' && /^cs_(test|live)_[A-Za-z0-9]+$/.test(value)
}

export async function ownedProCheckout(sessionId: string, accessToken?: string) {
  if (!isProSessionId(sessionId) || !accessToken || !/^[a-f0-9]{64}$/.test(accessToken)) throw new ProError('checkout_not_owned', 401)
  const session = await proStripeRequest<ProCheckout>(`/checkout/sessions/${sessionId}`)
  if (session.mode !== 'subscription' || session.metadata?.wml_product !== 'wml-pro' ||
      session.metadata.wml_access_hash !== proHash(accessToken)) throw new ProError('checkout_not_owned', 401)
  return session
}

export function requirePaidCheckout(session: ProCheckout) {
  if (session.status !== 'complete' || session.payment_status !== 'paid' || !session.subscription || !session.customer) {
    throw new ProError('payment_pending', 409)
  }
}

export async function retrieveProSubscription(id: string) {
  if (!/^sub_[A-Za-z0-9]+$/.test(id)) throw new ProError('invalid_subscription', 400)
  return proStripeRequest<ProSubscription>(`/subscriptions/${id}?expand[]=latest_invoice&expand[]=latest_invoice.charge`)
}

export async function paidProEntitlement(subscription: ProSubscription, now = Date.now()) {
  const plan = subscription.metadata?.wml_plan
  if (subscription.metadata?.wml_product !== 'wml-pro' || !subscription.metadata.wml_license_id ||
      (plan !== 'monthly' && plan !== 'annual') || subscription.items.data.length !== 1) {
    throw new ProError('invalid_pro_subscription', 403)
  }
  const validatedPlan: ProBillingPlan = plan === 'annual' ? 'annual' : 'monthly'
  const item = subscription.items.data[0]
  const expectedId = subscription.metadata.wml_price_id || proPriceId(validatedPlan)
  if (!expectedId) throw new ProError('invalid_pro_subscription', 403)
  checkPrice(item.price, validatedPlan, expectedId)
  if (item.quantity !== 1 || subscription.metadata.wml_revoked === 'true' || !['active', 'past_due'].includes(subscription.status)) {
    throw new ProError('license_inactive', 403)
  }
  let invoice = typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null
  if (!invoice?.paid || invoice.status !== 'paid') {
    // A failed renewal must never extend a license into its unpaid billing period.
    const paid = await proStripeRequest<StripeList<Invoice>>(`/invoices?subscription=${subscription.id}&status=paid&limit=1&expand[]=data.charge`)
    invoice = paid.data[0] ?? null
  }
  if (!invoice?.paid || invoice.status !== 'paid' || invoice.subscription !== subscription.id || invoice.lines.has_more) {
    throw new ProError('license_inactive', 403)
  }
  const lines = invoice.lines.data.filter(line => line.subscription_item === item.id && line.price &&
    isProPrice(line.price, validatedPlan, item.price.id))
  const paidUntil = Math.min(
    Math.max(0, ...lines.map(line => line.period.end)),
    subscription.current_period_end,
    subscription.cancel_at || Infinity,
  )
  if (!Number.isFinite(paidUntil) || paidUntil * 1000 <= now) throw new ProError('license_inactive', 403)
  const charge = typeof invoice.charge === 'string'
    ? await proStripeRequest<Charge>(`/charges/${invoice.charge}`) : invoice.charge
  if (charge && charge.amount > 0 && charge.amount_refunded >= charge.amount) {
    throw new ProError('license_revoked', 403)
  }
  if (charge?.disputed) {
    const disputes = await proStripeRequest<StripeList<{ status: string }>>(`/disputes?charge=${charge.id}&limit=100`)
    // A won/closed dispute must not permanently revoke an otherwise paid license.
    if (disputes.has_more || !disputes.data.length || disputes.data.some(dispute => !['won', 'warning_closed'].includes(dispute.status))) {
      throw new ProError('license_revoked', 403)
    }
  }
  return { plan: validatedPlan, paidUntil, subscription, invoice }
}

export async function bindProDevice(subscription: ProSubscription, deviceId: string, activationId: string) {
  const hash = proHash(deviceId)
  if (subscription.metadata.wml_device_hash) {
    if (subscription.metadata.wml_device_hash !== hash || subscription.metadata.wml_activation_id !== activationId) {
      throw new ProError('device_limit_reached', 403)
    }
    return
  }
  const params = new URLSearchParams({ 'metadata[wml_device_hash]': hash, 'metadata[wml_activation_id]': activationId })
  // All first-device registrations share a Stripe idempotency key. Concurrent
  // devices cannot overwrite one another; different bodies are rejected by Stripe.
  await proStripeRequest(`/subscriptions/${subscription.id}`, params, `wml-pro-bind-${subscription.metadata.wml_license_id}`)
  const bound = await retrieveProSubscription(subscription.id)
  if (bound.metadata.wml_device_hash !== hash || bound.metadata.wml_activation_id !== activationId) {
    throw new ProError('device_limit_reached', 403)
  }
}

export async function createProPortal(customer: string, locale: 'es' | 'en') {
  if (!/^cus_[A-Za-z0-9]+$/.test(customer)) throw new ProError('invalid_customer', 400)
  const configured = process.env.WML_PRO_PORTAL_CONFIGURATION_ID?.trim()
  if (configured && !/^bpc_[A-Za-z0-9]+$/.test(configured)) throw new ProError('pro_not_configured')
  return proStripeRequest<{ url: string }>('/billing_portal/sessions', new URLSearchParams({
    customer, locale, configuration: configured || (await ensureProPortal()).id,
    return_url: `${proOrigin()}/pro/receipt?lang=${locale}`,
  }))
}

type PortalConfiguration = { id: string; active: boolean; metadata: Record<string, string>; login_page?: { enabled: boolean; url: string | null } }

export async function ensureProPortal(): Promise<PortalConfiguration> {
  let cursor = ''
  while (true) {
    const page = await proStripeRequest<StripeList<PortalConfiguration>>(`/billing_portal/configurations?active=true&limit=100${cursor ? `&starting_after=${cursor}` : ''}`)
    const existing = page.data.find(config => config.metadata?.wml_product === 'wml-pro-v1')
    if (existing) {
      if (!existing.login_page?.enabled || !existing.login_page.url) throw new ProError('pro_portal_not_configured')
      return existing
    }
    if (!page.has_more || !page.data.length) break
    cursor = page.data.at(-1)!.id
  }
  const config = await proStripeRequest<PortalConfiguration>('/billing_portal/configurations', new URLSearchParams({
    'metadata[wml_product]': 'wml-pro-v1',
    'business_profile[headline]': 'WML X.X.0 Pro',
    'features[customer_update][enabled]': 'true',
    'features[customer_update][allowed_updates][0]': 'email',
    'features[invoice_history][enabled]': 'true',
    'features[payment_method_update][enabled]': 'true',
    'features[subscription_cancel][enabled]': 'true',
    'features[subscription_cancel][mode]': 'at_period_end',
    'features[subscription_cancel][proration_behavior]': 'none',
    'features[subscription_update][enabled]': 'false',
    'login_page[enabled]': 'true',
  }), 'wml-pro-portal-v1')
  if (!config.login_page?.url) throw new ProError('pro_portal_not_configured')
  return config
}

export async function reconcileProSubscription(id: string) {
  const subscription = await retrieveProSubscription(id)
  if (subscription.metadata?.wml_product !== 'wml-pro') return
  let access = 'inactive'
  let paidUntil = ''
  try {
    const entitlement = await paidProEntitlement(subscription)
    access = 'active'
    paidUntil = String(entitlement.paidUntil)
  } catch (error) {
    if (!(error instanceof ProError) || error.status !== 403) throw error
  }
  // A current-state read makes duplicate/out-of-order webhooks harmless. These
  // fields are informational; every license request still checks Stripe directly.
  if (subscription.metadata.wml_access === access && (subscription.metadata.wml_paid_until || '') === paidUntil) return
  await proStripeRequest(`/subscriptions/${id}`, new URLSearchParams({
    'metadata[wml_access]': access, 'metadata[wml_paid_until]': paidUntil,
  }))
}

export async function deliverPaidProInvoice(subscriptionId: string, invoiceId: string) {
  if (!/^in_[A-Za-z0-9]+$/.test(invoiceId)) throw new ProError('invalid_invoice', 400)
  const subscription = await retrieveProSubscription(subscriptionId)
  if (subscription.metadata?.wml_product !== 'wml-pro') return
  const latest = typeof subscription.latest_invoice === 'object' ? subscription.latest_invoice : null
  if (subscription.metadata.wml_emailed_invoice_id === invoiceId) return
  if (latest?.id !== invoiceId) {
    // Stripe can send invoice.paid before the expanded subscription reflects
    // the new invoice. Retry that case; silently ignore an older paid invoice.
    const paid = await proStripeRequest<Invoice>(`/invoices/${invoiceId}`)
    if (paid.subscription !== subscriptionId || !paid.paid || paid.status !== 'paid') return
    const eventEnd = Math.max(0, ...paid.lines.data.map(line => line.period.end))
    const latestEnd = Math.max(0, ...(latest?.lines.data ?? []).map(line => line.period.end))
    if (eventEnd > latestEnd) throw new ProError('pro_invoice_not_current')
    return
  }
  const { plan, paidUntil } = await paidProEntitlement(subscription)
  const customer = await proStripeRequest<{ email: string | null }>(`/customers/${encodeURIComponent(subscription.customer)}`)
  await sendPaidProLicenseEmail({
    email: customer.email ?? '', plan, paidUntil,
    license: makeProLicense({ subscriptionId, plan, issuedAt: subscription.created, paidUntil }),
  })
  // Mark only after Brevo accepts the message, so Stripe can retry on failure.
  await proStripeRequest(`/subscriptions/${subscriptionId}`, new URLSearchParams({
    'metadata[wml_emailed_invoice_id]': invoiceId,
  }), `wml-pro-email-${invoiceId}`)
}

export async function proEventSubscription(type: string, object: Record<string, unknown>): Promise<string | null> {
  if (type.startsWith('customer.subscription.')) return typeof object.id === 'string' ? object.id : null
  if (type.startsWith('invoice.') || type.startsWith('checkout.session.')) return typeof object.subscription === 'string' ? object.subscription : null
  let invoiceId: string | null = null
  if (type === 'charge.refunded') invoiceId = typeof object.invoice === 'string' ? object.invoice : null
  if (type.startsWith('charge.dispute.') && typeof object.charge === 'string') {
    const charge = await proStripeRequest<Charge>(`/charges/${encodeURIComponent(object.charge)}`)
    invoiceId = charge.invoice ?? null
  }
  if (!invoiceId) return null
  const invoice = await proStripeRequest<Invoice>(`/invoices/${encodeURIComponent(invoiceId)}`)
  return invoice.subscription ?? null
}
