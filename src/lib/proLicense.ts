import { createHash, createPrivateKey, createPublicKey, sign, verify } from 'node:crypto'
import { ProError, proEnv } from './proConfig'

// The cadence and paid end are part of the signed entitlement. Older monthly
// files remain valid; annual files require a widget that understands annual.
export type ProLicense = {
  subject: string
  plan: 'monthly' | 'annual'
  issuedAt: string
  expiresAt: string
  offlineUntil: string
  lastVerifiedAt: string
  activationId: string
  deviceId: string
  signature: string
}

export function canonicalProLicense(license: Omit<ProLicense, 'signature'>) {
  return JSON.stringify({
    subject: license.subject,
    plan: license.plan,
    issuedAt: license.issuedAt,
    expiresAt: license.expiresAt,
    offlineUntil: license.offlineUntil,
    lastVerifiedAt: license.lastVerifiedAt,
    activationId: license.activationId,
    deviceId: license.deviceId,
  })
}

function signingKey() {
  const key = createPrivateKey(proEnv('WML_PRO_LICENSE_PRIVATE_KEY').replace(/\\n/g, '\n'))
  if (key.asymmetricKeyType !== 'ed25519') throw new ProError('pro_not_configured')
  const configuredPublic = process.env.WML_PRO_LICENSE_PUBLIC_KEY
  if (configuredPublic) {
    const expected = createPublicKey(configuredPublic.replace(/\\n/g, '\n')).export({ type: 'spki', format: 'der' })
    const actual = createPublicKey(key).export({ type: 'spki', format: 'der' })
    if (!actual.equals(expected)) throw new ProError('pro_key_mismatch')
  }
  return key
}

export function checkProSigningConfiguration() { signingKey() }

export function signProLicense(license: Omit<ProLicense, 'signature'>): ProLicense {
  return { ...license, signature: sign(null, Buffer.from(canonicalProLicense(license)), signingKey()).toString('base64') }
}

export function verifyProLicense(value: unknown): value is ProLicense {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const license = value as ProLicense
  const fields = ['subject', 'plan', 'issuedAt', 'expiresAt', 'offlineUntil', 'lastVerifiedAt', 'activationId', 'deviceId', 'signature'] as const
  if (fields.some(field => typeof license[field] !== 'string' || license[field].length > 512)) return false
  if (!/^sub_[A-Za-z0-9]+$/.test(license.subject) || !['monthly', 'annual'].includes(license.plan)) return false
  if (['issuedAt', 'expiresAt', 'offlineUntil', 'lastVerifiedAt'].some(field => !Number.isFinite(Date.parse(license[field as keyof ProLicense])))) return false
  try {
    return verify(null, Buffer.from(canonicalProLicense(license)), createPublicKey(signingKey()), Buffer.from(license.signature, 'base64'))
  } catch { return false }
}

export function proHash(value: string) { return createHash('sha256').update(value).digest('hex') }

export function makeProLicense(input: { subscriptionId: string; plan: 'monthly' | 'annual'; issuedAt: number; paidUntil: number; activationId?: string; deviceId?: string }, now = Date.now()) {
  // The signed file ends at the actual paid-through instant, including annual plans.
  // The widget still revalidates online to learn about refunds and renewals.
  const expiry = new Date(input.paidUntil * 1000).toISOString()
  return signProLicense({
    subject: input.subscriptionId,
    plan: input.plan,
    issuedAt: new Date(input.issuedAt * 1000).toISOString(),
    expiresAt: expiry,
    offlineUntil: expiry,
    lastVerifiedAt: new Date(now).toISOString(),
    activationId: input.activationId ?? '',
    deviceId: input.deviceId ?? '',
  })
}
