import {
  corsHeaders,
  jsonResponse,
  normalizeSubject,
  recordEvent,
  supabaseRest,
} from '../_shared/pro-license.ts'

declare const Deno: {
  env: {
    get(name: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

type AdminCreateLicenseBody = {
  subject?: string
  months?: number
  maxDevices?: number
  notes?: string
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

  const expectedSecret = Deno.env.get('ADMIN_LICENSE_SECRET')
  const authorization = request.headers.get('Authorization') || ''

  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401)
  }

  let body: AdminCreateLicenseBody

  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400)
  }

  const subject = normalizeSubject(body.subject)
  const months = Math.max(1, Math.min(24, Math.floor(Number(body.months) || 1)))
  const maxDevices = Math.max(1, Math.min(10, Math.floor(Number(body.maxDevices) || 1)))
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 1000) : null

  if (!isValidEmail(subject)) {
    return jsonResponse({ ok: false, error: 'invalid_email' }, 422)
  }

  const issuedAt = new Date()
  const expiresAt = addMonths(issuedAt, months)
  const offlineUntil = addDays(expiresAt, 21)

  try {
    const inserted = await supabaseRest<{ id: string; subject: string; expires_at: string }[]>('pro_licenses', {
      method: 'POST',
      body: JSON.stringify({
        subject,
        plan: 'monthly',
        status: 'active',
        issued_at: issuedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        offline_until: offlineUntil.toISOString(),
        max_devices: maxDevices,
        notes,
      }),
    })
    const license = inserted[0]
    await recordEvent('admin_license_created', { subject, months, maxDevices }, license.id)

    return jsonResponse({
      ok: true,
      licenseId: license.id,
      subject: license.subject,
      expiresAt: new Date(license.expires_at).toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'license_create_failed'
    return jsonResponse({ ok: false, error: message.includes('duplicate') ? 'license_already_exists' : 'license_create_failed' }, 409)
  }
})
