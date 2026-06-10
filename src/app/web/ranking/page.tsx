'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PublicProfile } from '@/lib/types'

export default function RankingPage() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('is_bot', false)
        .order('karma_score', { ascending: false })
        .limit(100)

      if (data) setProfiles(data as PublicProfile[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="wml-empty">Cargando ranking…</div>
  }

  return (
    <div>
      <div className="wml-section-title">Ranking · Karma Score</div>
      <p style={{ fontSize: 13, color: 'var(--w-muted)', marginBottom: 24 }}>
        El participante con mayor karma al final del experimento recibirá el premio.
        Los votos son anónimos — nadie puede ver a quién has votado.
      </p>

      {profiles.map((p, i) => (
        <Link key={p.id} href={`/web/profile/${p.username}`} className="wml-rank-item">
          <span className={`wml-rank-pos${i < 3 ? ' top' : ''}`}>{i + 1}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{p.display_name}</div>
            <div style={{ fontFamily: 'var(--w-mono)', fontSize: 11, color: 'var(--w-muted)' }}>
              @{p.username}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`wml-karma ${p.karma_score > 0 ? 'positive' : p.karma_score < 0 ? 'negative' : 'neutral'}`}>
              {p.karma_score > 0 ? '+' : ''}{p.karma_score}
            </div>
            <div style={{ fontFamily: 'var(--w-mono)', fontSize: 10, color: 'var(--w-muted)', marginTop: 4 }}>
              +{p.votes_received_positive} / −{p.votes_received_negative}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
