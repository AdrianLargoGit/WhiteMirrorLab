'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { wmlCopy } from '@/lib/copy'
import { getLocaleFromPathname, homePath, toInternalPath } from '@/lib/i18n'

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface WmlBackBarProps {
  title?: string
  showNav?: boolean
}

export function WmlBackBar({ title, showNav = false }: WmlBackBarProps) {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const t = wmlCopy[locale]
  const internalPathname = toInternalPath(pathname)
  const isConsent = internalPathname === '/web/consent'
  const isAuth = internalPathname === '/web/auth'

  return (
    <header className="wml-back-bar">
      <Link href={homePath(locale)} className="wml-back-link" aria-label={t.backHomeLabel}>
        <IconArrowLeft />
        <span>{t.backHome}</span>
      </Link>
      {(title || isConsent || isAuth) && (
        <span className="wml-back-title">
          {title ?? (isConsent ? t.consent : isAuth ? t.access : '')}
        </span>
      )}
      {showNav && <span className="wml-back-spacer" />}
    </header>
  )
}
