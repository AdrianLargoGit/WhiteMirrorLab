'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LINKS = [
  { href: '/web/feed', label: 'Feed' },
  { href: '/web/ranking', label: 'Ranking' },
  { href: '/web/search', label: 'Buscar' },
  { href: '/web/me', label: 'Perfil' },
]

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function WmlNav() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/web/consent') return null

  const isAuth = pathname === '/web/auth'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/web/auth')
  }

  if (isAuth) {
    return (
      <header className="wml-back-bar">
        <Link href="/" className="wml-back-link" aria-label="Volver al inicio">
          <IconArrowLeft />
          <span>Inicio</span>
        </Link>
        <span className="wml-back-title">Acceso</span>
        <span className="wml-back-spacer" />
      </header>
    )
  }

  return (
    <>
      <nav className="wml-nav">
        <div className="wml-nav-left">
          <Link href="/" className="wml-back-link wml-back-link-compact" aria-label="Volver al inicio">
            <IconArrowLeft />
          </Link>
          <Link href="/web/feed" className="wml-nav-logo">
            <span className="wml-nav-logo-dot" />
            WML 1.0
          </Link>
        </div>
        <div className="wml-nav-links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`wml-nav-link${pathname === link.href ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            className="wml-nav-link wml-nav-logout"
            onClick={handleLogout}
          >
            Salir
          </button>
        </div>
      </nav>

      <nav className="wml-bottom-nav">
        <Link href="/" className="wml-bottom-back" aria-label="Inicio">
          ←
        </Link>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
