import Link from 'next/link'

const LEGAL_LINKS = [
  { href: '/legal/aviso-legal', label: 'Aviso legal' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/terminos', label: 'Términos' },
  { href: '/legal/etica', label: 'Ética' },
]

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

interface LegalShellProps {
  children: React.ReactNode
  currentPath: string
}

export function LegalShell({ children, currentPath }: LegalShellProps) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link href="/" className="legal-back">
          <IconArrowLeft />
          Inicio
        </Link>
        <span className="legal-header-title">Documentación legal</span>
      </header>

      <article className="legal-body">
        <nav className="legal-nav" aria-label="Documentos legales">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={currentPath === link.href ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {children}
      </article>
    </div>
  )
}
