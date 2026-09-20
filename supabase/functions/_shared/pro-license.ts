declare const Deno: {
  env: {
    get(name: string): string | undefined
  }
}

export type LicenseRecord = {
  id: string
  subject: string
  plan: 'monthly'
  status: 'active' | 'revoked' | 'expired'
  issued_at: string
  expires_at: string
  offline_until: string
  max_devices: number
}

export type ActivationRecord = {
  id: string
  license_id: string
  device_id: string
  status: 'active' | 'revoked'
}

export type ProLicense = {
  subject: string
  plan: 'monthly'
  issuedAt: string
  expiresAt: string
  offlineUntil: string
  lastVerifiedAt: string
  activationId: string
  deviceId: string
  signature: string
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

export function canonicalLicensePayload(license: Partial<ProLicense>) {
  return JSON.stringify({
    subject: license.subject ?? '',
    plan: license.plan ?? '',
    issuedAt: license.issuedAt ?? '',
    expiresAt: license.expiresAt ?? '',
    offlineUntil: license.offlineUntil ?? '',
    lastVerifiedAt: license.lastVerifiedAt ?? '',
    activationId: license.activationId ?? '',
    deviceId: license.deviceId ?? '',
  })
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

function normalizePem(pem: string) {
  return pem.replace(/\\n/g, '\n')
}

function pemToBytes(pem: string) {
  const base64 = normalizePem(pem)
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '')
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(base64: string) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
}

function ed25519SeedFromPkcs8(pem: string) {
  const der = pemToBytes(pem)
  if (der.length < 32) throw new Error('Invalid Ed25519 private key')
  return der.slice(-32)
}

function ed25519PublicKeyFromSpki(pem: string) {
  const der = pemToBytes(pem)
  if (der.length < 32) throw new Error('Invalid Ed25519 public key')
  return der.slice(-32)
}

async function getEd25519() {
  // @ts-expect-error Deno resolves remote modules when Supabase deploys Edge Functions.
  const mod = await import('https://esm.sh/@noble/curves@1.9.6/ed25519')
  return mod.ed25519 as {
    getPublicKey(privateKey: Uint8Array): Uint8Array
    sign(message: Uint8Array, privateKey: Uint8Array): Uint8Array
    verify(signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean
  }
}

export async function signLicense(license: Omit<ProLicense, 'signature'>): Promise<ProLicense> {
  const privateKey = ed25519SeedFromPkcs8(getRequiredEnv('WML_PRO_LICENSE_PRIVATE_KEY'))
  const ed25519 = await getEd25519()
  const payload = new TextEncoder().encode(canonicalLicensePayload(license))
  const signature = ed25519.sign(payload, privateKey)

  return {
    ...license,
    signature: bytesToBase64(signature),
  }
}

export async function verifyLicenseSignature(license: ProLicense) {
  if (!license.signature) return false

  const privateKey = ed25519SeedFromPkcs8(getRequiredEnv('WML_PRO_LICENSE_PRIVATE_KEY'))
  const publicKeyPem = Deno.env.get('WML_PRO_LICENSE_PUBLIC_KEY')
  const publicKey = publicKeyPem
    ? ed25519PublicKeyFromSpki(publicKeyPem)
    : (await getEd25519()).getPublicKey(privateKey)
  const ed25519 = await getEd25519()
  const payload = new TextEncoder().encode(canonicalLicensePayload(license))

  try {
    return ed25519.verify(base64ToBytes(license.signature), payload, publicKey)
  } catch {
    return false
  }
}

export function licenseFromRecord(
  record: LicenseRecord,
  lastVerifiedAt: string,
  activation?: Pick<ActivationRecord, 'id' | 'device_id'> | null,
): Omit<ProLicense, 'signature'> {
  return {
    subject: record.subject,
    plan: record.plan,
    issuedAt: new Date(record.issued_at).toISOString(),
    expiresAt: new Date(record.expires_at).toISOString(),
    offlineUntil: new Date(record.offline_until).toISOString(),
    lastVerifiedAt,
    activationId: activation?.id ?? '',
    deviceId: activation?.device_id ?? '',
  }
}

export async function supabaseRest<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getRequiredEnv('SUPABASE_URL').replace(/\/$/, '')}/rest/v1/${path}`
  const serviceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Supabase REST ${response.status}: ${text}`)
  }

  if (response.status === 204) return null as T
  return (await response.json()) as T
}

export async function findActiveLicense(subject: string) {
  const rows = await supabaseRest<LicenseRecord[]>(
    `pro_licenses?select=*&subject=eq.${encodeURIComponent(subject)}&status=eq.active&limit=1`,
  )

  return rows[0] ?? null
}

export async function findLicenseBySubject(subject: string) {
  const rows = await supabaseRest<LicenseRecord[]>(
    `pro_licenses?select=*&subject=eq.${encodeURIComponent(subject)}&limit=1`,
  )

  return rows[0] ?? null
}

export async function recordEvent(
  event_type: string,
  metadata: Record<string, unknown>,
  license_id?: string | null,
  activation_id?: string | null,
) {
  await supabaseRest('pro_license_events', {
    method: 'POST',
    body: JSON.stringify({
      event_type,
      metadata,
      license_id: license_id ?? null,
      activation_id: activation_id ?? null,
    }),
  })
}

export function normalizeSubject(subject: unknown) {
  return typeof subject === 'string' ? subject.trim().toLowerCase() : ''
}
