'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { legalPath, toInternalPath, type LegalPage } from '@/lib/i18n'

const LEGAL_LINKS: Array<{ page: LegalPage; es: string; en: string }> = [
  { page: 'legalNotice', es: 'Aviso legal', en: 'Legal notice' },
  { page: 'privacy', es: 'Privacidad', en: 'Privacy' },
  { page: 'cookies', es: 'Cookies', en: 'Cookies' },
  { page: 'terms', es: 'Terminos', en: 'Terms' },
  { page: 'ethics', es: 'Etica', en: 'Ethics' },
]

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface LegalShellProps {
  children: ReactNode
  currentPath: string
}

export function LegalShell({ children, currentPath }: LegalShellProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const internalPath = toInternalPath(pathname)

  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href={locale === 'en' ? '/en' : '/'} className="legal-back">
          <IconArrowLeft />
          {locale === 'en' ? 'Home' : 'Inicio'}
        </Link>
        <span className="legal-header-title">
          {locale === 'en' ? 'Legal documentation' : 'Documentacion legal'}
        </span>
      </header>

      <article className="legal-body">
        <nav className="legal-nav" aria-label={locale === 'en' ? 'Legal documents' : 'Documentos legales'}>
          {LEGAL_LINKS.map((link) => {
            const href = legalPath(locale, link.page)
            const isActive = internalPath === currentPath && legalPath('es', link.page) === currentPath

            return (
              <Link key={link.page} href={href} className={isActive ? 'active' : ''}>
                {locale === 'en' ? link.en : link.es}
              </Link>
            )
          })}
        </nav>
        {children}
      </article>
    </div>
  )
}
