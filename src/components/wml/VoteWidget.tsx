'use client'

import { useState } from 'react'
import Link from 'next/link'
import { castVote } from '@/lib/votes'
import type { PublicProfile } from '@/lib/types'

interface VoteWidgetProps {
  profile: PublicProfile
  voterId?: string | null
  initialVote?: boolean | null
  onVoted?: () => void
  loginHref?: string
  variant?: 'default' | 'hero'
}

function karmaClass(score: number) {
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

export function VoteWidget({
  profile,
  voterId,
  initialVote = null,
  onVoted,
  loginHref = '/web/consent',
  variant = 'default',
}: VoteWidgetProps) {
  const [myVote, setMyVote] = useState<boolean | null>(initialVote)
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState<'pos' | 'neg' | null>(null)

  const isOwn = voterId === profile.id
  const canVote = voterId && !isOwn

  const handleVote = async (isPositive: boolean) => {
    if (!voterId || isOwn) return
    setLoading(true)
    const result = await castVote(voterId, profile.id, isPositive)
    setLoading(false)
    if (result.success) {
      setPulse(isPositive ? 'pos' : 'neg')
      setTimeout(() => setPulse(null), 600)
      if (myVote === isPositive) {
        setMyVote(null)
      } else {
        setMyVote(isPositive)
      }
      onVoted?.()
    }
  }

  return (
    <div className={`wml-vote-widget${variant === 'hero' ? ' wml-vote-widget-hero' : ''}${pulse ? ` wml-vote-pulse-${pulse}` : ''}`}>
      <div className="wml-vote-widget-karma">
        <span className="wml-vote-widget-karma-label">Karma</span>
        <span className={`wml-karma wml-vote-widget-karma-num ${karmaClass(profile.karma_score)}`}>
          {profile.karma_score > 0 ? '+' : ''}{profile.karma_score}
        </span>
      </div>

      <div className="wml-vote-widget-stats">
        <div className="wml-vote-widget-stat pos">
          <span className="wml-vote-widget-stat-num">+{profile.votes_received_positive}</span>
          <span className="wml-vote-widget-stat-label">positivos</span>
        </div>
        <div className="wml-vote-widget-stat neg">
          <span className="wml-vote-widget-stat-num">−{profile.votes_received_negative}</span>
          <span className="wml-vote-widget-stat-label">negativos</span>
        </div>
      </div>

      {isOwn ? (
        <p className="wml-vote-widget-hint">Este es tu perfil — compártelo para recibir votos.</p>
      ) : canVote ? (
        <div className="wml-vote-widget-actions">
          <p className="wml-vote-widget-cta">Tu voto es anónimo. ¿Qué karma le das?</p>
          <div className="wml-vote-btns wml-vote-btns-large">
            <button
              type="button"
              className={`wml-vote-btn wml-vote-btn-large wml-vote-btn-pos${myVote === true ? ' active-pos' : ''}`}
              onClick={() => handleVote(true)}
              disabled={loading}
            >
              <span className="wml-vote-btn-icon">+</span>
              <span>Positivo</span>
            </button>
            <button
              type="button"
              className={`wml-vote-btn wml-vote-btn-large wml-vote-btn-neg${myVote === false ? ' active-neg' : ''}`}
              onClick={() => handleVote(false)}
              disabled={loading}
            >
              <span className="wml-vote-btn-icon">−</span>
              <span>Negativo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="wml-vote-widget-guest">
          <p className="wml-vote-widget-cta">
            Entra al experimento y vota a <strong>@{profile.username}</strong> de forma anónima.
          </p>
          <Link href={loginHref} className="wml-btn wml-btn-primary wml-vote-widget-join">
            Entrar y votar
          </Link>
        </div>
      )}
    </div>
  )
}
