'use client'

import { useState } from 'react'
import Link from 'next/link'
import { castVote } from '@/lib/votes'
import type { PublicProfile } from '@/lib/types'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'
import { wmlPath } from '@/lib/i18n'

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
  loginHref,
  variant = 'default',
}: VoteWidgetProps) {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [myVote, setMyVote] = useState<boolean | null>(initialVote)
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState<'pos' | 'neg' | null>(null)

  const isOwn = voterId === profile.id
  const canVote = voterId && !isOwn
  const resolvedLoginHref = loginHref ?? wmlPath(locale, '/consent')

  const handleVote = async (isPositive: boolean) => {
    if (!voterId || isOwn) return
    setLoading(true)
    const result = await castVote(voterId, profile.id, isPositive)
    setLoading(false)
    if (result.success) {
      setPulse(isPositive ? 'pos' : 'neg')
      setTimeout(() => setPulse(null), 600)
      setMyVote(myVote === isPositive ? null : isPositive)
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
          <span className="wml-vote-widget-stat-label">{t.positivePlural}</span>
        </div>
        <div className="wml-vote-widget-stat neg">
          <span className="wml-vote-widget-stat-num">-{profile.votes_received_negative}</span>
          <span className="wml-vote-widget-stat-label">{t.negativePlural}</span>
        </div>
      </div>

      {isOwn ? (
        <p className="wml-vote-widget-hint">{t.ownProfileHint}</p>
      ) : canVote ? (
        <div className="wml-vote-widget-actions">
          <p className="wml-vote-widget-cta">{t.voteCta}</p>
          <div className="wml-vote-btns wml-vote-btns-large">
            <button
              type="button"
              className={`wml-vote-btn wml-vote-btn-large wml-vote-btn-pos${myVote === true ? ' active-pos' : ''}`}
              onClick={() => handleVote(true)}
              disabled={loading}
            >
              <span className="wml-vote-btn-icon">+</span>
              <span>{t.positive}</span>
            </button>
            <button
              type="button"
              className={`wml-vote-btn wml-vote-btn-large wml-vote-btn-neg${myVote === false ? ' active-neg' : ''}`}
              onClick={() => handleVote(false)}
              disabled={loading}
            >
              <span className="wml-vote-btn-icon">-</span>
              <span>{t.negative}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="wml-vote-widget-guest">
          <p className="wml-vote-widget-cta">
            {t.guestCta} <strong>@{profile.username}</strong>
          </p>
          <Link href={resolvedLoginHref} className="wml-btn wml-btn-primary wml-vote-widget-join">
            {t.joinAndVote}
          </Link>
        </div>
      )}
    </div>
  )
}
