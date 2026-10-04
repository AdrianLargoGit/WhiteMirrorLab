import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PRO_CHECKOUT_COOKIE, PRO_COOKIE_OPTIONS, PRO_PRIVATE_HEADERS, PRO_SESSION_COOKIE, proAllowedOrigin } from '@/lib/proConfig'
import { ownedProCheckout } from '@/lib/stripePro'
import { proApiError } from '@/lib/proApi'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const jar = await cookies()
    const session = await ownedProCheckout(params.get('session_id') ?? '', jar.get(PRO_CHECKOUT_COOKIE)?.value)
    const locale = params.get('lang') === 'en' ? 'en' : 'es'
    // Exchange the query secret before rendering a page with links.
    const origin = proAllowedOrigin(session.metadata.wml_checkout_origin || new URL(request.url).origin)
    const response = NextResponse.redirect(`${origin}/pro/receipt?lang=${locale}`, 303)
    for (const [key, value] of Object.entries(PRO_PRIVATE_HEADERS)) response.headers.set(key, value)
    response.cookies.set(PRO_SESSION_COOKIE, session.id, PRO_COOKIE_OPTIONS)
    return response
  } catch (error) { return proApiError(error) }
}
