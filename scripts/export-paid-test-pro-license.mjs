import { createPublicKey } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { loadTypescript } from './test-helpers.mjs'

const root = path.resolve(import.meta.dirname, '..')
const widget = path.resolve(root, '..', 'wml-xx0')
Object.assign(process.env, parseEnv(readFileSync(path.join(root, '.env.local'), 'utf8')))
if (!/^(?:sk|rk)_test_/.test(process.env.WML_PRO_STRIPE_SECRET_KEY ?? '')) {
  throw new Error('This export is limited to Stripe test mode')
}

const stripe = loadTypescript('src/lib/stripePro.ts')
const signing = loadTypescript('src/lib/proLicense.ts')
signing.checkProSigningConfiguration()
const page = await stripe.proStripeRequest('/subscriptions?status=all&limit=100')
if (page.has_more) throw new Error('Select the test subscription explicitly; Stripe returned more than 100')
const candidates = page.data.filter(item => item.metadata?.wml_product === 'wml-pro' && item.status === 'active')
if (candidates.length !== 1) throw new Error(`Expected one active WML Pro test subscription; found ${candidates.length}`)

const { plan, paidUntil, subscription } = await stripe.paidProEntitlement(await stripe.retrieveProSubscription(candidates[0].id))
const license = signing.makeProLicense({ subscriptionId: subscription.id, plan, issuedAt: subscription.created, paidUntil })
if (!signing.verifyProLicense(license)) throw new Error('Newly signed license failed verification')

const widgetEnv = parseEnv(readFileSync(path.join(widget, '.env.pro'), 'utf8'))
const der = key => createPublicKey(key.replace(/\\n/g, '\n')).export({ type: 'spki', format: 'der' })
if (!der(widgetEnv.WML_PRO_LICENSE_PUBLIC_KEY).equals(der(process.env.WML_PRO_LICENSE_PUBLIC_KEY))) {
  throw new Error('Widget and website use different license public keys')
}

const outputDir = path.join(widget, 'pro-private', 'license-test')
mkdirSync(outputDir, { recursive: true })
const output = path.join(outputDir, 'pro-license-purchased-test.json')
writeFileSync(output, `${JSON.stringify(license, null, 2)}\n`, { mode: 0o600 })
console.log(`Verified ${plan} test purchase; signed license expires ${license.expiresAt}; file: ${output}`)
