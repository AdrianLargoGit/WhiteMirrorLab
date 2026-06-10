'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PublicProfile, Story } from '@/lib/types'
import { UserCard } from '@/components/wml/UserCard'
import { StoryBar } from '@/components/wml/StoryBar'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'
import { wmlProfilePath } from '@/lib/i18n'

export default function FeedPage() {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const { userId, profile, loading: userLoading } = useCurrentUser()
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [stories, setStories] = useState<(Story & { profile: PublicProfile })[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({})
  const [avatars, setAvatars] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!userId) return

    const [profilesRes, storiesRes, votesRes, photosRes, storyProfilesRes] = await Promise.all([
      supabase
        .from('public_profiles')
        .select('*')
        .eq('is_bot', false)
        .neq('id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('votes')
        .select('target_id, is_positive')
        .eq('voter_id', userId),
      supabase
        .from('photos')
        .select('user_id, url, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('public_profiles').select('*'),
    ])

    if (profilesRes.data) setProfiles(profilesRes.data as PublicProfile[])

    if (storiesRes.data && storyProfilesRes.data) {
      const profileMap = Object.fromEntries(
        (storyProfilesRes.data as PublicProfile[]).map((p) => [p.id, p])
      )
      setStories(
        storiesRes.data.map((s) => ({
          ...s,
          profile: profileMap[s.user_id],
        })).filter((s) => s.profile) as (Story & { profile: PublicProfile })[]
      )
    }

    if (votesRes.data) {
      const map: Record<string, boolean> = {}
      votesRes.data.forEach((v) => { map[v.target_id] = v.is_positive })
      setMyVotes(map)
    }

    if (photosRes.data) {
      const av: Record<string, string> = {}
      photosRes.data.forEach((p) => {
        if (!av[p.user_id]) av[p.user_id] = p.url
      })
      setAvatars(av)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const id = window.setTimeout(() => {
      void loadData()
    }, 0)
    return () => window.clearTimeout(id)
  }, [userId, loadData])

  if (userLoading || loading) {
    return <div className="wml-empty">{t.loadingExperiment}</div>
  }

  return (
    <div>
      {profile && (
        <div className="wml-feed-banner">
          <div className="wml-feed-banner-title">{t.feedBannerTitle}</div>
          <p className="wml-feed-banner-text">{t.feedBannerText}</p>
          <Link href={wmlProfilePath(locale, profile.username)} className="wml-feed-banner-link">
            {t.feedBannerLink}
          </Link>
        </div>
      )}

      <StoryBar
        stories={stories}
        currentUserId={userId!}
        onStoryAdded={loadData}
      />

      <div className="wml-section-title">{t.participants}</div>

      {profiles.length === 0 ? (
        <div className="wml-empty">{t.noParticipants}</div>
      ) : (
        profiles.map((p) => (
          <UserCard
            key={p.id}
            profile={p}
            currentUserId={userId!}
            myVote={myVotes[p.id] ?? null}
            avatarUrl={avatars[p.id]}
            onVoted={loadData}
          />
        ))
      )}
    </div>
  )
}
