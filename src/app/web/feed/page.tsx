'use client'

import { memo, useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/authcontext'
import { fetchFeedPosts, fetchActiveStories } from '@/lib/queries'
import { castVote, getMyVote } from '@/lib/votes'
import { captureEvent } from '@/lib/posthog'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'   // ✅ Puedes usar las funciones puras también
import { wmlCopy } from '@/lib/copy'
import { AvatarMini, KarmaBadge } from '@/components/wml/AppShell'
import type { Post, Profile, Story, VoteType } from '@/lib/database.types'
import StoryViewer from '@/components/wml/StoryViewer'
import SpainWorldCupBadge from '@/components/wml/SpainWorldCupBadge'
import FeedAdCard from '@/components/wml/FeedAdCard'

const PWAInstallBanner = dynamic(() => import('@/components/wml/PWABanner'), {
  ssr: false,
})

type FeedPost        = Post & { profile: Profile }
type StoryWithProfile = Story & { profile: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'display_name' | 'country'> }

const ICO_UP   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
const ICO_DOWN = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>

// Función de tiempo relativo adaptada al idioma activo
function timeAgo(iso: string, locale: 'es' | 'en'): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return locale === 'es' ? 'ahora' : 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function FeedPage() {
  const { user } = useAuth()
  const locale = useLocale()

  const [posts, setPosts]               = useState<FeedPost[]>([])
  const [stories, setStories]           = useState<StoryWithProfile[]>([])
  const [page, setPage]                 = useState(0)
  const [loading, setLoading]           = useState(true)
  const [hasMore, setHasMore]           = useState(true)
  const [myVotes, setMyVotes]           = useState<Record<string, VoteType | null>>({})
  const [viewingStory, setViewingStory] = useState<StoryWithProfile | null>(null)
  const [seenStories, setSeenStories]   = useState<Set<string>>(new Set())
  const sentinelRef                     = useRef<HTMLDivElement>(null)
  const loadingMoreRef                  = useRef(false)

  const loadPosts = useCallback(async (p: number) => {
    const { data } = await fetchFeedPosts(p)
    if (!data || data.length < 12) setHasMore(false)
    return (data ?? []) as FeedPost[]
  }, [])

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [postsData, storiesRes] = await Promise.all([
        loadPosts(0),
        fetchActiveStories(),
      ])
      setPosts(postsData)
      setStories((storiesRes.data ?? []) as StoryWithProfile[])
      setLoading(false)
      captureEvent('experiment_started', { surface: 'feed' })

      // Pre-load my votes for visible profiles
      if (user) {
        const seen = new Set<string>()
        const votes: Record<string, VoteType | null> = {}
        const voteTargets = postsData
          .map((post) => post.user_id)
          .filter((targetId) => {
            if (targetId === user.id || seen.has(targetId)) return false
            seen.add(targetId)
            return true
          })

        await Promise.all(voteTargets.map(async (targetId) => {
          const isPositive = await getMyVote(user.id, targetId)
          votes[targetId] = isPositive === null ? null : (isPositive ? 1 : -1)
        }))
        setMyVotes(votes)
      }
    }
    init()
  }, [user, loadPosts])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !loading && !loadingMoreRef.current) {
          loadingMoreRef.current = true
          try {
            const next = page + 1
            const more = await loadPosts(next)
            setPosts((prev) => [...prev, ...more])
            setPage(next)
            captureEvent('feed_scroll_depth', { page: next })
          } finally {
            loadingMoreRef.current = false
          }
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, loadPosts])

  const handleVote = useCallback(async (targetId: string, type: VoteType) => {
    if (!user) return
    
    const current = myVotes[targetId]
    const newType = current === type ? null : type
    
    // 1. Optimistic UI update
    setMyVotes((prev) => ({ ...prev, [targetId]: newType }))
    
    // 2. Database mutation
    const result = await castVote({
      voterId: user.id,
      receiverId: targetId,
      isPositive: type === 1
    })

    // 3. Analytics log or rollback
    if (result.success) {
      if (result.action === 'cast') captureEvent('vote_cast', { vote_type: type })
      if (result.action === 'changed') captureEvent('vote_flipped', { vote_type: type })
    } else {
      setMyVotes((prev) => ({ ...prev, [targetId]: current }))
      console.error("No se pudo procesar el voto:", result.error)
    }
  }, [myVotes, user])

  if (loading) return <FeedSkeleton />

  return (
    <>
    <PWAInstallBanner />
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
          onCompleted={() => captureEvent('story_completed')}
        />
      )}

      {/* Stories bar */}
      {stories.length > 0 && (
        <div className="wml-stories-bar">
          {stories.map((s) => (
            <button
              key={s.id}
              className="wml-story-item"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => {
                setViewingStory(s)
                setSeenStories((prev) => new Set([...prev, s.id]))
                captureEvent('story_view')
              }}
            >
              <div className={`wml-story-ring ${seenStories.has(s.id) ? 'seen' : ''}`}>
                <div className="wml-story-ring-inner">
                  {s.profile.avatar_url
                    ? <img src={s.profile.avatar_url} alt={s.profile.username} loading="lazy" decoding="async" />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 18, color: 'var(--w-muted-2)' }}>
                        {s.profile.display_name?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
              </div>
              <span className="wml-story-username">
                @{s.profile.username}
                <SpainWorldCupBadge country={s.profile.country} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Feed posts */}
      <div className="wml-feed">
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--w-muted)', fontFamily: 'var(--w-font-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
            {locale === 'es' ? 'NO HAY PUBLICACIONES AÚN' : 'NO POSTS YET'}
          </div>
        )}

        {posts.flatMap((post, index) => {
          const items = [
            <PostCard
              key={post.id}
              post={post}
              isOwnPost={user?.id === post.user_id}
              myVote={myVotes[post.user_id] ?? null}
              onVote={handleVote}
            />,
          ]

          if ((index + 1) % 4 === 0) {
            items.push(
              <FeedAdCard
                key={`feed-ad-${post.id}`}
                locale={locale}
                slotId={`wml-feed-ad-${post.id}`}
              />,
            )
          }

          return items
        })}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────
const PostCard = memo(function PostCard({ post, isOwnPost, myVote, onVote }: {
  post: FeedPost
  isOwnPost: boolean
  myVote: VoteType | null
  onVote: (targetId: string, type: VoteType) => void
}) {
  const locale = useLocale()
  const copy = wmlCopy[locale]

  return (
    <article className="wml-post-card">
      <div className="wml-post-header">
        <AvatarMini profile={post.profile} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={wmlPath(locale, `/profile/${post.profile.username}`)} className="wml-post-username">
            {post.profile.display_name}
            <SpainWorldCupBadge country={post.profile.country} />
          </Link>
          <div className="wml-post-time">@{post.profile.username} · {timeAgo(post.created_at, locale)}</div>
        </div>
        <KarmaBadge score={post.profile.karma_score} />
      </div>

      <img
        src={post.image_url}
        alt={post.caption ?? (locale === 'es' ? 'Publicación' : 'Post')}
        className="wml-post-image"
        loading="lazy"
        decoding="async"
      />

      {!isOwnPost && (
        <div className="wml-post-actions">
          <button
            className={`wml-vote-btn ${myVote === 1 ? 'pos' : ''}`}
            onClick={() => onVote(post.user_id, 1)}
            title={copy.positive}
          >
            <ICO_UP /> {copy.positive}
          </button>
          <button
            className={`wml-vote-btn ${myVote === -1 ? 'neg' : ''}`}
            onClick={() => onVote(post.user_id, -1)}
            title={copy.negative}
          >
            <ICO_DOWN /> {copy.negative}
          </button>
        </div>
      )}

      {post.caption && (
        <p className="wml-post-caption">
          <strong style={{ color: 'var(--w-white)', marginRight: 6 }}>
            {post.profile.username}
            <SpainWorldCupBadge country={post.profile.country} />
          </strong>
          {post.caption}
        </p>
      )}
    </article>
  )
})

function FeedSkeleton() {
  return (
    <div className="wml-feed">
      {[1, 2, 3].map((i) => (
        <div key={i} className="wml-post-card">
          <div className="wml-post-header">
            <div className="wml-skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="wml-skeleton" style={{ height: 12, width: '40%' }} />
              <div className="wml-skeleton" style={{ height: 10, width: '25%' }} />
            </div>
          </div>
          <div className="wml-skeleton" style={{ width: '100%', aspectRatio: '1' }} />
        </div>
      ))}
    </div>
  )
}
