import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import path from 'node:path'
import { loadTypescript } from './test-helpers.mjs'

// Run after publishing the new website. The next invoice uses the new price,
// while the existing paid period keeps its invoice and billing date.
const apply = process.argv.includes('--apply')
if (process.argv.some((arg, index) => index > 1 && arg !== '--apply')) {
  throw new Error('Usage: node scripts/migrate-pro-prices.mjs [--apply]')
}
const root = path.resolve(import.meta.dirname, '..')
const env = parseEnv(readFileSync(path.join(root, '.env.local'), 'utf8'))
const key = env.WML_PRO_STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY
if (!/^(sk|rk)_live_/.test(key || '')) throw new Error('A live Stripe key is required')
const { PRO_PLANS, PRO_PRICE_LOOKUP_VERSION } = loadTypescript('src/lib/proConfig.ts')

async function stripe(endpoint, params, idempotencyKey) {
  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method: params ? 'POST' : 'GET', body: params,
    headers: {
      Authorization: `Bearer ${key}`, 'Stripe-Version': '2024-06-20',
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    signal: AbortSignal.timeout(15000),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(`Stripe ${endpoint.split('?')[0]}: HTTP ${response.status} ${result?.error?.code || result?.error?.type || 'unknown'}`)
  return result
}

async function listActiveProSubscriptions() {
  const result = []
  let cursor = ''
  while (true) {
    const page = await stripe(`/subscriptions?status=active&limit=100${cursor ? `&starting_after=${cursor}` : ''}`)
    result.push(...page.data.filter(sub => sub.metadata?.wml_product === 'wml-pro'))
    if (!page.has_more || !page.data.length) return result
    cursor = page.data.at(-1).id
  }
}

async function currentPrice(plan) {
  const lookup = `wml-pro-${plan}-eur-${PRO_PRICE_LOOKUP_VERSION}`
  const page = await stripe(`/prices?lookup_keys[]=${lookup}&limit=2`)
  if (page.data.length !== 1) throw new Error(`Expected one current ${plan} price`)
  const price = page.data[0]
  if (!price.active || price.product !== 'wml_pro_v1' || price.currency !== 'eur' ||
      price.unit_amount !== PRO_PLANS[plan].amount || price.recurring?.interval !== PRO_PLANS[plan].interval ||
      price.recurring?.interval_count !== 1) throw new Error(`The ${plan} price does not match the website`)
  return price
}

function checkedSubscription(sub) {
  const plan = sub.metadata?.wml_plan
  const item = sub.items?.data?.[0]
  const price = item?.price
  if (!PRO_PLANS[plan] || sub.items.data.length !== 1 || item.quantity !== 1 ||
      sub.status !== 'active' || sub.cancel_at || sub.cancel_at_period_end || sub.trial_end ||
      sub.pending_update || sub.pause_collection || sub.collection_method !== 'charge_automatically' ||
      sub.automatic_tax?.enabled || sub.discount || sub.discounts?.length ||
      sub.default_tax_rates?.length || item.tax_rates?.length ||
      !/^si_[A-Za-z0-9]+$/.test(item.id) || !/^price_[A-Za-z0-9]+$/.test(price?.id || '') ||
      sub.metadata.wml_price_id !== price.id || price.product !== 'wml_pro_v1' ||
      price.currency !== 'eur' || price.recurring?.interval !== PRO_PLANS[plan].interval ||
      price.recurring?.interval_count !== 1 || !Number.isInteger(price.unit_amount) || price.unit_amount <= 0 ||
      sub.current_period_end <= Math.floor(Date.now() / 1000)) {
    throw new Error('A Pro subscription needs individual review; no migration was started')
  }
  return { plan, item }
}

async function checkedSchedule(sub, nextPrice) {
  if (!sub.schedule) return null
  const schedule = await stripe(`/subscription_schedules/${sub.schedule}`)
  if (schedule.status !== 'active' || schedule.subscription !== sub.id || schedule.end_behavior !== 'release' ||
      schedule.phases?.length !== 2 || schedule.phases[1].items?.[0]?.price !== nextPrice.id ||
      schedule.phases[1].metadata?.wml_price_id !== nextPrice.id ||
      schedule.phases[1].proration_behavior !== 'none' ||
      (sub.items.data[0].price.id !== nextPrice.id &&
        (schedule.phases[0].items?.[0]?.price !== sub.items.data[0].price.id ||
          schedule.phases[0].end_date !== sub.current_period_end))) {
    throw new Error('A Pro subscription has a different schedule; no migration was started')
  }
  return schedule
}

async function websiteReady() {
  const origin = new URL(env.WML_PRO_SITE_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.whitemirrorlab.com')
  if (origin.protocol !== 'https:') throw new Error('Expected an HTTPS Pro site')
  const url = new URL('/api/pro/checkout', origin)
  url.searchParams.set('pro_price_check', String(Date.now()))
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) })
  if (!response.ok) return false
  const published = await response.json().catch(() => null)
  return published?.monthly === PRO_PLANS.monthly.amount &&
    published?.annual === PRO_PLANS.annual.amount &&
    published?.priceVersion === PRO_PRICE_LOOKUP_VERSION
}

const prices = Object.fromEntries(await Promise.all(Object.keys(PRO_PLANS).map(async plan => [plan, await currentPrice(plan)])))
const subscriptions = await listActiveProSubscriptions()
const targets = []
for (const sub of subscriptions) {
  const { plan, item } = checkedSubscription(sub)
  const schedule = await checkedSchedule(sub, prices[plan])
  if (item.price.id !== prices[plan].id || schedule) targets.push({ sub, plan, item, schedule })
}
const siteReady = await websiteReady()
if (!apply) {
  console.log(JSON.stringify({ mode: 'dry-run', siteReady, activePro: subscriptions.length,
    toFinish: targets.length, withSchedule: targets.filter(target => target.schedule).length }))
  process.exit(0)
}
if (!siteReady) throw new Error('The production website does not show the new Pro prices; Stripe was not changed')

let finished = 0
for (const { sub, plan, item } of targets) {
  const fresh = await stripe(`/subscriptions/${sub.id}`)
  const checked = checkedSubscription(fresh)
  const schedule = await checkedSchedule(fresh, prices[plan])
  if (checked.plan !== plan || checked.item.price.id !== item.price.id ||
      fresh.current_period_end !== sub.current_period_end || fresh.latest_invoice !== sub.latest_invoice ||
      fresh.schedule !== sub.schedule) throw new Error('A subscription changed during migration')

  if (schedule) {
    await stripe(`/subscription_schedules/${schedule.id}/release`, new URLSearchParams(),
      `wml-pro-schedule-release-${sub.id}-${PRO_PRICE_LOOKUP_VERSION}`)
  }
  if (item.price.id !== prices[plan].id) {
    await stripe(`/subscriptions/${sub.id}`, new URLSearchParams({
      'items[0][id]': item.id,
      'items[0][price]': prices[plan].id,
      'items[0][quantity]': '1',
      proration_behavior: 'none',
      billing_cycle_anchor: 'unchanged',
      'metadata[wml_price_id]': prices[plan].id,
    }), `wml-pro-price-update-${sub.id}-${PRO_PRICE_LOOKUP_VERSION}`)
  }
  const after = await stripe(`/subscriptions/${sub.id}`)
  if (after.schedule || after.items?.data?.[0]?.price?.id !== prices[plan].id ||
      after.metadata?.wml_price_id !== prices[plan].id ||
      after.current_period_end !== sub.current_period_end || after.latest_invoice !== sub.latest_invoice ||
      after.cancel_at_period_end !== sub.cancel_at_period_end) {
    throw new Error('Subscription migration needs review; the paid period must stay unchanged')
  }
  finished++
}
console.log(JSON.stringify({ mode: 'applied', finished, activePro: subscriptions.length }))
