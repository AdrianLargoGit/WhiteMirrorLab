'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { PublicProfile, Photo } from '@/lib/types'
import { PhotoGrid } from '@/components/wml/PhotoGrid'
import { VoteWidget } from '@/components/wml/VoteWidget'
import { ShareProfile } from '@/components/wml/ShareProfile'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getMyVote } from '@/lib/votes'

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const { userId, loading: userLoading } = useCurrentUser()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [myVote, setMyVote] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (!data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(data as PublicProfile)

    const { data: photoData } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', data.id)
      .order('created_at', { ascending: true })

    setPhotos((photoData ?? []) as Photo[])

    if (userId) {
      const vote = await getMyVote(userId, data.id)
      setMyVote(vote)
    }

    setLoading(false)
  }, [username, userId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (loading || userLoading) {
    return <div className="wml-empty">Cargando perfil…</div>
  }

  if (notFound || !profile) {
    return <div className="wml-empty">Usuario no encontrado.</div>
  }

  const isOwn = userId === profile.id
  const avatarUrl = photos.length > 0 ? photos[photos.length - 1].url : null

  return (
    <div className="wml-profile-page">
      <div className="wml-profile-hero">
        <div className="wml-profile-hero-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" />
          ) : (
            profile.username[0]?.toUpperCase()
          )}
        </div>
        <div className="wml-profile-hero-info">
          <h1 className="wml-profile-hero-name">{profile.display_name}</h1>
          <p className="wml-profile-hero-user">@{profile.username}</p>
          {isOwn && (
            <Link href={`/p/${profile.username}`} className="wml-profile-public-link">
              Ver página pública →
            </Link>
          )}
        </div>
      </div>

      <VoteWidget
        profile={profile}
        voterId={userId}
        initialVote={myVote}
        onVoted={loadProfile}
        variant="hero"
      />

      {isOwn && <ShareProfile profile={profile} />}

      <PhotoGrid
        photos={photos}
        userId={profile.id}
        editable={isOwn}
        onPhotoAdded={loadProfile}
      />
    </div>
  )
}
