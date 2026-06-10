'use client'

import Link from 'next/link'
import type { PublicProfile } from '@/lib/types'
import { VoteButtons } from './VoteButtons'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'
import { wmlProfilePath } from '@/lib/i18n'

interface UserCardProps {
  profile: PublicProfile
  currentUserId: string
  myVote: boolean | null
  avatarUrl?: string | null
  onVoted?: () => void
}

function karmaClass(score: number) {
  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

export function UserCard({ profile, currentUserId, myVote, avatarUrl, onVoted }: UserCardProps) {
  const locale = useLocale()
  const t = wmlCopy[locale]

  return (
    <div className="wml-card">
      <div className="wml-card-header">
        <Link href={wmlProfilePath(locale, profile.username)} className="wml-card-user">
          <div className="wml-card-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              profile.username[0]?.toUpperCase()
            )}
          </div>
          <div>
            <div className="wml-card-name">{profile.display_name}</div>
            <div className="wml-card-username">@{profile.username}</div>
          </div>
        </Link>
        <div className={`wml-karma ${karmaClass(profile.karma_score)}`}>
          {profile.karma_score > 0 ? '+' : ''}{profile.karma_score}
        </div>
      </div>

      <div className="wml-vote-stats">
        <span className="pos">+{profile.votes_received_positive} {t.positivePlural}</span>
        <span className="neg">-{profile.votes_received_negative} {t.negativePlural}</span>
      </div>

      <VoteButtons
        voterId={currentUserId}
        targetId={profile.id}
        initialVote={myVote}
        onVoted={onVoted}
      />
    </div>
  )
}
