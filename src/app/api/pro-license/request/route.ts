import { NextResponse } from 'next/server'
import { isValidEmailAddress } from '@/lib/emailValidation'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

type RequestProLicenseBody = {
  email?: string
  website?: string
  formStartedAt?: number
}

function getRequestFunctionConfig() {
  const explicitUrl = process.env.WML_PRO_LICENSE_REQUEST_URL
  const activationUrl = process.env.WML_PRO_LICENSE_ACTIVATION_URL
  const supabaseUrl = process.env.WML_SUPABASE_URL
  const anonKey = process.env.WML_SUPABASE_ANON_KEY

  const functionUrl =
    explicitUrl ||
    (activationUrl?.endsWith('/pro-license')
      ? activationUrl.replace(/\/pro-license$/, '/request-pro-license')
      : null) ||
    (supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/request-pro-license` : null)

  if (!functionUrl || !anonKey) {
    throw new Error('Missing WML Pro license request configuration')
  }

  return { functionUrl, anonKey }
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit({
    key: `pro-license-request:${clientIp}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })

  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: 'too_many_requests' },
      { status: 429, headers: rateLimitHeaders(rateLimit) },
    )
  }

  let body: RequestProLicenseBody

  try {
    body = (await request.json()) as RequestProLicenseBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const honeypot = body.website?.trim()
  const formStartedAt = Number(body.formStartedAt)

  if (honeypot) {
    return NextResponse.json({ ok: false, error: 'invalid_submission' }, { status: 422 })
  }

  if (
    !Number.isFinite(formStartedAt) ||
    Date.now() - formStartedAt < 1200 ||
    Date.now() - formStartedAt > 2 * 60 * 60 * 1000
  ) {
    return NextResponse.json({ ok: false, error: 'invalid_form_timing' }, { status: 422 })
  }

  if (!email || !isValidEmailAddress(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 422 })
  }

  try {
    const { functionUrl, anonKey } = getRequestFunctionConfig()
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ subject: email }),
    })

    const payload = await response.json().catch(() => ({
      ok: false,
      error: 'invalid_license_service_response',
    }))

    return NextResponse.json(payload, {
      status: response.ok ? 200 : response.status,
      headers: rateLimitHeaders(rateLimit),
    })
  } catch (error) {
    console.error('WML Pro license request failed:', error)
    return NextResponse.json(
      { ok: false, error: 'license_service_unavailable' },
      { status: 503, headers: rateLimitHeaders(rateLimit) },
    )
  }
}
