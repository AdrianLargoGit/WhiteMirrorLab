import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CONSENT_COOKIE } from '@/lib/consent'

const PUBLIC_WEB_PATHS = ['/web/auth', '/web/consent']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const hasConsent = request.cookies.get(CONSENT_COOKIE)?.value === '1'
  const isPublicWeb = PUBLIC_WEB_PATHS.some((p) => pathname.startsWith(p))

  // Consent required before auth or any protected web route
  if (
    pathname.startsWith('/web') &&
    pathname !== '/web/consent' &&
    !hasConsent
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/web/consent'
    return NextResponse.redirect(url)
  }

  if (pathname === '/web/consent' && hasConsent) {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/web/feed' : '/web/auth'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/web') && !isPublicWeb) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/web/auth'
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/web/auth' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/web/feed'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/web/:path*'],
}
