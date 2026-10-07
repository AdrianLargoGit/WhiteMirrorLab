import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Five complimentary, one-year subscriptions. Stripe closes each at the end
// of its free period, so none can turn into a charge. The normal activation
// endpoint permanently binds each signed file to its first computer.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const widget = path.resolve(root, '..', 'wml-xx0')
const env = parseEnv(readFileSync(path.join(root, '.env.local'), 'utf8'))
const key = env.WML_PRO_STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY
const privateKey = createPrivateKey(env.WML_PRO_LICENSE_PRIVATE_KEY.replace(/\\n/g, '\n'))
const configuredPublic = createPublicKey(env.WML_PRO_LICENSE_PUBLIC_KEY.replace(/\\n/g, '\n'))
const widgetEnv = parseEnv(readFileSync(path.join(widget, '.env.pro'), 'utf8'))
const widgetPublic = createPublicKey(widgetEnv.WML_PRO_LICENSE_PUBLIC_KEY.replace(/\\n/g, '\n'))
const der = value => value.export({ type: 'spki', format: 'der' })
if (!key || !der(createPublicKey(privateKey)).equals(der(configuredPublic)) || !der(configuredPublic).equals(der(widgetPublic))) {
  throw new Error('Stripe or matching Pro signing keys unavailable')
}

async function stripe(endpoint, params, idempotencyKey) {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: params ? 'POST' : 'GET',
    body: params,
    headers: {
      Authorization: `Bearer ${key}`,
      'Stripe-Version': '2024-06-20',
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(15000),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(`Stripe ${endpoint}: HTTP ${response.status}, ${result?.error?.code || result?.error?.type || 'unknown'}`)
  return result
}

const pricePage = await stripe('/prices?limit=100')
if (pricePage.has_more) throw new Error('Price list incomplete')
const prices = pricePage.data.filter(p => p.active && p.currency === 'eur' && p.unit_amount === 2999 && p.recurring?.interval === 'year' && p.recurring.interval_count === 1)
if (prices.length !== 1) throw new Error(`Expected one active annual Pro price, found ${prices.length}`)
const priceId = prices[0].id
const countOption = process.argv.find(arg => arg.startsWith('--count='))
const count = countOption ? Number(countOption.slice('--count='.length)) : 5
if (!Number.isInteger(count) || count < 1 || count > 5) throw new Error('Use --count=1 through --count=5')
if (process.argv.includes('--dry-run')) {
  console.log(`READY: matching web/widget signing keys and one active annual Pro price; ${count} no-charge, one-device license(s) can be issued.`)
  process.exit(0)
}

const couponId = 'wml_family_pro_one_year_2026'
let coupon
try { coupon = await stripe(`/coupons/${couponId}`) } catch (error) {
  if (!String(error.message).includes('resource_missing')) throw error
  coupon = await stripe('/coupons', new URLSearchParams({
    id: couponId, name: 'WML family Pro complimentary year', percent_off: '100', duration: 'once',
    'metadata[wml_product]': 'wml-pro',
  }), 'wml-family-pro-2026-coupon')
}
if (coupon.percent_off !== 100 || coupon.duration !== 'once' || !coupon.valid) throw new Error('Complimentary coupon is invalid')

const outputDir = path.join(widget, 'pro-private', 'family-licenses')
mkdirSync(outputDir, { recursive: true })
const now = Date.now()
for (let slot = 1; slot <= count; slot++) {
  const suffix = String(slot).padStart(2, '0')
  const batch = `wml-family-pro-2026-${suffix}`
  const digest = createHash('sha256').update(batch).digest('hex')
  const licenseId = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`
  const customer = await stripe('/customers', new URLSearchParams({
    name: `WML family Pro ${suffix}`,
    'metadata[wml_product]': 'wml-pro',
    'metadata[wml_family_slot]': suffix,
  }), `${batch}-customer`)
  const subscription = await stripe('/subscriptions', new URLSearchParams({
    customer: customer.id,
    'items[0][price]': priceId,
    'items[0][quantity]': '1',
    'discounts[0][coupon]': couponId,
    cancel_at_period_end: 'true',
    payment_behavior: 'error_if_incomplete',
    'metadata[wml_product]': 'wml-pro',
    'metadata[wml_plan]': 'annual',
    'metadata[wml_price_id]': priceId,
    'metadata[wml_license_id]': licenseId,
    'metadata[wml_family_slot]': suffix,
  }), `${batch}-subscription`)
  const active = await stripe(`/subscriptions/${subscription.id}?expand[]=latest_invoice&expand[]=latest_invoice.charge`)
  const invoice = active.latest_invoice
  const item = active.items?.data?.[0]
  const lines = invoice?.lines?.data?.filter(line => line.subscription_item === item?.id && line.price?.id === priceId) || []
  const paidUntil = Math.min(active.current_period_end, active.cancel_at || Infinity, Math.max(0, ...lines.map(line => line.period.end)))
  if (active.status !== 'active' || !active.cancel_at_period_end || active.items.data.length !== 1 ||
      item.quantity !== 1 || active.metadata.wml_license_id !== licenseId ||
      !invoice?.paid || invoice.status !== 'paid' || invoice.subscription !== active.id || invoice.amount_paid !== 0 ||
      invoice.lines.has_more || lines.length !== 1 || !Number.isFinite(paidUntil) || paidUntil * 1000 <= now) {
    throw new Error(`Complimentary subscription ${suffix} failed entitlement checks`)
  }
  const expiry = new Date(paidUntil * 1000).toISOString()
  const license = {
    subject: active.id,
    plan: 'annual',
    issuedAt: new Date(active.created * 1000).toISOString(),
    expiresAt: expiry,
    offlineUntil: expiry,
    lastVerifiedAt: new Date().toISOString(),
    activationId: '',
    deviceId: '',
  }
  const canonical = JSON.stringify(license)
  const signature = sign(null, Buffer.from(canonical), privateKey).toString('base64')
  if (!verify(null, Buffer.from(canonical), widgetPublic, Buffer.from(signature, 'base64'))) {
    throw new Error(`Widget rejected signed license ${suffix}`)
  }
  const file = path.join(outputDir, `family-pro-${suffix}.json`)
  writeFileSync(file, `${JSON.stringify({ ...license, signature }, null, 2)}\n`, { mode: 0o600 })
  console.log(`READY ${suffix}: ${file} (until ${expiry})`)
}
