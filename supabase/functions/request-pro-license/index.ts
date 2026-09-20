import {
  type LicenseRecord,
  corsHeaders,
  findActiveLicense,
  jsonResponse,
  licenseFromRecord,
  normalizeSubject,
  recordEvent,
  signLicense,
  supabaseRest,
} from '../_shared/pro-license.ts'

declare const Deno: {
  env: {
    get(name: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

type RequestLicenseBody = {
  subject?: string
}

function isValidEmail(subject: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subject) && subject.length <= 254
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405)

  let body: RequestLicenseBody

  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400)
  }

  const subject = normalizeSubject(body.subject)
  if (!isValidEmail(subject)) {
    return jsonResponse({ ok: false, error: 'invalid_email' }, 422)
  }

  let license = await findActiveLicense(subject)
  let status: 'active' | 'created' | 'pending_review' = 'active'

  if (!license && Deno.env.get('WML_PRO_LICENSE_AUTO_CREATE') === 'true') {
    const issuedAt = new Date()
    const expiresAt = addMonths(issuedAt, 1)
    const offlineUntil = addDays(expiresAt, 21)
    const inserted = await supabaseRest<LicenseRecord[]>('pro_licenses', {
      method: 'POST',
      body: JSON.stringify({
        subject,
        plan: 'monthly',
        status: 'active',
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        offline_until: offlineUntil.toISOString(),
        max_devices: 1,
        notes: 'Acceso temprano automatico',
      }),
    })
    license = inserted[0] ?? null
    status = 'created'
  }

  if (!license) {
    await recordEvent('request_pending_review', { subject })
    return jsonResponse({ ok: true, status: 'pending_review', downloadUrl: null, license: null })
  }

  const signedLicense = await signLicense(licenseFromRecord(license, new Date().toISOString(), null))
  await recordEvent(status === 'created' ? 'license_created_from_web' : 'license_recovered_from_web', { subject }, license.id)

  return jsonResponse({
    ok: true,
    status,
    downloadUrl: null,
    license: signedLicense,
  })
})
