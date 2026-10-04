import { NextResponse, type NextRequest } from 'next/server'
import { applySecurityHeaders } from '@/lib/securityHeaders'
import {
  LOCALE_COOKIE,
  ROUTES,
  alternateLocalePath,
  getLocaleFromAcceptLanguage,
  isLocale,
  toInternalPath,
  type Locale,
} from '@/lib/i18n'

export async function proxy(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname
  if (/^\/(?:api|ingest|_next)(?:\/|$)/.test(originalPathname) || /\.[^/]+$/.test(originalPathname)) {
    return applySecurityHeaders(NextResponse.next(), originalPathname === '/api/pro/installer')
  }
  const hasEnglishUrl = originalPathname === ROUTES.en.home || originalPathname.startsWith(`${ROUTES.en.home}/`)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const locale: Locale = hasEnglishUrl
    ? 'en'
    : isLocale(cookieLocale)
    ? cookieLocale
    : getLocaleFromAcceptLanguage(request.headers.get('accept-language'))
  const pathname = toInternalPath(originalPathname)
  const requestHeaders = new Headers(request.headers)
  const rewrittenFrom = request.headers.get('x-wml-rewritten-from')
  // A local rewrite can re-enter the proxy. Preserve its locale and do not
  // redirect the internal Spanish route back to its public English URL.
  if (rewrittenFrom?.startsWith('/en') && toInternalPath(rewrittenFrom) === originalPathname) {
    requestHeaders.set('x-wml-locale', 'en')
    requestHeaders.delete('x-wml-rewritten-from')
    return applySecurityHeaders(NextResponse.next({ request: { headers: requestHeaders } }))
  }
  requestHeaders.set('x-wml-locale', locale)

  if (pathname.startsWith('/p/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/wml-1-0'
    return applySecurityHeaders(NextResponse.redirect(url))
  }

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
    const localizedPath = alternateLocalePath(originalPathname, 'en')
    if (localizedPath !== originalPathname) {
      const url = request.nextUrl.clone()
      url.pathname = localizedPath
      return applySecurityHeaders(NextResponse.redirect(url))
    }
  }

  if (hasEnglishUrl) requestHeaders.set('x-wml-rewritten-from', originalPathname)
  const responseInit = { request: { headers: requestHeaders } }
  const response = hasEnglishUrl
    ? NextResponse.rewrite(new URL(pathname + request.nextUrl.search, request.url), responseInit)
    : NextResponse.next(responseInit)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return applySecurityHeaders(response)
}
