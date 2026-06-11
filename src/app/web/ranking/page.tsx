'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchRanking } from '@/lib/queries'
import { AvatarMini } from '@/components/wml10/AppShell'
import type { Profile } from '@/lib/database.types'

type RankProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url' | 'karma_score' | 'country' | 'created_at'>

// Medal icons for top 3
const Medal1 = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffd700" stroke="#ffd700" strokeWidth="0"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
const Medal2 = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#c0c0c0" stroke="#c0c0c0" strokeWidth="0"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
const Medal3 = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#cd7f32" stroke="#cd7f32" strokeWidth="0"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const { data } = await fetchRanking(50)
        if (isMounted) {
          setRanking((data ?? []) as RankProfile[])
          setLoading(false)
        }
      } catch (err) {
        console.error('Error cargando el ranking:', err)
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    const id = setInterval(loadData, 30_000)
    
    return () => {
      isMounted = false
      clearInterval(id)
    }
  }, [])

  return (
    <div className="wml-ranking" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div className="wml-ranking-header" style={{ marginBottom: '24px' }}>
        <div className="wml-ranking-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
          Clasificación
        </div>
        <div className="wml-ranking-subtitle" style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          KARMA SCORE · Se actualiza en tiempo real · El #1 al finalizar el experimento gana el premio
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="wml-skeleton" style={{ height: 64, marginBottom: '8px' }} />
          ))}
        </div>
      ) : (
        <div style={{ animation: 'wFadeUp 0.4s ease', display: 'flex', flexDirection: 'column' }}>
          {ranking.map((p, i) => {
            const rank = i + 1
            const karmaClass = p.karma_score > 0 ? 'pos' : p.karma_score < 0 ? 'neg' : ''
            
            return (
              <Link 
                key={p.id} 
                href={`/web/profile/${p.username}`} 
                className="wml-ranking-row"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '12px 0', 
                  borderBottom: '1px solid var(--w-border)', 
                  textDecoration: 'none', 
                  color: 'inherit' 
                }}
              >
                {/* Rank number */}
                <div 
                  className={`wml-rank-num ${rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : ''}`}
                  style={{ width: '24px', textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 14, color: 'var(--w-muted)' }}
                >
                  {rank === 1 ? <Medal1 /> : rank === 2 ? <Medal2 /> : rank === 3 ? <Medal3 /> : rank}
                </div>

                {/* Avatar */}
                <AvatarMini profile={p} size={36} />

                {/* Info */}
                <div className="wml-rank-info" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div className="wml-rank-name" style={{ fontSize: 15, fontWeight: 500 }}>
                    {p.display_name}
                  </div>
                  <div className="wml-rank-handle" style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)' }}>
                    @{p.username}{p.country ? ` · ${p.country}` : ''}
                  </div>
                </div>

                {/* Score */}
                <div 
                  className={`wml-rank-score ${karmaClass}`}
                  style={{ fontFamily: 'var(--w-font-mono)', fontSize: 14, color: karmaClass === 'pos' ? 'var(--w-accent-pos, #4ade80)' : karmaClass === 'neg' ? 'var(--w-accent-neg, #f87171)' : 'var(--w-muted)' }}
                >
                  {p.karma_score > 0 ? '+' : ''}{p.karma_score}
                </div>
              </Link>
            )
          })}

          {ranking.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
              AÚN NO HAY PARTICIPANTES
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 24, padding: '14px 16px', border: '1px solid var(--w-border)', background: 'var(--w-surface)' }}>
        <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--w-accent)', textTransform: 'uppercase', marginBottom: 6 }}>
          Nota sobre el anonimato
        </div>
        <p style={{ fontSize: 12, color: 'var(--w-muted-2)', lineHeight: 1.7, margin: 0 }}>
          Puedes ver cuántos votos positivos y negativos ha recibido cada perfil, pero nunca quién los emitió. El historial de votos dados tampoco es público.
        </p>
      </div>
    </div>
  )
}