'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Photo, PublicProfile } from '@/lib/types'
import { VoteWidget } from './VoteWidget'
import { getMyVote } from '@/lib/votes'
import { useLocale } from '@/hooks/useLocale'
import { homePath, wmlPath, wmlProfilePath } from '@/lib/i18n'
import '@/app/web/wml.css'

interface PublicVotePageProps {
  profile: PublicProfile
  photos: Photo[]
}

export function PublicVotePage({ profile, photos }: PublicVotePageProps) {
  const locale = useLocale()
  const [userId, setUserId] = useState<string | null>(null)
  const [myVote, setMyVote] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const avatarUrl = photos.length > 0 ? photos[photos.length - 1].url : null
  const loginHref = `${wmlPath(locale, '/consent')}?next=${encodeURIComponent(wmlProfilePath(locale, profile.username))}`

  const refresh = useCallback(async (uid: string | null) => {
    if (uid) {
      const vote = await getMyVote(uid, profile.id)
      setMyVote(vote)
    }
    setLoading(false)
  }, [profile.id])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      refresh(user?.id ?? null)
    })
  }, [refresh])

  const handleVoted = () => refresh(userId)

  return (
    <div className="public-page">
      <header className="public-header">
        <Link href={homePath(locale)} className="public-back">
          {locale === 'es' ? '<- Inicio' : '<- Home'}
        </Link>
        <span className="public-brand">WML 1.0 / Karma Score</span>
      </header>

      <main className="public-main">
        <div className="public-hero">
          <div className="public-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" />
            ) : (
              profile.username[0]?.toUpperCase()
            )}
          </div>
          <h1 className="public-name">{profile.display_name}</h1>
          <p className="public-username">@{profile.username}</p>
          <p className="public-tagline">
            {locale === 'es'
              ? 'Experimento social de reputacion anonima. Tu voto no se revela.'
              : 'Anonymous reputation social experiment. Your vote is not revealed.'}
          </p>
        </div>

        {photos.length > 0 && (
          <div className="public-photos">
            {photos.map((p) => (
              <div key={p.id} className="public-photo">
                <img src={p.url} alt="" />
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <VoteWidget
            profile={profile}
            voterId={userId}
            initialVote={myVote}
            onVoted={handleVoted}
            loginHref={loginHref}
            variant="hero"
          />
        )}

        <p className="public-footer">
          White Mirror Lab / <Link href={wmlPath(locale, '/consent')}>
            {locale === 'es' ? 'Unirse al experimento' : 'Join the experiment'}
          </Link>
        </p>
      </main>
    </div>
  )
}
