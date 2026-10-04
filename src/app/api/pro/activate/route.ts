import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { PRO_PRIVATE_HEADERS, ProError } from '@/lib/proConfig'
import { makeProLicense, proHash, verifyProLicense } from '@/lib/proLicense'
import { bindProDevice, paidProEntitlement, retrieveProSubscription } from '@/lib/stripePro'
import { proApiError } from '@/lib/proApi'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { operation?: string; license?: unknown; subject?: string; deviceId?: string }
  try {
    body = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body')
  } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }) }
  if ((body.operation !== 'activate' && body.operation !== 'usage') || typeof body.deviceId !== 'string' ||
      !/^[A-Za-z0-9_-]{8,128}$/.test(body.deviceId)) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 })
  }
  const limit = checkRateLimit({ key: `pro-activate:${getClientIp(request)}`, limit: 120, windowMs: 3600000 })
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429 })
  try {
    if (!verifyProLicense(body.license)) throw new ProError('invalid_license', 401)
    const license = body.license
    if ((body.subject && body.subject !== license.subject) || (license.deviceId && license.deviceId !== body.deviceId)) {
      throw new ProError('device_mismatch', 403)
    }
    const subscription = await retrieveProSubscription(license.subject)
    const { plan, paidUntil } = await paidProEntitlement(subscription)
    const activationId = `stripe-${proHash(subscription.metadata.wml_license_id).slice(0, 32)}`
    if (body.operation === 'usage') {
      if (!license.deviceId || license.activationId !== activationId || subscription.metadata.wml_device_hash !== proHash(body.deviceId)) {
        throw new ProError('device_mismatch', 403)
      }
    } else {
      await bindProDevice(subscription, body.deviceId, activationId)
    }
    return NextResponse.json({ ok: true, license: makeProLicense({
      subscriptionId: subscription.id, plan, issuedAt: subscription.created, paidUntil, activationId, deviceId: body.deviceId,
    }) }, { headers: PRO_PRIVATE_HEADERS })
  } catch (error) {
    if (error instanceof ProError && error.status === 403) {
      // The existing desktop client reads revocation only from a 200 JSON response.
      return NextResponse.json({ ok: false, revoked: true, error: `license_activation_denied:${error.code}` }, { headers: PRO_PRIVATE_HEADERS })
    }
    return proApiError(error)
  }
}
