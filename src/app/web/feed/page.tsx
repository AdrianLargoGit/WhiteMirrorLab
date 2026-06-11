'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/authcontext'
import { fetchFeedPosts, fetchActiveStories, castVote, getMyVoteOnTarget } from '@/lib/queries'
import { captureEvent } from '@/lib/posthog'
import { AvatarMini, KarmaBadge } from '@/components/wml10/AppShell'
import type { Post, Profile, Story, VoteType } from '@/lib/database.types'
import StoryViewer from '@/components/wml10/StoryViewer'

type FeedPost        = Post & { profile: Profile }
type StoryWithProfile = Story & { profile: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'display_name'> }

const ICO_UP   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
const ICO_DOWN = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts]               = useState<FeedPost[]>([])
  const [stories, setStories]           = useState<StoryWithProfile[]>([])
  const [page, setPage]                 = useState(0)
  const [loading, setLoading]           = useState(true)
  const [hasMore, setHasMore]           = useState(true)
  const [myVotes, setMyVotes]           = useState<Record<string, VoteType | null>>({})
  const [viewingStory, setViewingStory] = useState<StoryWithProfile | null>(null)
  const [seenStories, setSeenStories]   = useState<Set<string>>(new Set())
  const sentinelRef                     = useRef<HTMLDivElement>(null)

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
      captureEvent('ranking_view') // reuse event type — represents any feed view

      // Pre-load my votes for visible profiles
      if (user) {
        const seen = new Set<string>()
        const votes: Record<string, VoteType | null> = {}
        for (const post of postsData) {
          if (!seen.has(post.user_id) && post.user_id !== user.id) {
            seen.add(post.user_id)
            votes[post.user_id] = await getMyVoteOnTarget(user.id, post.user_id)
          }
        }
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
        if (entry.isIntersecting && !loading) {
          const next = page + 1
          const more = await loadPosts(next)
          setPosts((prev) => [...prev, ...more])
          setPage(next)
          captureEvent('feed_scroll_depth', { page: next })
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, loadPosts])

  const handleVote = async (targetId: string, type: VoteType) => {
    if (!user) return
    const current  = myVotes[targetId]
    const newType  = current === type ? null : type
    setMyVotes((prev) => ({ ...prev, [targetId]: newType }))
    if (newType !== null) {
      await castVote(user.id, targetId, newType)
      captureEvent(current !== null ? 'vote_flipped' : 'vote_cast', { vote_type: newType })
    }
  }

  if (loading) return <FeedSkeleton />

  return (
    <>
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
                captureEvent('story_view', { story_user: s.profile.username })
              }}
            >
              <div className={`wml-story-ring ${seenStories.has(s.id) ? 'seen' : ''}`}>
                <div className="wml-story-ring-inner">
                  {s.profile.avatar_url
                    ? <img src={s.profile.avatar_url} alt={s.profile.username} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 18, color: 'var(--w-muted-2)' }}>
                        {s.profile.display_name?.[0]?.toUpperCase()}
                      </div>
                  }
                </div>
              </div>
              <span className="wml-story-username">@{s.profile.username}</span>
            </button>
          ))}
        </div>
      )}

      {/* Feed posts */}
      <div className="wml-feed">
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--w-muted)', fontFamily: 'var(--w-font-mono)', fontSize: 11, letterSpacing: '0.12em' }}>
            NO HAY PUBLICACIONES AÚN
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isOwnPost={user?.id === post.user_id}
            myVote={myVotes[post.user_id] ?? null}
            onVote={handleVote}
          />
        ))}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </>
  )
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, isOwnPost, myVote, onVote }: {
  post: FeedPost
  isOwnPost: boolean
  myVote: VoteType | null
  onVote: (targetId: string, type: VoteType) => void
}) {
  return (
    <article className="wml-post-card">
      <div className="wml-post-header">
        <AvatarMini profile={post.profile} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/web/profile/${post.profile.username}`} className="wml-post-username">
            {post.profile.display_name}
          </Link>
          <div className="wml-post-time">@{post.profile.username} · {timeAgo(post.created_at)}</div>
        </div>
        <KarmaBadge score={post.profile.karma_score} />
      </div>

      <img
        src={post.image_url}
        alt={post.caption ?? 'Publicación'}
        className="wml-post-image"
        loading="lazy"
      />

      {!isOwnPost && (
        <div className="wml-post-actions">
          <button
            className={`wml-vote-btn ${myVote === 1 ? 'pos' : ''}`}
            onClick={() => onVote(post.user_id, 1)}
            title="Voto positivo"
          >
            <ICO_UP /> Positivo
          </button>
          <button
            className={`wml-vote-btn ${myVote === -1 ? 'neg' : ''}`}
            onClick={() => onVote(post.user_id, -1)}
            title="Voto negativo"
          >
            <ICO_DOWN /> Negativo
          </button>
        </div>
      )}

      {post.caption && (
        <p className="wml-post-caption">
          <strong style={{ color: 'var(--w-white)', marginRight: 6 }}>{post.profile.username}</strong>
          {post.caption}
        </p>
      )}
    </article>
  )
}

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