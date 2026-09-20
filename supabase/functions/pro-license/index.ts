import {
  type ActivationRecord,
  type ProLicense,
  corsHeaders,
  findLicenseBySubject,
  jsonResponse,
  licenseFromRecord,
  normalizeSubject,
  recordEvent,
  signLicense,
  supabaseRest,
  verifyLicenseSignature,
} from '../_shared/pro-license.ts'

declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

type LicenseOperationBody = {
  operation?: 'activate' | 'usage'
  license?: ProLicense
  licenseHash?: string
  subject?: string
  deviceId?: string
  deviceName?: string
  platform?: string
  appVersion?: string
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405)

  let body: LicenseOperationBody

  try {
    body = await request.json()
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, 400)
  }

  const operation = body.operation
  if (operation !== 'activate' && operation !== 'usage') {
    return jsonResponse({ ok: false, error: 'invalid_operation' }, 400)
  }

  const incomingLicense = body.license
  const subject = normalizeSubject(body.subject || incomingLicense?.subject)
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : ''

  if (!incomingLicense || !subject || !deviceId) {
    return jsonResponse({ ok: false, error: 'invalid_request' }, 400)
  }

  const signatureIsValid = await verifyLicenseSignature(incomingLicense)
  if (!signatureIsValid) {
    await recordEvent('license_invalid_signature', { subject, operation, licenseHash: body.licenseHash })
    return jsonResponse({ ok: false, error: 'license_invalid_signature' }, 401)
  }

  if (normalizeSubject(incomingLicense.subject) !== subject) {
    return jsonResponse({ ok: false, error: 'device_mismatch' }, 409)
  }

  if (incomingLicense.deviceId && incomingLicense.deviceId !== deviceId) {
    return jsonResponse({ ok: false, error: 'device_mismatch' }, 409)
  }

  const license = await findLicenseBySubject(subject)
  if (!license) {
    await recordEvent('license_not_found', { subject, operation, licenseHash: body.licenseHash })
    return jsonResponse({ ok: false, error: 'license_not_found' }, 404)
  }

  if (license.status === 'revoked') {
    await recordEvent('license_revoked', { subject, operation }, license.id)
    return jsonResponse({ ok: false, revoked: true, error: 'license_revoked' }, 403)
  }

  if (new Date(license.expires_at).getTime() <= Date.now()) {
    await supabaseRest(`pro_licenses?id=eq.${license.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'expired' }),
    })
    await recordEvent('license_expired', { subject, operation }, license.id)
    return jsonResponse({ ok: false, error: 'license_expired' }, 403)
  }

  let activation: ActivationRecord | null = null
  const existingActivations = await supabaseRest<ActivationRecord[]>(
    `pro_license_activations?select=*&license_id=eq.${license.id}&device_id=eq.${encodeURIComponent(deviceId)}&limit=1`,
  )
  activation = existingActivations[0] ?? null

  if (operation === 'usage') {
    if (!activation) {
      return jsonResponse({ ok: false, error: 'device_mismatch' }, 409)
    }

  }

  if (incomingLicense.activationId && activation && incomingLicense.activationId !== activation.id) {
    return jsonResponse({ ok: false, error: 'device_mismatch' }, 409)
  }

  if (activation?.status === 'revoked') {
    await recordEvent('activation_revoked', { subject, operation, deviceId }, license.id, activation.id)
    return jsonResponse({ ok: false, revoked: true, error: 'activation_revoked' }, 403)
  }

  if (!activation) {
    const activeActivations = await supabaseRest<Pick<ActivationRecord, 'id'>[]>(
      `pro_license_activations?select=id&license_id=eq.${license.id}&status=eq.active`,
    )

    if (activeActivations.length >= license.max_devices) {
      await recordEvent('device_limit_reached', { subject, deviceId }, license.id)
      return jsonResponse({ ok: false, error: 'device_limit_reached' }, 403)
    }

    const inserted = await supabaseRest<ActivationRecord[]>('pro_license_activations', {
      method: 'POST',
      body: JSON.stringify({
        license_id: license.id,
        device_id: deviceId,
        device_name: body.deviceName || null,
        platform: body.platform || null,
        app_version: body.appVersion || null,
      }),
    })
    activation = inserted[0]
  } else {
    const updated = await supabaseRest<ActivationRecord[]>(
      `pro_license_activations?id=eq.${activation.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          last_seen_at: new Date().toISOString(),
          device_name: body.deviceName || null,
          platform: body.platform || null,
          app_version: body.appVersion || null,
        }),
      },
    )
    activation = updated[0] ?? activation
  }

  const now = new Date().toISOString()
  const signedLicense = await signLicense(licenseFromRecord(license, now, activation))
  await recordEvent(operation, { subject, deviceId, licenseHash: body.licenseHash }, license.id, activation.id)

  return jsonResponse({ ok: true, license: signedLicense })
})
