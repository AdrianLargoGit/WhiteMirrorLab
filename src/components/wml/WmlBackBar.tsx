'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  const isConsent = pathname === '/web/consent'
  const isAuth = pathname === '/web/auth'

  return (
    <header className="wml-back-bar">
      <Link href="/" className="wml-back-link" aria-label="Volver al inicio">
        <IconArrowLeft />
        <span>Inicio</span>
      </Link>
      {(title || isConsent || isAuth) && (
        <span className="wml-back-title">
          {title ?? (isConsent ? 'Consentimiento' : isAuth ? 'Acceso' : '')}
        </span>
      )}
      {showNav && <span className="wml-back-spacer" />}
    </header>
  )
}
