'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { searchProfiles } from '@/lib/queries'
import { AvatarMini, KarmaBadge } from '@/components/wml10/AppShell'
import type { Profile } from '@/lib/database.types'

const IcoSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>

type SearchProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'karma_score'>

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    const id = setTimeout(async () => {
      const { data } = await searchProfiles(query.trim())
      setResults((data ?? []) as SearchProfile[])
      setSearched(true)
      setLoading(false)
    }, 300)
    return () => { clearTimeout(id); setLoading(false) }
  }, [query])

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--w-font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', marginBottom: 6 }}>
          Buscar
        </div>
        <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Encuentra participantes del experimento
        </div>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--w-muted)', pointerEvents: 'none' }}>
          <IcoSearch />
        </span>
        <input
          className="wml-input"
          style={{ paddingLeft: 42, margin: 0 }}
          placeholder="Buscar por username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {/* Results */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1,2,3].map(i => <div key={i} className="wml-skeleton" style={{ height: 60 }} />)}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
          SIN RESULTADOS PARA &quot;{query}&quot;
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {results.map((p) => {
            const karma = p.karma_score
            const karmaClass = karma > 0 ? 'pos' : karma < 0 ? 'neg' : ''
            return (
              <Link
                key={p.id}
                href={`/web/profile/${p.username}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--w-surface)',
                  border: '1px solid var(--w-border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--w-surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--w-surface)')}
              >
                <AvatarMini profile={p} size={40} />
                <div>
                  <div style={{ fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
                    {p.display_name}
                  </div>
                  <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)', letterSpacing: '0.05em' }}>
                    @{p.username}
                  </div>
                </div>
                <KarmaBadge score={karma} />
              </Link>
            )
          })}
        </div>
      )}

      {!searched && !loading && (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--w-muted)', fontFamily: 'var(--w-font-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
          ESCRIBE AL MENOS 2 CARACTERES
        </div>
      )}
    </div>
  )
}