'use client'

import { useEffect, useState, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authcontext'
import { supabase } from '@/lib/supabase'
import { searchProfiles } from '@/lib/queries'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n' 
import { wmlCopy } from '@/lib/copy'
import { captureEvent, resetAnalyticsIdentity } from '@/lib/posthog'
import type { Profile } from '@/lib/database.types'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoHome    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
const IcoTrophy  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2h12v7a6 6 0 0 1-12 0V2z"/><path d="M6 5H2v2a4 4 0 0 0 4 4M18 5h4v2a4 4 0 0 1-4 4"/><path d="M12 15v4M8 21h8"/></svg>
const IcoSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
const IcoPlus    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
const IcoUser    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
const IcoLogout  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoPulse   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>

interface AppShellProps { children: ReactNode }

export default function AppShell({ children }: AppShellProps) {
  const { user, profile, loading, signOut } = useAuth()
  const pathname  = usePathname()
  const router    = useRouter()
  const locale    = useLocale()
  const copy      = wmlCopy[locale]

  const [searchQ, setSearchQ]           = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [showResults, setShowResults]   = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Redirección al auth si no hay sesión iniciada (sensible al idioma)
  useEffect(() => {
    if (!loading && !user && !pathname.endsWith('/auth')) {
      router.replace(wmlPath(locale, '/auth'))
    }
  }, [loading, user, pathname, router, locale])

  // Debounce de búsqueda de perfiles
  useEffect(() => {
    if (searchQ.trim().length < 2) { setSearchResults([]); return }
    const id = setTimeout(async () => {
      const { data } = await searchProfiles(searchQ.trim())
      setSearchResults((data as Profile[]) ?? [])
      setShowResults(true)
      captureEvent('search_query', { query_length: searchQ.trim().length, results: data?.length ?? 0 })
    }, 250)
    return () => clearTimeout(id)
  }, [searchQ])

  // Cerrar desplegable al hacer clic fuera
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Vista limpia para la página de autenticación
  if (pathname.endsWith('/auth')) return <div className="wml-app">{children}</div>

  if (loading) {
    return (
      <div className="wml-app" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
          {copy.loadingExperiment.toUpperCase()}
        </span>
      </div>
    )
  }

  // Enlaces de navegación estructurados dinámicamente
  const navLinks = [
    { href: wmlPath(locale, '/feed'),    label: copy.feed,                                   icon: <IcoHome /> },
    { href: wmlPath(locale, '/me'),      label: copy.profile,                                icon: <IcoUser /> },
    { href: wmlPath(locale, '/pulses'),  label: 'Pulses',                                    icon: <IcoPulse /> },
    { href: wmlPath(locale, '/ranking'), label: copy.ranking,                                icon: <IcoTrophy /> },
    { href: wmlPath(locale, '/upload'),  label: locale === 'es' ? 'Publicar' : 'Publish',    icon: <IcoPlus /> },
  ]

  const handleSignOut = async () => {
    captureEvent('auth_logout')
    await signOut()
    resetAnalyticsIdentity()
    router.replace(wmlPath(locale, '/auth'))
  }

  return (
    <div className="wml-app">
      <TermsGate />
      <div className="wml-shell">

        {/* ── Top nav ── */}
        <header className="wml-topnav">
          <Link href={wmlPath(locale, '/feed')} className="wml-logo">
            <span className="wml-logo-dot" />
            WML 1.0
          </Link>

          {/* Buscador Global */}
          <div className="wml-nav-search" ref={searchRef}>
            <span className="wml-nav-search-icon"><IcoSearch /></span>
            <input
              placeholder={copy.searchPlaceholder}
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); setShowResults(true) }}
              onFocus={() => searchQ.length >= 2 && setShowResults(true)}
            />
            {showResults && searchResults.length > 0 && (
              <div className="wml-search-results">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    href={wmlPath(locale, `/profile/${p.username}`)}
                    className="wml-search-result-item"
                    onClick={() => { setShowResults(false); setSearchQ('') }}
                  >
                    <AvatarMini profile={p} size={28} />
                    <div>
                      <div className="wml-search-result-name">{p.display_name}</div>
                      <div className="wml-search-result-handle">@{p.username}</div>
                    </div>
                    <KarmaBadge score={p.karma_score} style={{ marginLeft: 'auto', fontSize: 10 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Perfil Mini Superior */}
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link href={wmlPath(locale, `/profile/${profile.username}`)} style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
                <AvatarMini profile={profile} size={30} />
                <KarmaBadge score={profile.karma_score} />
              </Link>
              <button className="wml-btn wml-btn-ghost" onClick={handleSignOut} style={{ padding: '6px 10px', fontSize: 10 }} title={copy.logout}>
                <IcoLogout />
              </button>
            </div>
          )}
        </header>

        {/* ── Sidebar (Escritorio) ── */}
        <aside className="wml-sidebar">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`wml-nav-item ${pathname.startsWith(l.href) ? 'active' : ''}`}>
              <span className="wml-nav-icon">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <div className="wml-nav-spacer" />
          {profile && (
            <Link href={wmlPath(locale, `/profile/${profile.username}`)} className="wml-sidebar-profile">
              <AvatarMini profile={profile} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile.display_name}
                </div>
                <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, color: 'var(--w-muted)', letterSpacing: '0.06em' }}>
                  @{profile.username}
                </div>
              </div>
            </Link>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className="wml-main">{children}</main>

        {/* ── Mobile bottom nav ── */}
        <nav className="wml-bottom-nav">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`wml-bottom-nav-item ${pathname.startsWith(l.href) ? 'active' : ''}`}>
              {l.icon}
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function AvatarMini({ profile, size = 36 }: { profile: Pick<Profile, 'avatar_url' | 'display_name'>; size?: number }) {
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt={profile.display_name} width={size} height={size} className="wml-avatar" style={{ width: size, height: size }} />
  }
  return (
    <div className="wml-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {profile.display_name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export function KarmaBadge({ score, style }: { score: number; style?: React.CSSProperties }) {
  const cls = score > 0 ? 'pos' : score < 0 ? 'neg' : ''
  return (
    <span className={`wml-karma-badge ${cls}`} style={style}>
      {score > 0 ? '+' : ''}{score}
    </span>
  )
}

// ── Terms gate ────────────────────────────────────────────────────────────────
function TermsGate() {
  const { profile, refreshProfile, loading } = useAuth()
  const [accepting, setAccepting] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const locale = useLocale()
  const copy = wmlCopy[locale]

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || loading || !profile) return null
  if (profile.accepted_terms_version === '1.0') return null

  const accept = async () => {
    setAccepting(true)
    await supabase
      .from('profiles')
      .update({ accepted_terms_version: '1.0', accepted_at: new Date().toISOString() })
      .eq('id', profile.id)
    await refreshProfile()
    setAccepting(false)
  }

  return (
    <div className="wml-terms-overlay">
      <div className="wml-terms-card">
        <div className="wml-terms-title">{copy.consentTitle}</div>
        <div className="wml-terms-body">
          <p>{copy.consentLead}</p>
          <br />
          <p><strong>{copy.consentInfoTitle}:</strong></p>
          <ul style={{ paddingLeft: 18, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {copy.consentBullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
          <br />
          <p style={{ fontSize: 11, color: 'var(--w-muted)', lineHeight: '1.4' }}>{copy.consentAge}</p>
          <p style={{ fontSize: 11, color: 'var(--w-muted)', lineHeight: '1.4', marginTop: 4 }}>{copy.consentVoluntary}</p>
        </div>
        <button className="wml-btn wml-btn-primary" onClick={accept} disabled={accepting} style={{ width: '100%', justifyContent: 'center' }}>
          {accepting ? (locale === 'es' ? 'Aceptando...' : 'Accepting...') : copy.acceptAndJoin}
        </button>
      </div>
    </div>
  )
}
