import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync, createHmac, verify } from 'node:crypto'
import { loadTypescript } from './test-helpers.mjs'

const keys = generateKeyPairSync('ed25519', { privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
Object.assign(process.env, {
  WML_PRO_LICENSE_PRIVATE_KEY: keys.privateKey, WML_PRO_LICENSE_PUBLIC_KEY: keys.publicKey,
  WML_PRO_STRIPE_SECRET_KEY: 'sk_test_mock', WML_PRO_SITE_URL: 'https://wml.example',
  WML_PRO_STRIPE_WEBHOOK_SECRET: 'whsec_mock',
})
for (const name of ['WML_PRO_STRIPE_MONTHLY_PRICE_ID', 'WML_PRO_STRIPE_ANNUAL_PRICE_ID', 'WML_PRO_PORTAL_LOGIN_URL']) delete process.env[name]
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } })
const portal = { id: 'bpc_pro', active: true, metadata: { wml_product: 'wml-pro-v1' }, login_page: { enabled: true, url: 'https://billing.stripe.com/p/login/test' } }

test('Pro uses the shared widget release URL and follows updates without separate installer configuration', () => {
  const { WIDGET_DOWNLOAD_URL } = loadTypescript('src/lib/widgetDownload.ts')
  assert.equal(loadTypescript('src/lib/proConfig.ts').proInstallerUrl(), WIDGET_DOWNLOAD_URL)
  const nextRelease = 'https://github.com/AdrianLargoGit/WhiteMirrorLab/releases/download/v2.0.0/wml-xx0-2.0.0-setup.exe'
  const config = url => loadTypescript('src/lib/proConfig.ts', { './widgetDownload': { WIDGET_DOWNLOAD_URL: url } })
  assert.equal(config(nextRelease).proInstallerUrl(), nextRelease)
  for (const invalid of ['http://github.com/example/setup.exe', 'https://user:secret@github.com/example/setup.exe', 'javascript:alert(1)']) {
    assert.throws(() => config(invalid).proInstallerUrl(), error => error.code === 'pro_not_configured')
  }
})

test('automatic Stripe provisioning and the complete purchase/activation/renewal flow work for both plans', async t => {
  for (const plan of ['monthly', 'annual']) {
    const jar = new Map()
    const mocks = { 'next/headers': { cookies: async () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined }) } }
    const route = name => loadTypescript(`src/app/api/pro/${name}/route.ts`, mocks)
    const paramsSeen = []
    let checkout
    let sub
    let configuration
    let product
    let price
    let charge
    const end = Math.floor(Date.now() / 1000) + (plan === 'annual' ? 365 : 30) * 86400
    t.mock.method(globalThis, 'fetch', async (input, init) => {
      const url = new URL(input)
      assert.equal(url.hostname, 'api.stripe.com')
      assert.equal(init.headers['Stripe-Version'], '2024-06-20')
      const params = init.body
      if (params) paramsSeen.push({ path: url.pathname, params })
      if (url.pathname === '/v1/customers') return json({ data: [] })
      if (url.pathname === '/v1/billing_portal/configurations') {
        if (!params) return json({ data: configuration ? [configuration] : [] })
        assert.equal(params.get('features[subscription_cancel][mode]'), 'at_period_end')
        assert.equal(params.get('features[subscription_update][enabled]'), 'false')
        assert.equal(params.get('login_page[enabled]'), 'true')
        configuration = portal
        return json(configuration)
      }
      if (url.pathname === '/v1/products') { product = { id: 'wml_pro_v1' }; return json(product) }
      if (url.pathname === '/v1/prices') {
        if (!params) {
          assert.equal(url.searchParams.get('lookup_keys[]'), `wml-pro-${plan}-eur-v2`)
          return json({ data: price ? [price] : [] })
        }
        assert.equal(params.get('product'), product.id)
        assert.equal(params.get('lookup_key'), `wml-pro-${plan}-eur-v2`)
        assert.equal(Number(params.get('unit_amount')), plan === 'annual' ? 4599 : 499)
        price = { id: `price_${plan}`, active: true, currency: params.get('currency'), unit_amount: Number(params.get('unit_amount')), recurring: { interval: params.get('recurring[interval]'), interval_count: 1 } }
        return json(price)
      }
      if (url.pathname === '/v1/checkout/sessions') {
        assert.equal(params.get('line_items[0][price]'), price.id)
        charge = { id: 'ch_paid', amount: price.unit_amount, amount_refunded: 0, disputed: false }
        sub = { id: 'sub_paid', customer: 'cus_paid', created: Math.floor(Date.now() / 1000), status: 'active', current_period_end: end,
          metadata: Object.fromEntries([...params].filter(([key]) => key.startsWith('subscription_data[metadata]')).map(([key, value]) => [key.slice(28, -1), value])),
          items: { data: [{ id: 'si_pro', quantity: 1, price }] },
          latest_invoice: { id: 'in_paid', subscription: 'sub_paid', paid: true, status: 'paid', amount_paid: price.unit_amount, charge, lines: { data: [{ price, subscription_item: 'si_pro', period: { end } }] } },
        }
        checkout = { id: 'cs_test_paid', url: 'https://checkout.stripe.com/test', mode: 'subscription', status: 'complete', payment_status: 'paid', customer: sub.customer, subscription: sub.id,
          metadata: { wml_product: 'wml-pro', wml_access_hash: params.get('metadata[wml_access_hash]') } }
        return json(checkout)
      }
      if (url.pathname === '/v1/checkout/sessions/cs_test_paid') return json(checkout)
      if (url.pathname === '/v1/subscriptions/sub_paid') {
        if (params) for (const [key, value] of params) sub.metadata[key.slice(9, -1)] = value
        return json(sub)
      }
      if (url.pathname === '/v1/billing_portal/sessions') {
        assert.equal(params.get('configuration'), portal.id)
        assert.equal(params.get('customer'), 'cus_paid')
        return json({ url: 'https://billing.stripe.com/p/session/test' })
      }
      throw new Error(`Unexpected endpoint: ${url.pathname}`)
    })
    const buy = await route('checkout').POST(new Request('https://wml.example/api/pro/checkout', { method: 'POST', headers: { origin: 'https://wml.example' }, body: JSON.stringify({ email: 'buyer@example.org', plan, locale: 'en', acceptedTerms: true }) }))
    assert.equal(buy.status, 200, JSON.stringify(await buy.clone().json()))
    jar.set('wml_pro_checkout', buy.cookies.get('wml_pro_checkout').value)
    const returned = await route('return').GET(new Request('https://wml.example/api/pro/return?session_id=cs_test_paid&lang=en'))
    assert.equal(returned.status, 303)
    assert.equal(returned.headers.get('location'), 'https://wml.example/pro/receipt?lang=en')
    jar.set('wml_pro_session', returned.cookies.get('wml_pro_session').value)
    const fulfilled = await route('fulfill').GET()
    assert.equal(fulfilled.status, 200, JSON.stringify(await fulfilled.clone().json()))
    const receipt = await fulfilled.json()
    assert.equal(receipt.plan, plan)
    assert.equal(receipt.amountPaid, plan === 'annual' ? 4599 : 499)
    const installer = await route('installer').GET()
    assert.equal(installer.status, 303)
    assert.equal(installer.headers.get('location'), loadTypescript('src/lib/widgetDownload.ts').WIDGET_DOWNLOAD_URL)
    assert.match(installer.headers.get('cache-control'), /no-store/)
    const delivery = await route('license').GET()
    assert.equal(delivery.status, 200)
    const file = await delivery.json()
    assert.equal(file.plan, plan)
    assert.equal(Date.parse(file.expiresAt), end * 1000)
    const canonical = loadTypescript('src/lib/proLicense.ts').canonicalProLicense
    assert.equal(verify(null, Buffer.from(canonical(file)), keys.publicKey, Buffer.from(file.signature, 'base64')), true)
    const activate = async (operation, license, deviceId = 'device-0001') => route('activate').POST(new Request('https://wml.example/api/pro/activate', { method: 'POST', body: JSON.stringify({ operation, license, deviceId }) }))
    const active = await (await activate('activate', file)).json()
    assert.equal(active.ok, true)
    assert.equal(active.license.deviceId, 'device-0001')
    assert.equal((await (await activate('activate', file, 'device-0002')).json()).revoked, true)
    assert.equal((await (await activate('usage', active.license)).json()).ok, true)
    sub.cancel_at = end
    assert.equal((await (await activate('usage', active.license)).json()).ok, true)
    const renewalEnd = end + 30 * 86400
    sub.cancel_at = null
    sub.current_period_end = renewalEnd
    sub.latest_invoice.lines.data[0].period.end = renewalEnd
    assert.equal((await (await route('fulfill').GET()).json()).paidUntil, new Date(renewalEnd * 1000).toISOString())
    charge.amount_refunded = charge.amount
    assert.equal((await (await activate('usage', active.license)).json()).revoked, true)
    // Billing stays available even after access is revoked.
    const manage = await route('portal').POST(new Request('https://wml.example/api/pro/portal?lang=en', { method: 'POST', headers: { origin: 'https://wml.example' } }))
    assert.equal(manage.status, 303)
    assert.equal(paramsSeen.filter(entry => entry.path === '/v1/prices').length, 1)
    t.mock.restoreAll()
  }
})

test('return and receipt reject other browsers; malformed signed webhook events return 400', async t => {
  const denied = loadTypescript('src/app/api/pro/return/route.ts', { 'next/headers': { cookies: async () => ({ get: () => undefined }) } })
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Should not contact Stripe') })
  assert.equal((await denied.GET(new Request('https://wml.example/api/pro/return?session_id=cs_test_paid'))).status, 401)
  const timestamp = Math.floor(Date.now() / 1000)
  for (const data of [null, {}, { type: 'invoice.paid', data: { object: null } }]) {
    const raw = JSON.stringify(data)
    const signature = createHmac('sha256', 'whsec_mock').update(`${timestamp}.${raw}`).digest('hex')
    const webhook = loadTypescript('src/app/api/pro/webhook/route.ts')
    assert.equal((await webhook.POST(new Request('https://wml.example/api/pro/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${timestamp},v1=${signature}` }, body: raw }))).status, 400)
  }
})

test('existing subscriptions are detected without granting a private portal session', async t => {
  const billing = loadTypescript('src/lib/stripePro.ts')
  t.mock.method(globalThis, 'fetch', async url => {
    if (url.includes('/customers?')) return json({ data: [{ id: 'cus_paid' }] })
    return json({ data: [{ status: 'active', metadata: { wml_product: 'wml-pro' } }] })
  })
  assert.equal(await billing.existingProSubscriber('buyer@example.org'), true)
})

test('an active subscriber receives the existing entitlement by email without a second checkout', async t => {
  const previousSender = process.env.WML_PRO_FROM_EMAIL
  const previousBrevo = process.env.BREVO_API_KEY
  process.env.WML_PRO_FROM_EMAIL = 'sender@example.org'
  process.env.BREVO_API_KEY = 'test-brevo-key'
  const end = Math.floor(Date.now() / 1000) + 30 * 86400
  const price = { id: 'price_monthly', active: true, currency: 'eur', unit_amount: 499, recurring: { interval: 'month', interval_count: 1 } }
  const subscription = {
    id: 'sub_existing', customer: 'cus_existing', created: Math.floor(Date.now() / 1000) - 86400,
    status: 'active', current_period_end: end,
    metadata: { wml_product: 'wml-pro', wml_plan: 'monthly', wml_price_id: price.id, wml_license_id: 'existing-license' },
    items: { data: [{ id: 'si_existing', quantity: 1, price }] },
    latest_invoice: { id: 'in_existing', subscription: 'sub_existing', paid: true, status: 'paid', charge: { id: 'ch_existing', amount: 499, amount_refunded: 0, disputed: false }, lines: { data: [{ price, subscription_item: 'si_existing', period: { end } }] } },
  }
  let mailedLicense = null
  let checkoutRequests = 0
  t.mock.method(globalThis, 'fetch', async (input, init) => {
    const url = new URL(input)
    if (url.hostname === 'api.brevo.com') {
      const email = JSON.parse(init.body)
      assert.equal(email.to[0].email, 'buyer@example.org')
      mailedLicense = JSON.parse(Buffer.from(email.attachment[0].content, 'base64').toString('utf8'))
      return json({ messageId: 'sent' })
    }
    if (url.pathname === '/v1/customers') return json({ data: [{ id: 'cus_existing' }] })
    if (url.pathname === '/v1/subscriptions') return json({ data: [subscription] })
    if (url.pathname === '/v1/subscriptions/sub_existing') return json(subscription)
    if (url.pathname === '/v1/checkout/sessions') checkoutRequests++
    throw new Error(`Unexpected endpoint: ${url.pathname}`)
  })
  try {
    const route = loadTypescript('src/app/api/pro/checkout/route.ts')
    const response = await route.POST(new Request('https://wml.example/api/pro/checkout', {
      method: 'POST', headers: { origin: 'https://wml.example' },
      body: JSON.stringify({ email: 'buyer@example.org', plan: 'monthly', locale: 'es', acceptedTerms: true }),
    }))
    assert.equal(response.status, 200, JSON.stringify(await response.clone().json()))
    assert.equal((await response.json()).recovery, true)
    assert.equal(mailedLicense.subject, subscription.id)
    assert.equal(checkoutRequests, 0)
  } finally {
    if (previousSender === undefined) delete process.env.WML_PRO_FROM_EMAIL
    else process.env.WML_PRO_FROM_EMAIL = previousSender
    if (previousBrevo === undefined) delete process.env.BREVO_API_KEY
    else process.env.BREVO_API_KEY = previousBrevo
  }
})

test('checkout keeps www and local return origins while rejecting foreign hosts', () => {
  const config = loadTypescript('src/lib/proConfig.ts')
  assert.equal(config.proAllowedOrigin('https://www.wml.example'), 'https://www.wml.example')
  for (const value of ['https://wml.example.evil.org', 'https://user@wml.example', null]) assert.throws(() => config.proAllowedOrigin(value), /invalid_origin/)
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  assert.equal(config.proAllowedOrigin('http://localhost:3000'), 'http://localhost:3000')
  process.env.NODE_ENV = 'production'
  assert.throws(() => config.proAllowedOrigin('http://localhost:3000'), /invalid_origin/)
  if (previous === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = previous
})
