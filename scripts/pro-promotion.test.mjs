import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadTypescript } from './test-helpers.mjs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const promo = loadTypescript('src/lib/proPromotion.ts')
const config = loadTypescript('src/lib/proPromotionServer.ts')
const trials = loadTypescript('src/lib/proTrialStripe.ts')
const billing = loadTypescript('src/lib/stripePro.ts')
const end = promo.PRO_TRIAL_END / 1000
const completed = end - 1
const price = { id: 'price_month', product: 'wml_pro_v1', active: true, currency: 'eur', unit_amount: 299, recurring: { interval: 'month', interval_count: 1 } }
const json = (data, status = 200) => new Response(JSON.stringify(data), { status })

function fixture(t, now = completed * 1000, plan = 'monthly') {
  const selectedPrice = plan === 'annual' ? { ...price, id: 'price_year', unit_amount: 2999, recurring: { interval: 'year', interval_count: 1 } } : price
  const previous = { ...process.env }
  Object.assign(process.env, { WML_PRO_STRIPE_SECRET_KEY: 'sk_test_fake', WML_PRO_STRIPE_WEBHOOK_SECRET: 'whsec_fake',
    WML_PRO_TRIAL_ENABLED: 'true', WML_PRO_STRIPE_MONTHLY_PRICE_ID: 'price_month', WML_PRO_STRIPE_ANNUAL_PRICE_ID: 'price_year', WML_PRO_SITE_URL: 'https://wml.example' })
  t.after(() => { for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key]; Object.assign(process.env, previous) })
  t.mock.method(Date, 'now', () => now)
  const customer = { id: 'cus_trial', email: 'trial@example.org', metadata: { wml_trial_customer: promo.PRO_TRIAL_CAMPAIGN } }
  const session = { id: 'cs_test_trial', mode: 'setup', status: 'complete', payment_status: 'no_payment_required',
    customer: customer.id, subscription: null, setup_intent: 'seti_trial', created: completed - 600,
    metadata: { wml_product: 'wml-pro', wml_campaign: promo.PRO_TRIAL_CAMPAIGN, wml_plan: plan, wml_price_id: selectedPrice.id, wml_locale: 'en' } }
  const state = { customer, session, subscriptions: [], created: 0, checkoutParams: null, setupStatus: 'succeeded', setupCustomer: customer.id,
    events: [{ id: 'evt_complete', type: 'checkout.session.completed', created: completed, data: { object: { id: session.id } } }], eventRequests: 0 }
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    const path = new URL(url).pathname.replace('/v1', '')
    const params = init.body
    if (path === '/events') { state.eventRequests++; return json({ data: state.events }) }
    if (path === '/subscriptions/sub_trial') return json(state.subscriptions[0])
    if (path === `/prices/${selectedPrice.id}`) return json(selectedPrice)
    if (path === '/customers') return json({ data: [customer] })
    if (path === `/customers/${customer.id}`) {
      if (params) for (const [key, value] of params) customer.metadata[key.slice(9, -1)] = value
      return json(customer)
    }
    if (path === '/setup_intents/seti_trial') return json({ status: state.setupStatus, customer: state.setupCustomer, payment_method: 'pm_trial' })
    if (path === '/checkout/sessions') { state.checkoutParams = params; return json({ id: session.id, url: 'https://checkout.stripe.com/trial' }) }
    if (path === `/checkout/sessions/${session.id}`) {
      if (params) for (const [key, value] of params) session.metadata[key.slice(9, -1)] = value
      return json(session)
    }
    if (path === '/subscriptions') {
      if (!params) return json({ data: state.subscriptions })
      state.created++
      const metadata = Object.fromEntries([...params].filter(([key]) => key.startsWith('metadata[')).map(([key, value]) => [key.slice(9, -1), value]))
      const trialEnd = Number(params.get('trial_end'))
      const sub = { id: 'sub_trial', customer: customer.id, created: Math.floor(now / 1000), status: 'trialing', trial_end: trialEnd,
        current_period_end: trialEnd, metadata, default_payment_method: params.get('default_payment_method'),
        items: { data: [{ id: 'si_trial', quantity: 1, price: selectedPrice }] },
        latest_invoice: { id: 'in_trial', subscription: 'sub_trial', status: 'paid', paid: true, amount_paid: 0,
          lines: { data: [{ subscription_item: 'si_trial', price: selectedPrice, period: { start: completed, end: trialEnd } }] } } }
      assert.equal(params.get('collection_method'), 'charge_automatically')
      assert.equal(params.get('trial_settings[end_behavior][missing_payment_method]'), 'cancel')
      state.subscriptions.push(sub)
      return json(sub)
    }
    if (path === '/invoices') return json({ data: state.subscriptions.map(sub => sub.latest_invoice) })
    throw new Error(`Unexpected request ${path}`)
  })
  return state
}

test('Madrid cutoff includes 23:59:59 on the 18th and excludes midnight on the 19th', t => {
  fixture(t)
  assert.equal(promo.PRO_TRIAL_END, Date.parse('2026-11-18T23:00:00Z'))
  assert.equal(config.proPromotionStatus((end - 1) * 1000).active, true)
  assert.equal(config.proPromotionStatus(end * 1000).active, false)
  assert.equal(config.proPromotionStatus(promo.PRO_TRIAL_START - 1).active, false)
  process.env.WML_PRO_TRIAL_ENABLED = 'false'
  assert.equal(config.proPromotionStatus((end - 1) * 1000).active, false)
  process.env.WML_PRO_TRIAL_ENABLED = 'true'
  delete process.env.WML_PRO_STRIPE_WEBHOOK_SECRET
  assert.equal(config.proPromotionStatus((end - 1) * 1000).active, false)
})

test('promo checkout collects a card without charging, including the final minute', async t => {
  const state = fixture(t)
  await trials.createProTrialCheckout({ email: state.customer.email, plan: 'monthly', locale: 'en', accessToken: 'secret' })
  assert.equal(state.checkoutParams.get('mode'), 'setup')
  assert.equal(state.checkoutParams.get('payment_method_types[0]'), 'card')
  assert.equal(state.checkoutParams.has('line_items[0][price]'), false)
  assert.equal([...state.checkoutParams.keys()].some(key => key.startsWith('after_expiration')), false,
    'Stripe rejects recovery parameters in setup mode, including enabled=false')
  assert.match(state.checkoutParams.get('custom_text[submit][message]'), /€2.99\/month/)
  assert.ok(Number(state.checkoutParams.get('expires_at')) >= completed + 1800)
  assert.equal(state.created, 0)
})

test('no new promo checkout after cutoff or for an email with a cancelled Pro subscription', async t => {
  const state = fixture(t, end * 1000)
  const input = { email: state.customer.email, plan: 'monthly', locale: 'es', accessToken: 'secret' }
  await assert.rejects(trials.createProTrialCheckout(input), /pro_trial_unavailable/)
  t.mock.method(Date, 'now', () => completed * 1000)
  state.subscriptions.push({ status: 'canceled', metadata: { wml_product: 'wml-pro' } })
  await assert.rejects(trials.createProTrialCheckout(input), /pro_trial_unavailable/)
  assert.equal(state.checkoutParams, null)
})

test('annual trial keeps the annual price and grants exactly seven free days', async t => {
  const state = fixture(t, completed * 1000, 'annual')
  await trials.createProTrialCheckout({ email: state.customer.email, plan: 'annual', locale: 'es', accessToken: 'secret' })
  assert.match(state.checkoutParams.get('custom_text[submit][message]'), /29,99.*año/)
  assert.equal(state.checkoutParams.get('metadata[wml_plan]'), 'annual')
  await trials.completeProTrialCheckout(state.session.id, completed)
  const entitlement = await billing.paidProEntitlement(state.subscriptions[0])
  assert.equal(entitlement.plan, 'annual')
  assert.equal(entitlement.paidUntil, completed + 7 * 86400)
})

test('both countdown designs and languages show the campaign, and leave no markup after expiry', () => {
  const Offer = loadTypescript('src/components/ProPromotion.tsx').default
  for (const lang of ['es', 'en']) for (const variant of ['home', 'download']) {
    const props = { lang, variant, remaining: 86461 }
    const html = renderToStaticMarkup(React.createElement(Offer, props))
    assert.ok(html.startsWith(`<a href="${lang === 'es' ? '/descargar' : '/en/download'}"`))
    assert.ok(html.includes(promo.proPromotionCopy[lang].headline))
    assert.ok(html.includes(promo.proPromotionCopy[lang].deadline))
    assert.match(html, /<s>/)
    assert.equal((html.match(/role="timer"/g) || []).length, 1)
    assert.equal(renderToStaticMarkup(React.createElement(Offer, { ...props, remaining: 0 })), '')
  }
})

test('an open page removes the offer at the server deadline without trusting the local clock', async t => {
  const intervals = new Map()
  const state = []
  let effect
  let tick = 1000
  t.mock.method(performance, 'now', () => tick)
  t.mock.method(Date, 'now', () => 0)
  const oldWindow = globalThis.window
  const oldDocument = globalThis.document
  globalThis.window = { setInterval: (fn, ms) => { intervals.set(ms, fn); return ms }, clearInterval: ms => intervals.delete(ms) }
  globalThis.document = { addEventListener() {}, removeEventListener() {}, visibilityState: 'visible' }
  t.after(() => { globalThis.window = oldWindow; globalThis.document = oldDocument })
  t.mock.method(globalThis, 'fetch', async () => json({ promotion: { active: true, campaign: promo.PRO_TRIAL_CAMPAIGN,
    endsAt: promo.PRO_TRIAL_END, serverNow: promo.PRO_TRIAL_END - 2000 } }))
  const hook = loadTypescript('src/hooks/useProPromotion.ts', {
    react: { useEffect: fn => { effect = fn }, useState: initial => { const index = state.length; state.push(initial); return [initial, value => { state[index] = value }] } },
  })
  hook.useProPromotion()
  const cleanup = effect()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(state[0], 2)
  assert.equal(state[1], true)
  tick += 1000
  intervals.get(1000)()
  assert.equal(state[0], 1)
  tick += 1000
  intervals.get(1000)()
  assert.equal(state[0], 0)
  cleanup()
  assert.equal(intervals.size, 0)
})

test('a signed completion before cutoff retains all seven days even when delivered the next day', async t => {
  const state = fixture(t, (end + 86400) * 1000)
  assert.equal(await trials.completeProTrialCheckout(state.session.id, completed), 'sub_trial')
  const sub = state.subscriptions[0]
  assert.equal(sub.trial_end, completed + 7 * 86400)
  assert.equal(sub.default_payment_method, 'pm_trial')
  const access = await billing.paidProEntitlement(sub)
  assert.equal(access.trial, true)
  assert.equal(access.paidUntil, sub.trial_end)
  assert.equal(state.session.metadata.wml_subscription_id, sub.id)
  await trials.completeProTrialCheckout(state.session.id, completed)
  assert.equal(state.created, 1)
})

test('an old checkout completed on the 19th creates no subscription and no charge', async t => {
  const state = fixture(t, end * 1000)
  assert.equal(await trials.completeProTrialCheckout(state.session.id, end), null)
  assert.equal(state.created, 0)
  assert.equal(state.session.metadata.wml_trial_rejected, 'pro_trial_expired')
  assert.throws(() => billing.requirePaidCheckout(state.session), /pro_trial_expired/)
})

test('missing timestamps, failed setup and a card belonging to another customer never activate Pro', async t => {
  const state = fixture(t)
  await trials.completeProTrialCheckout(state.session.id, undefined)
  assert.equal(state.created, 0)
  delete state.session.metadata.wml_trial_rejected
  state.setupStatus = 'requires_payment_method'
  await assert.rejects(trials.completeProTrialCheckout(state.session.id, completed), /payment_pending/)
  state.setupStatus = 'succeeded'
  state.setupCustomer = 'cus_other'
  await assert.rejects(trials.completeProTrialCheckout(state.session.id, completed), /payment_pending/)
  assert.equal(state.created, 0)
})

test('retry after a lost session update recovers the same subscription; another session cannot repeat the trial', async t => {
  const state = fixture(t)
  await trials.completeProTrialCheckout(state.session.id, completed)
  delete state.session.metadata.wml_subscription_id
  await trials.completeProTrialCheckout(state.session.id, completed)
  assert.equal(state.created, 1)
  delete state.session.metadata.wml_subscription_id
  state.session.id = 'cs_test_another'
  assert.equal(await trials.completeProTrialCheckout(state.session.id, completed), null)
  assert.equal(state.created, 1)
  assert.equal(state.session.metadata.wml_trial_rejected, 'pro_trial_unavailable')
})

test('trial cancellation preserves only the seven days; disabled campaign does not revoke existing trials', async t => {
  const state = fixture(t)
  await trials.completeProTrialCheckout(state.session.id, completed)
  const sub = state.subscriptions[0]
  sub.cancel_at = sub.trial_end
  process.env.WML_PRO_TRIAL_ENABLED = 'false'
  assert.equal((await billing.paidProEntitlement(sub)).paidUntil, sub.trial_end)
  await assert.rejects(billing.paidProEntitlement(sub, sub.trial_end * 1000), /license_inactive/)
  await assert.rejects(billing.paidProEntitlement({ ...sub, status: 'canceled' }), /license_inactive/)
  await assert.rejects(billing.paidProEntitlement({ ...sub, trial_end: sub.trial_end + 86400 }), /license_inactive/)
})

test('failed first charge cannot extend the free license into the unpaid month', async t => {
  const state = fixture(t)
  await trials.completeProTrialCheckout(state.session.id, completed)
  const sub = state.subscriptions[0]
  const unpaid = { ...sub, status: 'past_due', current_period_end: sub.trial_end + 30 * 86400,
    latest_invoice: { ...sub.latest_invoice, status: 'open', paid: false } }
  await assert.rejects(billing.paidProEntitlement(unpaid, sub.trial_end * 1000), /license_inactive/)
  const paid = { ...unpaid, status: 'active', latest_invoice: { ...sub.latest_invoice, amount_paid: 299,
    lines: { data: [{ subscription_item: 'si_trial', price, period: { start: sub.trial_end, end: unpaid.current_period_end } }] } } }
  assert.equal((await billing.paidProEntitlement(paid, sub.trial_end * 1000)).paidUntil, unpaid.current_period_end)
})

test('a setup session must be completed and linked to a server-created subscription to authorize a receipt', t => {
  const { session } = fixture(t)
  assert.throws(() => billing.requirePaidCheckout(session), /payment_pending/)
  session.subscription = 'sub_trial'
  session.metadata.wml_subscription_id = 'sub_trial'
  assert.doesNotThrow(() => billing.requirePaidCheckout(session))
  session.status = 'open'
  assert.throws(() => billing.requirePaidCheckout(session), /payment_pending/)
})

test('receipt recovers a completed trial from Stripe events without waiting for webhook delivery', async t => {
  const state = fixture(t, (end + 3600) * 1000)
  const token = 'a'.repeat(64)
  state.session.metadata.wml_access_hash = loadTypescript('src/lib/proLicense.ts').proHash(token)
  const api = loadTypescript('src/lib/proApi.ts', { 'next/headers': { cookies: async () => ({
    get: key => ({ value: key === 'wml_pro_session' ? state.session.id : token }),
  }) } })
  const purchase = await api.browserProPurchase()
  assert.equal(purchase.trial, true)
  assert.equal(purchase.paidUntil, completed + 7 * 86400)
  assert.equal(state.created, 1)
  assert.equal(state.eventRequests, 1)
  await api.browserProPurchase()
  await trials.completeProTrialCheckout(state.session.id, completed)
  assert.equal(state.created, 1, 'receipt retries and a delayed webhook reuse the subscription')
  assert.equal(state.eventRequests, 1, 'already linked receipts avoid event lookups')
})

test('unowned receipt cannot trigger event lookup or subscription creation', async t => {
  const state = fixture(t)
  const api = loadTypescript('src/lib/proApi.ts', { 'next/headers': { cookies: async () => ({
    get: key => ({ value: key === 'wml_pro_session' ? state.session.id : 'b'.repeat(64) }),
  }) } })
  await assert.rejects(api.browserProPurchase(), /checkout_not_owned/)
  assert.equal(state.created, 0)
  assert.equal(state.eventRequests, 0)
})

test('receipt recovery uses the exact Stripe completion time and rejects a signup after cutoff', async t => {
  const state = fixture(t, end * 1000)
  state.events[0].created = end
  assert.equal(await trials.recoverProTrialCheckout(state.session), null)
  assert.equal(state.session.metadata.wml_trial_rejected, 'pro_trial_expired')
  assert.equal(state.created, 0)
})

test('missing or unrelated completion events cannot grant a trial', async t => {
  const state = fixture(t)
  state.events[0].data.object.id = 'cs_test_someoneElse'
  await assert.rejects(trials.recoverProTrialCheckout(state.session), /payment_pending/)
  state.events = []
  await assert.rejects(trials.recoverProTrialCheckout(state.session), /payment_pending/)
  state.session.status = 'open'
  await assert.rejects(trials.recoverProTrialCheckout(state.session), /payment_pending/)
  assert.equal(state.eventRequests, 2)
  assert.equal(state.created, 0)
})

test('Stripe Events permission failure is actionable instead of an endless pending receipt', async t => {
  const state = fixture(t)
  t.mock.method(console, 'error', () => {})
  t.mock.method(globalThis, 'fetch', async () => json({ error: { code: 'more_permissions_required' } }, 403))
  await assert.rejects(trials.recoverProTrialCheckout(state.session), /stripe_events_permission_missing/)
  assert.equal(state.created, 0)
})
