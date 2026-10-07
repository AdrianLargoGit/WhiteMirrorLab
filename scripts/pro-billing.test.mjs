import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac, generateKeyPairSync, verify } from 'node:crypto'
import { loadTypescript } from './test-helpers.mjs'

const keys = generateKeyPairSync('ed25519', { privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
Object.assign(process.env, {
  WML_PRO_LICENSE_PRIVATE_KEY: keys.privateKey,
  WML_PRO_LICENSE_PUBLIC_KEY: keys.publicKey,
  WML_PRO_STRIPE_SECRET_KEY: 'sk_test_fake',
  WML_PRO_STRIPE_MONTHLY_PRICE_ID: 'price_month', WML_PRO_STRIPE_ANNUAL_PRICE_ID: 'price_year',
  WML_PRO_SITE_URL: 'https://wml.example',
  WML_PRO_PORTAL_LOGIN_URL: 'https://billing.stripe.com/p/login/test',
  WML_PRO_STRIPE_WEBHOOK_SECRET: 'whsec_test',
  BREVO_API_KEY: 'brevo_mock', WML_PRO_FROM_EMAIL: 'pro@example.org',
})
const billing = loadTypescript('src/lib/stripePro.ts')
const license = loadTypescript('src/lib/proLicense.ts')
const webhook = loadTypescript('src/lib/proWebhook.ts')
const now = Date.now()
const seconds = Math.floor(now / 1000)
const monthPrice = { id: 'price_month', active: true, product: 'wml_pro_v1', currency: 'eur', unit_amount: 299, recurring: { interval: 'month', interval_count: 1 } }
const yearPrice = { ...monthPrice, id: 'price_year', unit_amount: 2999, recurring: { interval: 'year', interval_count: 1 } }
const paidInvoice = (price = monthPrice, end = seconds + 30 * 86400) => ({
  id: 'in_paid', subscription: 'sub_paid', paid: true, status: 'paid', charge: { id: 'ch_paid', amount: price.unit_amount, amount_refunded: 0, disputed: false },
  lines: { data: [{ subscription_item: 'si_pro', price, period: { start: seconds, end } }], has_more: false },
})
const subscription = () => ({
  id: 'sub_paid', customer: 'cus_paid', created: seconds, status: 'active', current_period_end: seconds + 30 * 86400,
  metadata: { wml_product: 'wml-pro', wml_plan: 'monthly', wml_license_id: 'license-uuid' },
  items: { data: [{ id: 'si_pro', quantity: 1, price: monthPrice }] }, latest_invoice: paidInvoice(),
})
const session = token => ({
  id: 'cs_test_paid', url: 'https://checkout.stripe.com/test', mode: 'subscription', status: 'complete', payment_status: 'paid',
  subscription: 'sub_paid', customer: 'cus_paid', metadata: { wml_product: 'wml-pro', wml_access_hash: license.proHash(token) },
})
const json = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } })

test('both prices create recurring checkout and copy entitlement metadata onto the subscription', async t => {
  for (const [plan, price] of [['monthly', monthPrice], ['annual', yearPrice]]) {
    t.mock.method(globalThis, 'fetch', async (url, init) => {
      assert.equal(init.headers['Stripe-Version'], '2024-06-20')
      if (url.includes('/prices/')) return json(price)
      assert.equal(init.body.get('mode'), 'subscription')
      assert.equal(init.body.get('line_items[0][price]'), price.id)
      assert.equal(init.body.get('subscription_data[metadata][wml_plan]'), plan)
      assert.equal(init.body.get('subscription_data[metadata][wml_product]'), 'wml-pro')
      assert.equal(init.body.get('metadata[wml_access_hash]'), license.proHash('secret'))
      assert.match(init.body.get('success_url'), /\/api\/pro\/return\?session_id=\{CHECKOUT_SESSION_ID\}/)
      return json({ id: 'cs_test_new', url: 'https://checkout.stripe.com/test' })
    })
    await billing.createProCheckout({ email: 'buyer@example.org', plan, locale: 'es', accessToken: 'secret' })
    t.mock.restoreAll()
  }
})

test('wrong currency, amount or interval never creates a charge', async t => {
  for (const changes of [{ currency: 'usd' }, { unit_amount: 100 }, { recurring: { interval: 'year', interval_count: 1 } }, { active: false }]) {
    let calls = 0
    t.mock.method(globalThis, 'fetch', async () => { calls++; return json({ ...monthPrice, ...changes }) })
    await assert.rejects(billing.createProCheckout({ email: 'buyer@example.org', plan: 'monthly', locale: 'es', accessToken: 'secret' }))
    assert.equal(calls, 1)
    t.mock.restoreAll()
  }
})

test('an email, a forged cookie or a marketplace receipt cannot unlock Pro', async t => {
  const token = 'a'.repeat(64)
  t.mock.method(globalThis, 'fetch', async () => json(session(token)))
  await assert.rejects(billing.ownedProCheckout('cs_test_paid'), /checkout_not_owned/)
  await assert.rejects(billing.ownedProCheckout('cs_test_paid', 'b'.repeat(64)), /checkout_not_owned/)
  assert.equal((await billing.ownedProCheckout('cs_test_paid', token)).customer, 'cus_paid')
  t.mock.method(globalThis, 'fetch', async () => json({ ...session(token), metadata: { ...session(token).metadata, wml_product: 'marketplace' } }))
  await assert.rejects(billing.ownedProCheckout('cs_test_paid', token), /checkout_not_owned/)
  for (const id of ['cs_test_paid/other', 'cs_test_paid\n', 'cs_test_', 'sub_paid']) assert.equal(billing.isProSessionId(id), false)
})

test('returning from an unpaid or incomplete checkout does not authorize a license', () => {
  const paid = session('a'.repeat(64))
  assert.doesNotThrow(() => billing.requirePaidCheckout(paid))
  for (const changes of [{ status: 'open' }, { payment_status: 'unpaid' }, { subscription: null }]) {
    assert.throws(() => billing.requirePaidCheckout({ ...paid, ...changes }), /payment_pending/)
  }
})

test('annual license signs the real paid yearly end and rejects altered dates', async () => {
  const annual = subscription()
  annual.metadata.wml_plan = 'annual'
  annual.items.data[0].price = yearPrice
  annual.current_period_end = seconds + 365 * 86400
  annual.latest_invoice = paidInvoice(yearPrice, annual.current_period_end)
  const entitlement = await billing.paidProEntitlement(annual, now)
  assert.equal(entitlement.plan, 'annual')
  assert.equal(entitlement.paidUntil, annual.current_period_end)
  const file = license.makeProLicense({ subscriptionId: annual.id, plan: 'annual', issuedAt: seconds, paidUntil: entitlement.paidUntil }, now)
  const widgetPayload = JSON.stringify({ subject: file.subject, plan: file.plan, issuedAt: file.issuedAt, expiresAt: file.expiresAt, offlineUntil: file.offlineUntil, lastVerifiedAt: file.lastVerifiedAt, activationId: file.activationId, deviceId: file.deviceId })
  assert.equal(verify(null, Buffer.from(widgetPayload), keys.publicKey, Buffer.from(file.signature, 'base64')), true)
  assert.equal(file.plan, 'annual')
  assert.equal(Date.parse(file.expiresAt), annual.current_period_end * 1000)
  assert.equal(file.offlineUntil, file.expiresAt)
  assert.equal(license.verifyProLicense({ ...file, expiresAt: new Date(now + 400 * 86400000).toISOString() }), false)
})

test('an existing subscription keeps access at its own paid price', async () => {
  const monthly = subscription()
  monthly.metadata.wml_price_id = monthPrice.id
  assert.equal((await billing.paidProEntitlement(monthly, now)).paidUntil, monthly.current_period_end)
  const previousPrice = { ...monthPrice, id: 'price_existing', unit_amount: 399 }
  monthly.metadata.wml_price_id = previousPrice.id
  monthly.items.data[0].price = previousPrice
  monthly.latest_invoice = paidInvoice(previousPrice)
  assert.equal((await billing.paidProEntitlement(monthly, now)).paidUntil, monthly.current_period_end)
  monthly.metadata.wml_price_id = monthPrice.id
  monthly.items.data[0].price = monthPrice
  assert.equal((await billing.paidProEntitlement(monthly, now)).paidUntil, monthly.current_period_end)
  monthly.metadata.wml_price_id = previousPrice.id
  monthly.items.data[0].price = previousPrice
  for (const changes of [{ id: 'price_other' }, { product: 'other_product' }, { currency: 'usd' }, { unit_amount: 0 }, { recurring: { interval: 'year', interval_count: 1 } }]) {
    monthly.items.data[0].price = { ...previousPrice, ...changes }
    await assert.rejects(billing.paidProEntitlement(monthly, now), /pro_price_mismatch/)
  }
  monthly.items.data[0].price = { ...previousPrice, unit_amount: previousPrice.unit_amount + 1 }
  await assert.rejects(billing.paidProEntitlement(monthly, now), /license_inactive/)
  monthly.items.data[0].price = previousPrice
  monthly.latest_invoice = paidInvoice({ ...previousPrice, product: 'other_product' })
  await assert.rejects(billing.paidProEntitlement(monthly, now), /license_inactive/)
})

test('offline licenses never exceed the paid period and device changes break their signature', () => {
  const file = license.makeProLicense({ subscriptionId: 'sub_paid', plan: 'monthly', issuedAt: seconds, paidUntil: seconds + 86400, activationId: 'activation', deviceId: 'device-0001' }, now)
  assert.equal(Date.parse(file.expiresAt), (seconds + 86400) * 1000)
  assert.equal(license.verifyProLicense(file), true)
  assert.equal(license.verifyProLicense({ ...file, deviceId: 'device-0002' }), false)
})

test('a confirmed renewal emails an importable signed license once and retries failed delivery', async t => {
  const sub = subscription()
  sub.latest_invoice.id = 'in_renewal'
  const emails = []
  let failEmail = true
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    if (url === 'https://api.brevo.com/v3/smtp/email') {
      if (failEmail) return json({ message: 'temporary failure' }, 503)
      emails.push(JSON.parse(init.body))
      return json({ messageId: 'sent' })
    }
    if (url.includes('/customers/cus_paid')) return json({ email: 'buyer@example.org' })
    if (init.method === 'POST') {
      sub.metadata.wml_emailed_invoice_id = init.body.get('metadata[wml_emailed_invoice_id]')
      return json(sub)
    }
    return json(sub)
  })
  await assert.rejects(billing.deliverPaidProInvoice(sub.id, 'in_renewal'), /pro_email_delivery_failed/)
  assert.equal(sub.metadata.wml_emailed_invoice_id, undefined)
  failEmail = false
  await billing.deliverPaidProInvoice(sub.id, 'in_renewal')
  await billing.deliverPaidProInvoice(sub.id, 'in_renewal')
  assert.equal(emails.length, 1)
  assert.equal(emails[0].attachment[0].name, 'pro-license.txt')
  const renewed = JSON.parse(Buffer.from(emails[0].attachment[0].content, 'base64').toString())
  assert.equal(license.verifyProLicense(renewed), true)
  assert.equal(renewed.expiresAt, new Date(sub.current_period_end * 1000).toISOString())
})

test('invoice.paid waits for Stripe to expose a newer paid period', async t => {
  const sub = subscription()
  sub.latest_invoice.id = 'in_old'
  const incoming = paidInvoice(monthPrice, sub.current_period_end + 30 * 86400)
  incoming.id = 'in_new'
  t.mock.method(globalThis, 'fetch', async url => json(url.includes('/invoices/in_new') ? incoming : sub))
  await assert.rejects(billing.deliverPaidProInvoice(sub.id, 'in_new'), /pro_invoice_not_current/)
  incoming.lines.data[0].period.end = sub.current_period_end - 30 * 86400
  await billing.deliverPaidProInvoice(sub.id, 'in_new')
})

test('cancel at period end preserves paid access, while immediate cancellation, manual revocation, refunds and disputes deny it', async t => {
  const sub = subscription()
  assert.equal((await billing.paidProEntitlement({ ...sub, cancel_at: sub.current_period_end }, now)).paidUntil, sub.current_period_end)
  for (const status of ['canceled', 'unpaid', 'incomplete', 'trialing', 'paused']) await assert.rejects(billing.paidProEntitlement({ ...sub, status }, now), /license_inactive/)
  await assert.rejects(billing.paidProEntitlement({ ...sub, metadata: { ...sub.metadata, wml_revoked: 'true' } }, now), /license_inactive/)
  t.mock.method(globalThis, 'fetch', async url => {
    assert.match(url, /\/disputes\?charge=ch_paid/)
    return json({ data: [{ status: 'needs_response' }] })
  })
  for (const change of [{ amount_refunded: 299 }, { disputed: true }]) {
    await assert.rejects(billing.paidProEntitlement({ ...sub, latest_invoice: { ...sub.latest_invoice, charge: { ...sub.latest_invoice.charge, ...change } } }, now), /license_revoked/)
  }
  t.mock.method(globalThis, 'fetch', async () => json({ data: [{ status: 'won' }] }))
  assert.equal((await billing.paidProEntitlement({ ...sub, latest_invoice: { ...sub.latest_invoice, charge: { ...sub.latest_invoice.charge, disputed: true } } }, now)).paidUntil, sub.current_period_end)
})

test('a fully discounted annual invoice grants only its free period and needs no payment method', async () => {
  const sub = subscription()
  const yearEnd = seconds + 365 * 86400
  const freeInvoice = { ...paidInvoice(yearPrice, yearEnd), charge: null, amount_paid: 0 }
  const free = {
    ...sub,
    current_period_end: yearEnd,
    cancel_at: yearEnd,
    cancel_at_period_end: true,
    metadata: { ...sub.metadata, wml_plan: 'annual', wml_price_id: yearPrice.id },
    items: { data: [{ id: 'si_pro', quantity: 1, price: yearPrice }] },
    latest_invoice: freeInvoice,
  }
  assert.equal((await billing.paidProEntitlement(free, now)).paidUntil, yearEnd)
  await assert.rejects(billing.paidProEntitlement(free, yearEnd * 1000), /license_inactive/)
})

test('an unsuccessful renewal uses the last paid invoice and cannot grant a future unpaid period', async t => {
  const sub = subscription()
  sub.status = 'past_due'
  sub.current_period_end = seconds + 60 * 86400
  sub.latest_invoice = { ...paidInvoice(), paid: false, status: 'open' }
  let invoice = paidInvoice(monthPrice, seconds + 60)
  t.mock.method(globalThis, 'fetch', async url => {
    assert.match(url, /status=paid/)
    return json({ data: [invoice] })
  })
  assert.equal((await billing.paidProEntitlement(sub, now)).paidUntil, seconds + 60)
  invoice = paidInvoice(monthPrice, seconds - 1)
  await assert.rejects(billing.paidProEntitlement(sub, now), /license_inactive/)
})

test('simultaneous first-device activations share an idempotency key and only one succeeds', async t => {
  const original = subscription()
  let saved
  const keysUsed = []
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    if (init.method === 'POST') {
      keysUsed.push(init.headers['Idempotency-Key'])
      const params = Object.fromEntries(init.body)
      if (saved && saved['metadata[wml_device_hash]'] !== params['metadata[wml_device_hash]']) return json({ error: { type: 'idempotency_error' } }, 400)
      saved = params
      return json(original)
    }
    return json({ ...original, metadata: { ...original.metadata, wml_device_hash: saved['metadata[wml_device_hash]'], wml_activation_id: saved['metadata[wml_activation_id]'] } })
  })
  const results = await Promise.allSettled([
    billing.bindProDevice(original, 'device-0001', 'activation'),
    billing.bindProDevice(original, 'device-0002', 'activation'),
  ])
  assert.equal(new Set(keysUsed).size, 1)
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(results.filter(result => result.status === 'rejected').length, 1)
})

test('webhook authentication requires original bytes, a fresh timestamp and one matching signature', () => {
  const body = JSON.stringify({ type: 'invoice.paid' })
  const header = `t=${seconds},v1=${createHmac('sha256', 'secret').update(`${seconds}.${body}`).digest('hex')}`
  assert.equal(webhook.verifyProWebhook(body, header, 'secret', now), true)
  assert.equal(webhook.verifyProWebhook(body + ' ', header, 'secret', now), false)
  assert.equal(webhook.verifyProWebhook(body, header, 'wrong', now), false)
  assert.equal(webhook.verifyProWebhook(body, header, 'secret', now + 301000), false)
  assert.equal(webhook.verifyProWebhook(body, header + ',v1=bad', 'secret', now), true)
})

test('replayed webhook reconciliation uses current state and avoids metadata update loops', async t => {
  const sub = subscription()
  let updates = 0
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    if (init.method === 'POST') {
      updates++
      sub.metadata.wml_access = init.body.get('metadata[wml_access]')
      sub.metadata.wml_paid_until = init.body.get('metadata[wml_paid_until]')
    }
    return json(sub)
  })
  await billing.reconcileProSubscription(sub.id)
  await billing.reconcileProSubscription(sub.id)
  assert.equal(updates, 1)
  sub.status = 'canceled'
  await billing.reconcileProSubscription(sub.id)
  assert.equal(sub.metadata.wml_access, 'inactive')
})

test('license delivery is denied without purchase cookies or for an unpaid purchase', async t => {
  const jar = new Map()
  const route = loadTypescript('src/app/api/pro/license/route.ts', { 'next/headers': { cookies: async () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined }) } })
  assert.equal((await route.GET()).status, 401)
  const token = 'a'.repeat(64)
  jar.set('wml_pro_checkout', token)
  jar.set('wml_pro_session', 'cs_test_paid')
  t.mock.method(globalThis, 'fetch', async url => json(url.includes('/checkout/') ? { ...session(token), payment_status: 'unpaid' } : subscription()))
  assert.equal((await route.GET()).status, 409)
  t.mock.method(globalThis, 'fetch', async url => json(url.includes('/checkout/') ? session(token) : subscription()))
  const response = await route.GET()
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-disposition'), /pro-license\.json/)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(license.verifyProLicense(await response.json()), true)
})

test('the existing desktop client receives revocation in the JSON format it understands', async t => {
  const route = loadTypescript('src/app/api/pro/activate/route.ts')
  t.mock.method(globalThis, 'fetch', async () => json({ ...subscription(), status: 'canceled' }))
  const file = license.makeProLicense({ subscriptionId: 'sub_paid', plan: 'monthly', issuedAt: seconds, paidUntil: seconds + 86400 }, now)
  const response = await route.POST(new Request('https://wml.example/api/pro/activate', { method: 'POST', body: JSON.stringify({ operation: 'usage', deviceId: 'device-0001', license: file }) }))
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.equal(result.ok, false)
  assert.equal(result.revoked, true)
  assert.match(result.error, /denied/)
})

test('the legacy email-only endpoint never contacts Supabase or returns a license', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('An external service must not be contacted') })
  const route = loadTypescript('src/app/api/pro-license/request/route.ts')
  const response = await route.POST(new Request('https://wml.example/api/pro-license/request', { method: 'POST', body: JSON.stringify({ email: 'buyer@example.org' }) }))
  assert.equal(response.status, 410)
  assert.equal((await response.json()).license, undefined)
})
