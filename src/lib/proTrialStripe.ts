import { ProError, PRO_PLANS, proOrigin, type ProBillingPlan } from './proConfig'
import { proHash } from './proLicense'
import { PRO_TRIAL_CAMPAIGN, PRO_TRIAL_END, PRO_TRIAL_SECONDS, isProPromotionDate, proPromotionCopy } from './proPromotion'
import { proPromotionAvailable } from './proPromotionServer'
import { proStripeRequest, resolveProPrice, type ProCheckout, type ProSubscription } from './stripePro'

type Customer = { id: string; email: string | null; metadata?: Record<string, string> }
type List<T> = { data: T[]; has_more?: boolean }

async function proHistory(email: string) {
  const customers = await proStripeRequest<List<Customer>>(`/customers?email=${encodeURIComponent(email)}&limit=100`)
  if (customers.has_more) throw new ProError('pro_customer_lookup_incomplete')
  const subscriptions: ProSubscription[] = []
  for (const customer of customers.data) {
    let cursor = ''
    while (true) {
      const page = await proStripeRequest<List<ProSubscription>>(`/subscriptions?customer=${customer.id}&status=all&limit=100${cursor ? `&starting_after=${cursor}` : ''}`)
      subscriptions.push(...page.data.filter(sub => sub.metadata?.wml_product === 'wml-pro'))
      if (!page.has_more) break
      if (!page.data.length) throw new ProError('pro_customer_lookup_incomplete')
      cursor = page.data.at(-1)!.id
    }
  }
  return { customers: customers.data, subscriptions }
}

export async function createProTrialCheckout(input: { email: string; plan: ProBillingPlan; locale: 'es' | 'en'; accessToken: string; origin?: string }) {
  if (!proPromotionAvailable()) throw new ProError('pro_trial_unavailable', 409)
  const history = await proHistory(input.email)
  if (history.subscriptions.length || history.customers.some(c => c.metadata?.wml_trial_used === PRO_TRIAL_CAMPAIGN)) {
    throw new ProError('pro_trial_unavailable', 409)
  }
  const priceId = await resolveProPrice(input.plan)
  // Reuse a dedicated customer and a deterministic creation key for concurrent
  // tabs. Never update another customer's email or attach a card by email alone.
  const customer = history.customers.find(c => c.metadata?.wml_trial_customer === PRO_TRIAL_CAMPAIGN) ??
    await proStripeRequest<Customer>('/customers', new URLSearchParams({
      email: input.email, 'metadata[wml_trial_customer]': PRO_TRIAL_CAMPAIGN,
    }), `wml-trial-customer-${proHash(input.email)}-${PRO_TRIAL_CAMPAIGN}`)
  const origin = input.origin ?? proOrigin()
  const amount = new Intl.NumberFormat(input.locale, { style: 'currency', currency: 'EUR' }).format(PRO_PLANS[input.plan].amount / 100)
  const cadence = input.locale === 'es' ? input.plan === 'annual' ? 'año' : 'mes' : input.plan === 'annual' ? 'year' : 'month'
  const copy = proPromotionCopy[input.locale]
  // Stripe-hosted Checkout copy only; the site's promotional copy stays separate.
  const checkoutMessage = input.locale === 'es'
    ? `0 € hoy · 7 días gratis de WML X.X.0 Pro.\nDespués: ${amount}/${cadence}, con renovación automática. Cancela antes de terminar los 7 días para evitar el primer cobro.\nTarjeta requerida. Solo nuevas altas, una prueba por correo. ${copy.deadline}\nTu banco puede mostrar una autorización temporal de 1 € o un importe similar para verificar la tarjeta. Se libera automáticamente; no es un cobro de la suscripción.`
    : `€0 today · 7 days free of WML X.X.0 Pro.\nThen: ${amount}/${cadence}, automatically renewed. Cancel before the 7 days end to avoid the first charge.\nCard required. New subscribers only, one trial per email. ${copy.deadline}\nYour bank may show a temporary €1 or similar authorization to verify your card. It is released automatically; it is not a subscription charge.`
  // Setup mode cannot charge or create a subscription on its own. The signed
  // completion event, not the time a link was generated, grants the offer.
  const params = new URLSearchParams({
    mode: 'setup', customer: customer.id, currency: 'eur', locale: input.locale,
    'payment_method_types[0]': 'card', 'setup_intent_data[metadata][wml_campaign]': PRO_TRIAL_CAMPAIGN,
    'custom_text[submit][message]': checkoutMessage,
    success_url: `${origin}/api/pro/return?session_id={CHECKOUT_SESSION_ID}&lang=${input.locale}`,
    cancel_url: `${origin}${input.locale === 'en' ? '/en/download' : '/descargar'}?pro=cancelled`,
    'metadata[wml_product]': 'wml-pro', 'metadata[wml_campaign]': PRO_TRIAL_CAMPAIGN,
    'metadata[wml_access_hash]': proHash(input.accessToken), 'metadata[wml_checkout_origin]': origin,
    'metadata[wml_plan]': input.plan, 'metadata[wml_price_id]': priceId,
    'metadata[wml_locale]': input.locale,
  })
  // Setup sessions do not support after_expiration[recovery], even when false.
  // The signed completion event below enforces the promotion cutoff.
  // Stripe requires at least 30 minutes. During the last 30 minutes the signed
  // webhook remains the hard gate; an old setup page can never confer a trial.
  const now = Date.now()
  if (!proPromotionAvailable(now)) throw new ProError('pro_trial_unavailable', 409)
  params.set('expires_at', String(Math.floor(Math.max(now + 31 * 60_000, Math.min(now + 23 * 3600_000, PRO_TRIAL_END)) / 1000)))
  return proStripeRequest<ProCheckout>('/checkout/sessions', params)
}

// Recover an owned receipt when webhook delivery is delayed (including localhost).
// Never use browser time, the redirect time, or SetupIntent.created as completion
// time: they can incorrectly grant a trial after the promotion cutoff.
export async function recoverProTrialCheckout(session: ProCheckout) {
  if (session.mode !== 'setup' || session.metadata?.wml_campaign !== PRO_TRIAL_CAMPAIGN ||
      session.metadata.wml_product !== 'wml-pro' || session.metadata.wml_trial_rejected) return null
  if (session.metadata.wml_subscription_id) return session.metadata.wml_subscription_id
  if (session.status !== 'complete' || !session.created) throw new ProError('payment_pending', 409)
  type CompletionEvent = { id: string; type: string; created: number; data: { object: { id: string } } }
  const query = new URLSearchParams({ type: 'checkout.session.completed', limit: '100',
    'created[gte]': String(session.created), 'created[lte]': String(session.created + 86400) })
  // Bound work per receipt request. The webhook remains the durable fallback.
  for (let pageNumber = 0; pageNumber < 10; pageNumber++) {
    const page = await proStripeRequest<List<CompletionEvent>>(`/events?${query}`)
    const event = page.data.find(event => event.type === 'checkout.session.completed' && event.data?.object?.id === session.id)
    if (event) return completeProTrialCheckout(session.id, event.created)
    if (!page.has_more || !page.data.length) break
    query.set('starting_after', page.data.at(-1)!.id)
  }
  throw new ProError('payment_pending', 409)
}

// Only call with event.created from a signature-verified webhook or Stripe's API.
export async function completeProTrialCheckout(sessionId: string, completedAt: number) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) throw new ProError('invalid_checkout', 400)
  const session = await proStripeRequest<ProCheckout>(`/checkout/sessions/${sessionId}`)
  if (session.mode !== 'setup' || session.metadata?.wml_product !== 'wml-pro' || session.metadata.wml_campaign !== PRO_TRIAL_CAMPAIGN) return null
  if (session.status !== 'complete' || !session.customer || !session.setup_intent) throw new ProError('payment_pending', 409)
  if (session.metadata.wml_subscription_id) return session.metadata.wml_subscription_id
  if (session.metadata.wml_trial_rejected) return null
  const reject = async (reason: string) => {
    await proStripeRequest(`/checkout/sessions/${session.id}`, new URLSearchParams({ 'metadata[wml_trial_rejected]': reason }))
    return null
  }
  // Delayed delivery does not disqualify a signup completed before the cutoff.
  if (!Number.isInteger(completedAt) || !isProPromotionDate(completedAt * 1000) ||
      !session.created || session.created > completedAt || session.created * 1000 >= PRO_TRIAL_END ||
      process.env.WML_PRO_TRIAL_ENABLED?.trim() === 'false') return reject('pro_trial_expired')
  const plan = session.metadata.wml_plan
  if (plan !== 'monthly' && plan !== 'annual') throw new ProError('invalid_checkout', 400)
  const customer = await proStripeRequest<Customer>(`/customers/${session.customer}`)
  if (!customer.email) throw new ProError('invalid_checkout', 400)
  const history = await proHistory(customer.email.trim().toLowerCase())
  // Recover a successful create after a timeout/crash, even beyond Stripe's
  // 24-hour idempotency retention, without restarting or extending the trial.
  let subscription = history.subscriptions.find(sub => sub.metadata.wml_trial_session === session.id)
  if (!subscription) {
    if (history.subscriptions.length || history.customers.some(c => c.metadata?.wml_trial_used === PRO_TRIAL_CAMPAIGN)) return reject('pro_trial_unavailable')
    const trialEnd = completedAt + PRO_TRIAL_SECONDS
    if (trialEnd * 1000 <= Date.now()) return reject('pro_trial_expired')
    const setup = await proStripeRequest<{ status: string; customer: string; payment_method: string }>(`/setup_intents/${session.setup_intent}`)
    if (setup.status !== 'succeeded' || setup.customer !== customer.id || !/^pm_[A-Za-z0-9]+$/.test(setup.payment_method)) throw new ProError('payment_pending', 409)
    const params = new URLSearchParams({
      customer: customer.id, 'items[0][price]': session.metadata.wml_price_id, 'items[0][quantity]': '1',
      default_payment_method: setup.payment_method, collection_method: 'charge_automatically',
      trial_end: String(trialEnd), 'trial_settings[end_behavior][missing_payment_method]': 'cancel',
      'metadata[wml_product]': 'wml-pro', 'metadata[wml_plan]': plan,
      'metadata[wml_price_id]': session.metadata.wml_price_id,
      'metadata[wml_license_id]': proHash(`${PRO_TRIAL_CAMPAIGN}:${customer.id}`),
      'metadata[wml_campaign]': PRO_TRIAL_CAMPAIGN, 'metadata[wml_trial_started]': String(completedAt),
      'metadata[wml_trial_session]': session.id, 'metadata[wml_locale]': session.metadata.wml_locale || 'es',
    })
    try {
      subscription = await proStripeRequest<ProSubscription>('/subscriptions', params,
        `wml-trial-subscription-${proHash(customer.email.trim().toLowerCase())}-${PRO_TRIAL_CAMPAIGN}`)
    } catch (error) {
      // Concurrent completions with different cards/plans cannot create two
      // subscriptions. Do not silently replace the winning choice.
      if (error instanceof ProError && error.code === 'device_limit_reached') return reject('pro_trial_unavailable')
      throw error
    }
  }
  await proStripeRequest(`/customers/${customer.id}`, new URLSearchParams({ 'metadata[wml_trial_used]': PRO_TRIAL_CAMPAIGN }))
  await proStripeRequest(`/checkout/sessions/${session.id}`, new URLSearchParams({ 'metadata[wml_subscription_id]': subscription.id }))
  return subscription.id
}
