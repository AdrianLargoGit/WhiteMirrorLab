import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parseEnv } from 'node:util'
import { loadTypescript } from './test-helpers.mjs'

if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--live')) {
  throw new Error('Usage: node scripts/provision-pro-prices.mjs [--live]')
}
const root = path.resolve(import.meta.dirname, '..')
if (!process.env.WML_PRO_STRIPE_SECRET_KEY) {
  const envFile = path.join(root, '.env.local')
  if (existsSync(envFile)) Object.assign(process.env, parseEnv(readFileSync(envFile, 'utf8')))
}
const key = process.env.WML_PRO_STRIPE_SECRET_KEY?.trim()
if (!key || !/^(sk|rk)_(test|live)_/.test(key)) throw new Error('WML_PRO_STRIPE_SECRET_KEY is missing or invalid')
const live = /^(sk|rk)_live_/.test(key)
if (live !== (process.argv[2] === '--live')) throw new Error(live ? 'Live mode requires --live' : 'The local key is for test mode; omit --live')

const stripe = loadTypescript('src/lib/stripePro.ts')
const { PRO_PLANS } = loadTypescript('src/lib/proConfig.ts')
for (const plan of ['monthly', 'annual']) {
  const id = await stripe.resolveProPrice(plan)
  console.log(`${live ? 'LIVE' : 'TEST'} ${plan}: ${id}, ${PRO_PLANS[plan].amount} EUR cents`)
}
