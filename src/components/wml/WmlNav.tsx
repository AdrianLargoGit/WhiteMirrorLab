'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { wmlCopy } from '@/lib/copy'
import { getLocaleFromPathname, homePath, toInternalPath, wmlPath } from '@/lib/i18n'

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function WmlNav() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = getLocaleFromPathname(pathname)
  const t = wmlCopy[locale]
  const internalPathname = toInternalPath(pathname)

  const links = [
    { href: wmlPath(locale, '/feed'), path: '/web/feed', label: t.feed },
    { href: wmlPath(locale, '/ranking'), path: '/web/ranking', label: t.ranking },
    { href: wmlPath(locale, '/search'), path: '/web/search', label: t.search },
    { href: wmlPath(locale, '/me'), path: '/web/me', label: t.profile },
  ]

  if (internalPathname === '/web/consent') return null

  const isAuth = internalPathname === '/web/auth'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace(wmlPath(locale, '/auth'))
  }

  if (isAuth) {
    return (
      <header className="wml-back-bar">
        <Link href={homePath(locale)} className="wml-back-link" aria-label={t.backHomeLabel}>
          <IconArrowLeft />
          <span>{t.backHome}</span>
        </Link>
        <span className="wml-back-title">{t.access}</span>
        <span className="wml-back-spacer" />
      </header>
    )
  }

  return (
    <>
      <nav className="wml-nav">
        <div className="wml-nav-left">
          <Link href={homePath(locale)} className="wml-back-link wml-back-link-compact" aria-label={t.backHomeLabel}>
            <IconArrowLeft />
          </Link>
          <Link href={wmlPath(locale, '/feed')} className="wml-nav-logo">
            <span className="wml-nav-logo-dot" />
            WML 1.0
          </Link>
        </div>
        <div className="wml-nav-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`wml-nav-link${internalPathname === link.path ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            className="wml-nav-link wml-nav-logout"
            onClick={handleLogout}
          >
            {t.logout}
          </button>
        </div>
      </nav>

      <nav className="wml-bottom-nav">
        <Link href={homePath(locale)} className="wml-bottom-back" aria-label={t.backHome}>
          &lt;-
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={internalPathname === link.path ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
