'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PublicProfile } from '@/lib/types'
import { captureEvent } from '@/lib/analytics'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'
import { wmlProfilePath } from '@/lib/i18n'

export default function SearchPage() {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicProfile[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    const q = query.trim().toLowerCase()
    if (!q) return

    const { data } = await supabase
      .from('public_profiles')
      .select('*')
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .eq('is_bot', false)
      .limit(20)

    setResults((data ?? []) as PublicProfile[])
    setSearched(true)
    captureEvent('user_search', { query: q, results: data?.length ?? 0, locale })
  }

  return (
    <div>
      <div className="wml-section-title">{t.searchUsers}</div>
      <input
        className="wml-search-input"
        placeholder={t.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button
        type="button"
        className="wml-btn wml-btn-primary"
        onClick={handleSearch}
        style={{ width: '100%', justifyContent: 'center', marginBottom: 24 }}
      >
        {t.search}
      </button>

      {searched && results.length === 0 && (
        <div className="wml-empty">{t.noUsersFound}</div>
      )}

      {results.map((p) => (
        <Link key={p.id} href={wmlProfilePath(locale, p.username)} className="wml-rank-item">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{p.display_name}</div>
            <div style={{ fontFamily: 'var(--w-mono)', fontSize: 11, color: 'var(--w-muted)' }}>
              @{p.username}
            </div>
          </div>
          <div className={`wml-karma ${p.karma_score > 0 ? 'positive' : p.karma_score < 0 ? 'negative' : 'neutral'}`}>
            {p.karma_score > 0 ? '+' : ''}{p.karma_score}
          </div>
        </Link>
      ))}
    </div>
  )
}
