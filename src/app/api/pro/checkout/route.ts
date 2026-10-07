import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isValidEmailAddress } from '@/lib/emailValidation'
import { validateJsonFields } from '@/lib/requestValidation'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { PRO_CHECKOUT_COOKIE, PRO_COOKIE_OPTIONS, PRO_PLANS, PRO_PRIVATE_HEADERS, PRO_PRICE_LOOKUP_VERSION, proInstallerUrl, proAllowedOrigin, proPortalLoginUrl } from '@/lib/proConfig'
import { checkProSigningConfiguration } from '@/lib/proLicense'
import { createProCheckout, ensureProPortal, existingProSubscriber, paidProEntitlementForEmail } from '@/lib/stripePro'
import { makeProLicense } from '@/lib/proLicense'
import { sendPaidProLicenseEmail } from '@/lib/proEmail'
import { proApiError } from '@/lib/proApi'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    monthly: PRO_PLANS.monthly.amount,
    annual: PRO_PLANS.annual.amount,
    priceVersion: PRO_PRICE_LOOKUP_VERSION,
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  let body: { email?: string; plan?: string; locale?: string; acceptedTerms?: boolean }
  try {
    body = await request.json()
    validateJsonFields(body, { strings: ['email', 'plan', 'locale'] })
  } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }) }
  const email = body.email?.trim().toLowerCase()
  if (!email || !isValidEmailAddress(email) || (body.plan !== 'monthly' && body.plan !== 'annual') || body.acceptedTerms !== true) {
    return NextResponse.json({ ok: false, error: 'invalid_checkout' }, { status: 422 })
  }
  const limit = checkRateLimit({ key: `pro-checkout:${getClientIp(request)}`, limit: 10, windowMs: 3600000 })
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429 })
  try {
    // Validate signing, download URL and billing management before charging.
    const origin = proAllowedOrigin(request.headers.get('origin'))
    proInstallerUrl()
    checkProSigningConfiguration()
    if (await existingProSubscriber(email)) {
      const purchase = await paidProEntitlementForEmail(email)
      if (purchase) {
        const { subscription, plan, paidUntil } = purchase
        await sendPaidProLicenseEmail({
          email, plan, paidUntil,
          license: makeProLicense({ subscriptionId: subscription.id, plan, issuedAt: subscription.created, paidUntil }),
          purpose: 'recovery',
        })
        return NextResponse.json({ ok: true, recovery: true }, { headers: PRO_PRIVATE_HEADERS })
      }
      const portalUrl = process.env.WML_PRO_PORTAL_LOGIN_URL?.trim()
        ? proPortalLoginUrl() : (await ensureProPortal()).login_page!.url!
      return NextResponse.json({ ok: true, url: portalUrl }, { headers: PRO_PRIVATE_HEADERS })
    }
    if (!process.env.WML_PRO_PORTAL_LOGIN_URL?.trim()) await ensureProPortal()
    else proPortalLoginUrl()
    const jar = await cookies()
    const existing = jar.get(PRO_CHECKOUT_COOKIE)?.value
    const accessToken = existing && /^[a-f0-9]{64}$/.test(existing) ? existing : randomBytes(32).toString('hex')
    const session = await createProCheckout({ email, plan: body.plan, locale: body.locale === 'en' ? 'en' : 'es', accessToken, origin })
    if (!session.url || new URL(session.url).protocol !== 'https:' || new URL(session.url).hostname !== 'checkout.stripe.com') throw new Error('Invalid Stripe checkout URL')
    const response = NextResponse.json({ ok: true, url: session.url }, { headers: PRO_PRIVATE_HEADERS })
    response.cookies.set(PRO_CHECKOUT_COOKIE, accessToken, PRO_COOKIE_OPTIONS)
    return response
  } catch (error) { return proApiError(error) }
}
