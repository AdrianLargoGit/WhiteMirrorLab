import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PRO_CHECKOUT_COOKIE, PRO_PRIVATE_HEADERS, PRO_SESSION_COOKIE, proPortalLoginUrl } from '@/lib/proConfig'
import { createProPortal, ensureProPortal, ownedProCheckout, requirePaidCheckout } from '@/lib/stripePro'
import { proApiError } from '@/lib/proApi'

export const runtime = 'nodejs'

// Stripe's email verification also works after browser cookies expire.
export async function GET() {
  try {
    const url = process.env.WML_PRO_PORTAL_LOGIN_URL?.trim()
      ? proPortalLoginUrl() : (await ensureProPortal()).login_page!.url!
    if (new URL(url).protocol !== 'https:' || new URL(url).hostname !== 'billing.stripe.com') throw new Error('Invalid portal URL')
    const response = NextResponse.redirect(url, 303)
    for (const [key, value] of Object.entries(PRO_PRIVATE_HEADERS)) response.headers.set(key, value)
    return response
  } catch (error) { return proApiError(error) }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return NextResponse.json({ ok: false, error: 'invalid_origin' }, { status: 403 })
    }
    const jar = await cookies()
    const session = await ownedProCheckout(jar.get(PRO_SESSION_COOKIE)?.value ?? '', jar.get(PRO_CHECKOUT_COOKIE)?.value)
    requirePaidCheckout(session)
    // Cancellation and failed renewals must not prevent access to billing.
    const lang = new URL(request.url).searchParams.get('lang') === 'en' ? 'en' : 'es'
    const portal = await createProPortal(session.customer!, lang)
    if (new URL(portal.url).hostname !== 'billing.stripe.com') throw new Error('Invalid portal URL')
    const response = NextResponse.redirect(portal.url, 303)
    for (const [key, value] of Object.entries(PRO_PRIVATE_HEADERS)) response.headers.set(key, value)
    return response
  } catch (error) { return proApiError(error) }
}
