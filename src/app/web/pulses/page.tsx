'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/authcontext'
import { fetchPulsesFeed, createPulse, deletePulse, fetchPulseReplies } from '@/lib/queries'
//import { captureEvent } from '@/lib/posthog'
import { AvatarMini, KarmaBadge } from '@/components/wml/AppShell'
import type { PulseWithProfile } from '@/lib/database.types'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoReply  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IcoTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
const IcoSend   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>

const MAX_CHARS = 280

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function PulsesPage() {
  const { user, profile } = useAuth()
  const [pulses, setPulses]     = useState<PulseWithProfile[]>([])
  const [page, setPage]         = useState(0)
  const [hasMore, setHasMore]   = useState(true)
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState('')
  const [posting, setPosting]   = useState(false)
  const [postError, setPostError] = useState('')
  const textareaRef             = useRef<HTMLTextAreaElement>(null)
  const sentinelRef             = useRef<HTMLDivElement>(null)

  const PAGE_SIZE = 20

  const loadPulses = useCallback(async (p: number) => {
    const { data } = await fetchPulsesFeed(p, PAGE_SIZE)
    if (!data || data.length < PAGE_SIZE) setHasMore(false)
    return (data ?? []) as PulseWithProfile[]
  }, [])

  // Initial load
  useEffect(() => {
    setLoading(true)
    loadPulses(0).then((data) => {
      setPulses(data)
      setLoading(false)
    })
  }, [loadPulses])

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return
    const obs = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        const next = page + 1
        const more = await loadPulses(next)
        setPulses((prev) => [...prev, ...more])
        setPage(next)
      }
    }, { threshold: 0.1 })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hasMore, loading, page, loadPulses])

  // Auto-resize textarea
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
    const ta = textareaRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
  }

  const handlePost = async () => {
    if (!user || !body.trim()) return
    setPostError('')
    setPosting(true)
    const { data, error } = await createPulse(user.id, body)
    if (error) { setPostError(error); setPosting(false); return }
    //captureEvent('post_upload', { type: 'pulse' })
    // Prepend new pulse optimistically with profile data
    if (data && profile) {
      const optimistic: PulseWithProfile = {
        id: data.id,
        user_id: user.id,
        body: body.trim(),
        reply_to_id: null,
        reply_count: 0,
        created_at: new Date().toISOString(),
        profile: {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          karma_score: profile.karma_score,
        },
      }
      setPulses((prev) => [optimistic, ...prev])
    }
    setBody('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setPosting(false)
  }

  const handleDelete = async (pulseId: string) => {
    if (!user) return
    setPulses((prev) => prev.filter((p) => p.id !== pulseId))
    await deletePulse(pulseId, user.id)
    //captureEvent('post_deleted')
  }

  const charsLeft = MAX_CHARS - body.length
  const isOverLimit = charsLeft < 0

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Composer ── */}
      {profile && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--w-border)',
          display: 'flex',
          gap: 12,
          background: 'var(--w-surface)',
          position: 'sticky',
          top: 'var(--w-nav-h)',
          zIndex: 10,
        }}>
          <AvatarMini profile={profile} size={38} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={handleBodyChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
              }}
              placeholder="¿Qué está pasando en el experimento?"
              rows={2}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'var(--w-font-body)',
                fontSize: 15,
                color: 'var(--w-white)',
                lineHeight: 1.6,
                width: '100%',
                overflow: 'hidden',
                minHeight: 48,
              }}
            />
            {postError && (
              <div className="wml-error-msg" style={{ marginBottom: 0 }}>{postError}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Char counter */}
              <div style={{
                fontFamily: 'var(--w-font-mono)',
                fontSize: 11,
                color: isOverLimit ? 'var(--w-accent-neg)' : charsLeft <= 40 ? '#f59e0b' : 'var(--w-muted)',
                letterSpacing: '0.06em',
                transition: 'color 0.2s',
              }}>
                {charsLeft}
              </div>
              <button
  className="wml-btn wml-btn-primary"
  onClick={handlePost}
  disabled={posting || !body.trim() || isOverLimit}
  style={{ 
    padding: '8px 18px', 
    gap: 6,
    // ─── NUEVOS ESTILOS DE VISIBILIDAD ESTRICTOS ───
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
    // Si está deshabilitado (posting, vacío o límite excedido) se vuelve gris oscuro, si está listo se vuelve blanco brillante
    backgroundColor: (posting || !body.trim() || isOverLimit) ? '#27272a' : '#ffffff',
    color: (posting || !body.trim() || isOverLimit) ? '#71717a' : '#000000',
    cursor: (posting || !body.trim() || isOverLimit) ? 'not-allowed' : 'pointer',
  }}
>
  <IcoSend />
  {posting ? 'Publicando...' : 'Pulsar'}
</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feed ── */}
      {loading ? (
        <PulsesFeedSkeleton />
      ) : pulses.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
          SIN PULSES AÚN — SÉ EL PRIMERO
        </div>
      ) : (
        pulses.map((pulse) => (
          <PulseCard
            key={pulse.id}
            pulse={pulse}
            currentUserId={user?.id ?? null}
            onDelete={handleDelete}
            onReplyPosted={(reply) =>
              setPulses((prev) =>
                prev.map((p) => p.id === pulse.id ? { ...p, reply_count: p.reply_count + 1 } : p)
              )
            }
          />
        ))
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />

      {!hasMore && pulses.length > 0 && (
        <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
          FIN DEL FEED
        </div>
      )}
    </div>
  )
}

// ── Single pulse card ─────────────────────────────────────────────────────────
function PulseCard({
  pulse,
  currentUserId,
  onDelete,
  onReplyPosted,
  isReply = false,
}: {
  pulse: PulseWithProfile
  currentUserId: string | null
  onDelete: (id: string) => void
  onReplyPosted?: (reply: PulseWithProfile) => void
  isReply?: boolean
}) {
  const { user, profile } = useAuth()
  const [showReplyBox, setShowReplyBox]   = useState(false)
  const [showReplies, setShowReplies]     = useState(false)
  const [replies, setReplies]             = useState<PulseWithProfile[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [replyBody, setReplyBody]         = useState('')
  const [postingReply, setPostingReply]   = useState(false)
  const replyRef                          = useRef<HTMLTextAreaElement>(null)

  const isOwn = currentUserId === pulse.user_id

  const loadReplies = async () => {
    if (loadingReplies) return
    setLoadingReplies(true)
    const { data } = await fetchPulseReplies(pulse.id)
    setReplies((data ?? []) as PulseWithProfile[])
    setLoadingReplies(false)
  }

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0 && pulse.reply_count > 0) {
      await loadReplies()
    }
    setShowReplies((v) => !v)
  }

  const handleReplyBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyBody(e.target.value)
    const ta = replyRef.current
    if (ta) { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
  }

  const handlePostReply = async () => {
    if (!user || !replyBody.trim()) return
    setPostingReply(true)
    const { data, error } = await createPulse(user.id, replyBody, pulse.id)
    if (error || !data || !profile) { setPostingReply(false); return }

    const newReply: PulseWithProfile = {
      id: data.id,
      user_id: user.id,
      body: replyBody.trim(),
      reply_to_id: pulse.id,
      reply_count: 0,
      created_at: new Date().toISOString(),
      profile: {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        karma_score: profile.karma_score,
      },
    }

    setReplies((prev) => [...prev, newReply])
    setShowReplies(true)
    setReplyBody('')
    if (replyRef.current) replyRef.current.style.height = 'auto'
    setPostingReply(false)
    setShowReplyBox(false)
    onReplyPosted?.(newReply)
    //captureEvent('post_upload', { type: 'pulse_reply' })
  }

  const charsLeft  = MAX_CHARS - replyBody.length
  const isOverLimit = charsLeft < 0

  return (
    <article style={{
      padding: isReply ? '12px 16px 12px 52px' : '16px',
      borderBottom: '1px solid var(--w-border)',
      background: isReply ? 'var(--w-surface)' : 'transparent',
      animation: 'wFadeUp 0.2s ease',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Avatar */}
        <Link href={`/web/profile/${pulse.profile.username}`} style={{ flexShrink: 0 }}>
          <AvatarMini profile={pulse.profile} size={isReply ? 32 : 38} />
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <Link
              href={`/web/profile/${pulse.profile.username}`}
              style={{ fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', color: 'var(--w-white)', textDecoration: 'none' }}
            >
              {pulse.profile.display_name}
            </Link>
            <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)', letterSpacing: '0.04em' }}>
              @{pulse.profile.username}
            </span>
            <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)' }}>·</span>
            <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)' }}>
              {timeAgo(pulse.created_at)}
            </span>
            <KarmaBadge score={pulse.profile.karma_score} style={{ marginLeft: 'auto', fontSize: 10 }} />
          </div>

          {/* Body */}
          <p style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--w-white)',
            marginBottom: 10,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}>
            {pulse.body}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Reply toggle */}
            {!isReply && (
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: showReplyBox ? 'var(--w-accent)' : 'var(--w-muted)',
                  fontFamily: 'var(--w-font-mono)', fontSize: 10,
                  letterSpacing: '0.06em', padding: '4px 8px',
                  transition: 'color 0.15s',
                  borderRadius: 0,
                }}
                onClick={() => setShowReplyBox((v) => !v)}
                title="Responder"
              >
                <IcoReply />
                Responder
              </button>
            )}

            {/* Show replies */}
            {!isReply && pulse.reply_count > 0 && (
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: showReplies ? 'var(--w-accent)' : 'var(--w-muted)',
                  fontFamily: 'var(--w-font-mono)', fontSize: 10,
                  letterSpacing: '0.06em', padding: '4px 8px',
                  transition: 'color 0.15s',
                }}
                onClick={handleToggleReplies}
              >
                {loadingReplies ? '...' : `${pulse.reply_count} respuesta${pulse.reply_count !== 1 ? 's' : ''}`}
              </button>
            )}

            {/* Delete */}
            {isOwn && (
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--w-muted)', marginLeft: 'auto',
                  fontFamily: 'var(--w-font-mono)', fontSize: 10,
                  letterSpacing: '0.06em', padding: '4px 8px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--w-accent-neg)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--w-muted)')}
                onClick={() => onDelete(pulse.id)}
                title="Eliminar pulse"
              >
                <IcoTrash />
              </button>
            )}
          </div>

          {/* ── Inline reply composer ── */}
          {showReplyBox && profile && (
            <div style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--w-border)',
              display: 'flex',
              gap: 10,
            }}>
              <AvatarMini profile={profile} size={28} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  ref={replyRef}
                  value={replyBody}
                  onChange={handleReplyBodyChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostReply()
                    if (e.key === 'Escape') setShowReplyBox(false)
                  }}
                  placeholder={`Respondiendo a @${pulse.profile.username}…`}
                  rows={2}
                  autoFocus
                  style={{
                    background: 'var(--w-surface-2)',
                    border: '1px solid var(--w-border)',
                    padding: '8px 10px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'var(--w-font-body)',
                    fontSize: 13,
                    color: 'var(--w-white)',
                    lineHeight: 1.6,
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 0,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--w-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--w-border)')}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--w-font-mono)', fontSize: 10,
                    color: isOverLimit ? 'var(--w-accent-neg)' : charsLeft <= 40 ? '#f59e0b' : 'var(--w-muted)',
                    letterSpacing: '0.06em',
                  }}>
                    {charsLeft}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="wml-btn wml-btn-ghost"
                      onClick={() => { setShowReplyBox(false); setReplyBody('') }}
                      style={{ padding: '6px 12px', fontSize: 10 }}
                    >
                      Cancelar
                    </button>
                    <button
  className="wml-btn wml-btn-primary"
  onClick={handlePostReply}
  disabled={postingReply || !replyBody.trim() || isOverLimit}
  style={{
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: 600,
    gap: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    // Mismo tratamiento de color que el botón "Pulsar"
    backgroundColor: (postingReply || !replyBody.trim() || isOverLimit) ? '#27272a' : '#ffffff',
    color: (postingReply || !replyBody.trim() || isOverLimit) ? '#71717a' : '#000000',
    cursor: (postingReply || !replyBody.trim() || isOverLimit) ? 'not-allowed' : 'pointer',
  }}
>
  <IcoSend />
  {postingReply ? '...' : 'Responder'}
</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Replies thread ── */}
      {showReplies && replies.length > 0 && (
        <div style={{
          marginTop: 8,
          borderLeft: '2px solid var(--w-border)',
          marginLeft: 19,
        }}>
          {replies.map((reply) => (
            <PulseCard
              key={reply.id}
              pulse={reply}
              currentUserId={currentUserId}
              onDelete={(id) => {
                setReplies((prev) => prev.filter((r) => r.id !== id))
                deletePulse(id, currentUserId!)
              }}
              isReply
            />
          ))}
        </div>
      )}
    </article>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function PulsesFeedSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ padding: '16px', borderBottom: '1px solid var(--w-border)', display: 'flex', gap: 12 }}>
          <div className="wml-skeleton" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="wml-skeleton" style={{ height: 12, width: '25%' }} />
              <div className="wml-skeleton" style={{ height: 12, width: '15%' }} />
            </div>
            <div className="wml-skeleton" style={{ height: 14, width: '90%' }} />
            <div className="wml-skeleton" style={{ height: 14, width: i % 2 === 0 ? '70%' : '55%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
//fuerzo