import { validateJsonFields } from '@/lib/requestValidation'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rateLimit'

type RequestProLicenseBody = {
  email?: string
  website?: string
  formStartedAt?: number
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
    validateJsonFields(body, { strings: ['email', 'website'], numbers: ['formStartedAt'] })
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // An email address alone proves neither ownership nor payment.
  return NextResponse.json({ ok: false, error: 'use_stripe_checkout' }, {
    status: 410, headers: { ...rateLimitHeaders(rateLimit), 'Cache-Control': 'no-store' },
  })
}
