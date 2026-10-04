import { createPublicKey, verify } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { loadTypescript } from './test-helpers.mjs'

const input = process.argv[2]
if (!input) throw new Error('Usage: node scripts/diagnose-pro-license.mjs PATH_TO_LICENSE')
const root = path.resolve(import.meta.dirname, '..')
Object.assign(process.env, parseEnv(readFileSync(path.join(root, '.env.local'), 'utf8')))
const license = JSON.parse(readFileSync(path.resolve(input), 'utf8'))
const signing = loadTypescript('src/lib/proLicense.ts')
const widgetEnv = parseEnv(readFileSync(path.join(root, '..', 'wml-xx0', '.env.pro'), 'utf8'))
const widgetPublic = createPublicKey(widgetEnv.WML_PRO_LICENSE_PUBLIC_KEY.replace(/\\n/g, '\n'))
const signatureValidForWidget = typeof license.signature === 'string' && verify(
  null, Buffer.from(signing.canonicalProLicense(license)), widgetPublic, Buffer.from(license.signature, 'base64'),
)
let paidPeriod = null
let stripeStatus = 'unavailable'
if (/^(?:sk|rk)_test_/.test(process.env.WML_PRO_STRIPE_SECRET_KEY ?? '') && /^sub_[A-Za-z0-9]+$/.test(license.subject ?? '')) {
  const stripe = loadTypescript('src/lib/stripePro.ts')
  const subscription = await stripe.retrieveProSubscription(license.subject)
  stripeStatus = subscription.status
  try {
    const entitlement = await stripe.paidProEntitlement(subscription)
    paidPeriod = { plan: entitlement.plan, endsAt: new Date(entitlement.paidUntil * 1000).toISOString() }
  } catch { /* Report the current Stripe status without exposing customer data. */ }
}
console.log(JSON.stringify({
  signatureValidForWidget,
  schemaValidForServer: signing.verifyProLicense(license),
  plan: license.plan,
  expiresAt: license.expiresAt,
  deviceBound: Boolean(license.deviceId),
  stripeStatus,
  paidPeriod,
  activationUrlConfigured: /^https:\/\//.test(widgetEnv.WML_PRO_LICENSE_ACTIVATION_URL ?? ''),
}, null, 2))
