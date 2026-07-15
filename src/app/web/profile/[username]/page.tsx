'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authcontext'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'
import {
  fetchProfileByUsername,
  fetchUserPosts,
  fetchUserPulses,
  deletePost,
  deletePulse,
  uploadAvatar,
  updateProfile,
} from '@/lib/queries'
import { castVote, getMyVote } from '@/lib/votes'
import { AvatarMini } from '@/components/wml/AppShell'
import ShareProfileButton from '@/components/wml/ShareProfile'
import type { Profile, Post, PulseWithProfile } from '@/lib/database.types'
import { captureEvent } from '@/lib/posthog'

// Debajo de const ICO_EDIT = () => ...
const ICO_SETTINGS = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const ICO_UP    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
const ICO_DOWN  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
const ICO_TRASH = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
const ICO_EDIT  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>

type TabId = 'posts' | 'pulses'

function timeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return locale === 'es' ? 'ahora' : 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function ProfilePage() {
  const params   = useParams()
  const username = Array.isArray(params.username) ? params.username[0] : (params.username as string)

  const { user, profile: myProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const copy = wmlCopy[locale]

  const [profile, setProfile]           = useState<Profile | null>(null)
  const [posts, setPosts]               = useState<Post[]>([])
  const [pulses, setPulses]             = useState<PulseWithProfile[]>([])
  const [myVote, setMyVote]             = useState<boolean | null>(null) // true = positivo, false = negativo
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [activeTab, setActiveTab]       = useState<TabId>('posts')
  const [editing, setEditing]           = useState(false)
  const [editName, setEditName]         = useState('')
  const [saving, setSaving]             = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const isOwn = Boolean(myProfile && myProfile.username === username)

  useEffect(() => {
    if (!username) return

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)

      const { data: prof, error: profErr } = await fetchProfileByUsername(username)

      if (cancelled) return

      if (profErr || !prof) {
        setError(locale === 'es' ? 'Usuario no encontrado.' : 'User not found.')
        setLoading(false)
        return
      }

      setProfile(prof)
      setEditName(prof.display_name)
      captureEvent('profile_view', { is_own_profile: user?.id === prof.id })

      const [pRes, pulsesRes] = await Promise.all([
        fetchUserPosts(prof.id),
        fetchUserPulses(prof.id),
      ])

      if (cancelled) return

      setPosts((pRes.data ?? []) as Post[])
      setPulses((pulsesRes.data ?? []) as PulseWithProfile[])

      if (user && user.id !== prof.id) {
        const vote = await getMyVote(user.id, prof.id, null, null)
        if (!cancelled) setMyVote(vote)
      }

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [username, user, locale])

  const handleVote = async (isPositive: boolean) => {
    if (!user || !profile) return
    
    const isSameButton = myVote === isPositive
    setMyVote(isSameButton ? null : isPositive)

    const res = await castVote({
      voterId: user.id,
      receiverId: profile.id,
      isPositive: isPositive,
      pulseId: null,
      photoId: null
    })

    if (res.success) {
      const { data: updatedProf } = await fetchProfileByUsername(username)
      if (updatedProf) setProfile(updatedProf)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setSaving(true)
    const { url } = await uploadAvatar(user.id, file)
    if (url) {
      setProfile((p) => p ? { ...p, avatar_url: url } : p)
      await refreshProfile()
    }
    setSaving(false)
  }

  const handleSaveEdit = async () => {
    if (!user || !editName.trim()) return
    setSaving(true)
    await updateProfile(user.id, { display_name: editName.trim() })
    captureEvent('profile_edit', { field: 'display_name' })
    await refreshProfile()
    setProfile((p) => p ? { ...p, display_name: editName.trim() } : p)
    setEditing(false)
    setSaving(false)
  }

  const handleDeletePost = async (post: Post) => {
    if (!window.confirm(locale === 'es' ? '¿Eliminar esta publicación?' : 'Delete this post?')) return
    await deletePost(post.id, post.image_url, user!.id)
    setPosts((prev) => prev.filter((p) => p.id !== post.id))
    setSelectedPost(null)
  }

  const handleDeletePulse = async (pulseId: string) => {
    if (!window.confirm(locale === 'es' ? '¿Eliminar este pulse?' : 'Delete this pulse?')) return
    await deletePulse(pulseId, user!.id)
    setPulses((prev) => prev.filter((p) => p.id !== pulseId))
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 13, color: 'var(--w-accent-neg)', letterSpacing: '0.05em', marginBottom: 20 }}>
          {error}
        </div>
        <button className="wml-btn wml-btn-ghost" onClick={() => router.back()} style={{ padding: '8px 24px', borderRadius: '8px' }}>
          {locale === 'es' ? 'Volver' : 'Go back'}
        </button>
      </div>
    )
  }

  if (loading) return <ProfileSkeleton />
  if (!profile) return null

  const votespositive = profile.votes_received_positive
  const votessnegative = profile.votes_received_negative
  const netKarma   = profile.karma_score ? profile.karma_score : votespositive - votessnegative
  const karmaClass = netKarma > 0 ? 'pos' : netKarma < 0 ? 'neg' : ''

  return (
    <div className="wml-profile" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* ── Header ── */}
      <div className="wml-profile-header" style={{ display: 'flex', gap: '24px', padding: '32px 20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <AvatarMini profile={profile} size={96} />
          {isOwn && (
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--w-accent)', color: '#fff', borderRadius: '50%',
              width: 28, height: 28, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              <ICO_EDIT />
            </label>
          )}
        </div>

        <div className="wml-profile-info" style={{ flex: 1, minWidth: '250px' }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
  className="wml-input"
  value={editName}
  onChange={(e) => setEditName(e.target.value)}
  style={{ 
    flex: 1, 
    minWidth: 150, 
    padding: '8px 12px', 
    borderRadius: '6px', 
    border: '1px solid #444444', // Borde gris oscuro para que se note el límite
    
    // Cambios clave para fondo negro y letras visibles:
    backgroundColor: '#000000',   // Fuerza el fondo negro
    color: '#ffffff',             // Fuerza el texto blanco al escribir
    fontSize: '16px',             // ¡Truco para móvil! Evita que iOS haga zoom automático al enfocar
    WebkitAppearance: 'none',     // Elimina estilos por defecto de iOS/Safari
  }}
  maxLength={40}
  autoFocus
/>
              <button 
  className="wml-btn wml-btn-primary" 
  onClick={handleSaveEdit} 
  disabled={saving} 
  style={{ 
    padding: '8px 16px', 
    borderRadius: '6px',
    backgroundColor: saving ? '#333333' : '#ffffff', // Fondo blanco (o gris si está guardando)
    color: saving ? '#888888' : '#000000',         // Texto negro (o gris si está guardando)
    border: '1px solid #ffffff',
    cursor: saving ? 'not-allowed' : 'pointer'
  }}
>
  {saving ? '...' : (locale === 'es' ? 'Guardar' : 'Save')}
</button>
              <button className="wml-btn wml-btn-ghost" onClick={() => setEditing(false)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 className="wml-profile-display-name" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                {profile.display_name}
              </h1>
              
              {isOwn && (
  <>
    <button className="wml-btn wml-btn-ghost" onClick={() => setEditing(true)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
      <ICO_EDIT /> {locale === 'es' ? 'Editar' : 'Edit'}
    </button>
    
    <button 
      className="wml-btn wml-btn-ghost" 
      onClick={() => {
        const destPath = locale === 'en'
          ? `/en/wml-1-0/profile/${username}/configuration`
          : `/web/profile/${username}/configuration`
        router.push(destPath)
      }} 
      style={{ padding: '6px 12px', fontSize: 12, borderRadius: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}
    >
      <ICO_SETTINGS /> {locale === 'es' ? 'Configuración' : 'Settings'}
    </button>
  </>
)}
              
              <ShareProfileButton username={profile.username} displayName={profile.display_name} />
            </div>
          )}

          <div className="wml-profile-username-tag" style={{ color: 'var(--w-muted)', fontSize: '0.95rem', marginBottom: '20px' }}>
            @{profile.username}
          </div>

          {isOwn && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              marginBottom: 20,
              background: 'rgba(200, 255, 0, 0.045)',
              border: '1px solid rgba(200, 255, 0, 0.2)',
              borderRadius: 6,
              color: 'var(--w-muted-2)',
              fontSize: 12,
              lineHeight: 1.6,
              maxWidth: 560,
            }}>
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: '1px solid var(--w-accent)',
                color: 'var(--w-accent)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 3,
                fontFamily: 'var(--w-font-mono)',
                fontSize: 8,
                lineHeight: 1,
              }}>
                i
              </span>
              <span>
                {locale === 'es'
                  ? 'Aviso de visibilidad: tu foto de perfil y el contenido que subas pueden ser vistos por cualquier persona a traves de tu perfil publico y enlaces compartidos del experimento.'
                  : 'Visibility notice: your profile picture and anything you upload may be visible to anyone through your public profile and shared experiment links.'}
              </span>
            </div>
          )}

          <div className="wml-profile-stats" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Karma', val: `${netKarma > 0 ? '+' : ''}${netKarma}`, cls: karmaClass },
              { label: locale === 'es' ? 'Votos +' : 'Upvotes', val: votespositive, cls: 'pos' },
              { label: locale === 'es' ? 'Votos −' : 'Downvotes', val: votessnegative, cls: 'neg' },
              { label: locale === 'es' ? 'Fotos' : 'Photos', val: posts.length, cls: '' },
              { label: 'Pulses', val: pulses.length, cls: '' },
            ].map((stat, i) => (
              <div key={i} className="wml-profile-stat" style={{ background: 'var(--w-surface)', border: '1px solid var(--w-border)', padding: '10px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px' }}>
                <span className={`wml-profile-stat-num ${stat.cls}`} style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2px' }}>{stat.val}</span>
                <span className="wml-profile-stat-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--w-muted)', letterSpacing: '0.05em' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {!isOwn && user && (
            <div className="wml-profile-vote-actions" style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button className={`wml-vote-btn ${myVote === true ? 'pos' : ''}`} onClick={() => handleVote(true)} style={{ padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--w-border)', background: myVote === true ? 'var(--w-accent-subtle)' : 'transparent' }}>
                <ICO_UP /> {copy.positive}
              </button>
              <button className={`wml-vote-btn ${myVote === false ? 'neg' : ''}`} onClick={() => handleVote(false)} style={{ padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--w-border)', background: myVote === false ? 'rgba(255,0,0,0.1)' : 'transparent' }}>
                <ICO_DOWN /> {copy.negative}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--w-border)',
        position: 'sticky',
        top: 'var(--w-nav-h)',
        background: 'var(--w-bg)',
        zIndex: 5,
      }}>
        {(['posts', 'pulses'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '16px 0',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--w-accent)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--w-accent)' : 'var(--w-muted)',
              fontFamily: 'var(--w-font-mono)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {tab === 'posts' 
              ? (locale === 'es' ? `Fotos (${posts.length})` : `Photos (${posts.length})`) 
              : `Pulses (${pulses.length})`}
          </button>
        ))}
      </div>

      {/* ── Posts grid ── */}
      {activeTab === 'posts' && (
        posts.length === 0 ? (
          <EmptyTab isOwn={isOwn} type="posts" locale={locale} />
        ) : (
          <div className="wml-posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', padding: '16px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                className="wml-grid-post"
                onClick={() => setSelectedPost(post)}
                style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '8px', aspectRatio: '1' }}
              >
                <img src={post.image_url} alt={post.caption ?? ''} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                <div className="wml-grid-post-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {isOwn && <div style={{ background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '50%' }}><ICO_TRASH /></div>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Pulses list ── */}
      {activeTab === 'pulses' && (
        pulses.length === 0 ? (
          <EmptyTab isOwn={isOwn} type="pulses" locale={locale} />
        ) : (
          <div style={{ padding: '0 16px' }}>
            {pulses.map((pulse) => (
              <div key={pulse.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--w-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <p style={{ flex: 1, fontSize: 15, lineHeight: 1.6, color: 'var(--w-text)', margin: 0, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {pulse.body}
                  </p>
                  {isOwn && (
                    <button
                      style={{ flexShrink: 0, background: 'var(--w-surface)', border: '1px solid var(--w-border)', borderRadius: '6px', color: 'var(--w-muted)', cursor: 'pointer', padding: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--w-accent-neg)'; e.currentTarget.style.borderColor = 'var(--w-accent-neg)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--w-muted)'; e.currentTarget.style.borderColor = 'var(--w-border)' }}
                      onClick={() => handleDeletePulse(pulse.id)}
                    >
                      <ICO_TRASH />
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted-2)' }}>
                    {timeAgo(pulse.created_at, locale)}
                  </span>
                  {pulse.reply_count > 0 && (
                    <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-accent)' }}>
                      {pulse.reply_count} {locale === 'es' ? 'resp.' : 'replies'}
                    </span>
                  )}
                  {pulse.reply_to_id && (
                    <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)', background: 'var(--w-surface-2)', padding: '2px 8px', borderRadius: '12px' }}>
                      {locale === 'es' ? 'RESPUESTA' : 'REPLY'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Post modal ── */}
      {selectedPost && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            style={{ background: 'var(--w-surface)', borderRadius: '12px', border: '1px solid var(--w-border)', maxWidth: 400, width: '100%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedPost.image_url} alt="" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
            
            {selectedPost.caption && (
              <div style={{ padding: '16px', fontSize: 14, color: 'var(--w-text)', lineHeight: 1.5 }}>
                {selectedPost.caption}
              </div>
            )}
            
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--w-border)', display: 'flex', gap: 12, justifyContent: 'flex-end', background: 'var(--w-bg)' }}>
              {isOwn && (
                <button className="wml-btn wml-btn-danger" onClick={() => handleDeletePost(selectedPost)} style={{ padding: '8px 16px', borderRadius: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <ICO_TRASH /> {locale === 'es' ? 'Eliminar' : 'Delete'}
                </button>
              )}
              <button className="wml-btn wml-btn-ghost" onClick={() => setSelectedPost(null)} style={{ padding: '8px 16px', borderRadius: '6px' }}>
                {locale === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyTab({ isOwn, type, locale }: { isOwn: boolean; type: 'posts' | 'pulses'; locale: string }) {
  const isEs = locale === 'es'
  let text = ''
  
  if (isOwn) {
    text = type === 'posts' 
      ? (isEs ? 'Aún no has publicado fotos' : "You haven't posted any photos yet") 
      : (isEs ? 'Aún no has escrito ningún pulse' : "You haven't written any pulses yet")
  } else {
    text = type === 'posts' 
      ? (isEs ? 'Sin publicaciones' : 'No posts yet') 
      : (isEs ? 'Sin pulses' : 'No pulses yet')
  }

  return (
    <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 13, color: 'var(--w-muted-2)', letterSpacing: '0.05em' }}>
      {text}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="wml-profile" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="wml-profile-header" style={{ display: 'flex', gap: '24px', padding: '32px 20px' }}>
        <div className="wml-skeleton" style={{ width: 96, height: 96, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, marginTop: '8px' }}>
          <div className="wml-skeleton" style={{ height: 28, width: '40%', borderRadius: '6px' }} />
          <div className="wml-skeleton" style={{ height: 16, width: '20%', borderRadius: '4px' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: '8px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="wml-skeleton" style={{ height: 60, width: 70, borderRadius: '8px' }} />)}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--w-border)' }}>
        <div className="wml-skeleton" style={{ flex: 1, height: 48 }} />
        <div className="wml-skeleton" style={{ flex: 1, height: 48 }} />
      </div>
      <div className="wml-posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', padding: '16px' }}>
        {[1,2,3,4,5,6].map(i => <div key={i} className="wml-skeleton" style={{ aspectRatio: '1', borderRadius: '8px' }} />)}
      </div>
    </div>
  )
}
