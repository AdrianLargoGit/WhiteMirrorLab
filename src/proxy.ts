import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CONSENT_COOKIE } from '@/lib/consent'
import { applySecurityHeaders } from '@/lib/securityHeaders'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  ROUTES,
  alternateLocalePath,
  getLocaleFromAcceptLanguage,
  isLocale,
  toInternalPath,
  type Locale,
} from '@/lib/i18n'

const PUBLIC_WEB_PATHS = ['/web/auth', '/web/consent']

export async function proxy(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname
  const hasEnglishUrl = originalPathname === ROUTES.en.home || originalPathname.startsWith(`${ROUTES.en.home}/`)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const locale: Locale = hasEnglishUrl
    ? 'en'
    : isLocale(cookieLocale)
    ? cookieLocale
    : getLocaleFromAcceptLanguage(request.headers.get('accept-language'))
  const pathname = toInternalPath(originalPathname)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-wml-locale', locale)

  if (originalPathname === '/' && locale === 'en') {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.en.home
    const response = NextResponse.redirect(url)
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return applySecurityHeaders(response)
  }

  if (locale === 'en' && !hasEnglishUrl) {
    const url = request.nextUrl.clone()
    if (originalPathname === ROUTES.es.blog || originalPathname.startsWith(`${ROUTES.es.blog}/`)) {
      url.pathname = originalPathname.replace(ROUTES.es.blog, ROUTES.en.blog)
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.experiments) {
      url.pathname = ROUTES.en.experiments
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.contact) {
      url.pathname = ROUTES.en.contact
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.faro) {
      url.pathname = ROUTES.en.faro
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.download) {
      url.pathname = ROUTES.en.download
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.marketplace || originalPathname.startsWith(`${ROUTES.es.marketplace}/`)) {
      url.pathname = originalPathname.replace(ROUTES.es.marketplace, ROUTES.en.marketplace)
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.skinTemplate) {
      url.pathname = ROUTES.en.skinTemplate
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.wml || originalPathname.startsWith(`${ROUTES.es.wml}/`)) {
      url.pathname = originalPathname.replace(ROUTES.es.wml, ROUTES.en.wml)
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname.startsWith(`${ROUTES.es.publicProfile}/`)) {
      url.pathname = originalPathname.replace(ROUTES.es.publicProfile, ROUTES.en.publicProfile)
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (originalPathname === ROUTES.es.legal || originalPathname.startsWith(`${ROUTES.es.legal}/`)) {
      url.pathname = alternateLocalePath(originalPathname, 'en')
      return applySecurityHeaders(NextResponse.redirect(url))
    }
  }

  const responseInit = { request: { headers: requestHeaders } }
  let supabaseResponse = hasEnglishUrl
    ? NextResponse.rewrite(new URL(pathname + request.nextUrl.search, request.url), responseInit)
    : NextResponse.next(responseInit)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_WML_1_0!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WML_1_0!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = hasEnglishUrl
            ? NextResponse.rewrite(new URL(pathname + request.nextUrl.search, request.url), responseInit)
            : NextResponse.next(responseInit)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const hasConsent = request.cookies.get(CONSENT_COOKIE)?.value === '1'
  const isPublicWeb = PUBLIC_WEB_PATHS.some((p) => pathname.startsWith(p))
  const pathForLocale = (nextPathname: string) =>
    locale === DEFAULT_LOCALE
      ? nextPathname
      : nextPathname.replace(ROUTES.es.wml, ROUTES.en.wml)

  if (
    pathname.startsWith('/web') &&
    pathname !== '/web/consent' &&
    !hasConsent
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathForLocale('/web/consent')
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  if (pathname === '/web/consent' && hasConsent) {
    const url = request.nextUrl.clone()
    url.pathname = pathForLocale(user ? '/web/feed' : '/web/auth')
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  if (pathname.startsWith('/web') && !isPublicWeb) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = pathForLocale('/web/auth')
      return applySecurityHeaders(NextResponse.redirect(url))
    }
  }

  if (pathname === '/web/auth' && user) {
    const url = request.nextUrl.clone()
    url.pathname = pathForLocale('/web/feed')
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  supabaseResponse.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return applySecurityHeaders(supabaseResponse)
}
