import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, isLocale, wmlPath, type Locale } from '@/lib/i18n'
import PublicProfileActions from './PublicProfileActions'

type PublicProfile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  karma_score: number
  votes_received_positive: number
  votes_received_negative: number
}

type PublicPost = {
  id: string
  image_url: string
  caption: string | null
  created_at: string
}

type PublicPulse = {
  id: string
  reply_to_id: string | null
  body: string
  reply_count: number
  created_at: string
}

type PageProps = {
  params: Promise<{ username: string }>
}

async function getLocale(): Promise<Locale> {
  const headerLocale = (await headers()).get('x-wml-locale')
  return isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
}

async function getPublicProfile(username: string) {
  const supabase = createClient()
  const publicProfileQuery = await supabase
    .from('public_profiles')
    .select('id, username, display_name, avatar_url, karma_score, votes_received_positive, votes_received_negative')
    .eq('username', username)
    .single()

  const profile = publicProfileQuery.data ?? (await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, karma_score, votes_received_positive, votes_received_negative')
    .eq('username', username)
    .single()
  ).data

  if (!profile) return null

  const typedProfile = profile as PublicProfile
  const { data: posts } = await supabase
    .from('posts')
    .select('id, image_url, caption, created_at')
    .eq('user_id', typedProfile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: pulses } = await supabase
    .from('public_pulses')
    .select('id, reply_to_id, body, reply_count, created_at')
    .eq('user_id', typedProfile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    profile: typedProfile,
    posts: (posts ?? []) as PublicPost[],
    pulses: (pulses ?? []) as PublicPulse[],
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const data = await getPublicProfile(username)
  if (!data) {
    return {
      title: 'Perfil no encontrado - WML 1.0',
    }
  }

  const karma = data.profile.karma_score > 0 ? `+${data.profile.karma_score}` : `${data.profile.karma_score}`
  const title = `@${data.profile.username} tiene ${karma} de karma en WML 1.0`
  const description = `Vota anonimamente el perfil de ${data.profile.display_name} y entra en el experimento social de reputacion digital.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: data.profile.avatar_url ? [{ url: data.profile.avatar_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.profile.avatar_url ? [data.profile.avatar_url] : undefined,
    },
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const [{ username }, locale] = await Promise.all([params, getLocale()])
  const data = await getPublicProfile(username)
  if (!data) notFound()

  const { profile, posts, pulses } = data
  const isEnglish = locale === 'en'

  return (
    <main style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #0b0b0b 0%, #080808 46%, #050505 100%)',
      color: '#f5f2ee',
      fontFamily: 'var(--font-body)',
      padding: '28px 20px 56px',
    }}>
      <section style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href={wmlPath(locale, '/auth')} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: '#6a6a6a',
          textDecoration: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8ff00', display: 'inline-block' }} />
          WML 1.0 / Karma Score
        </Link>

        <div style={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#111111',
          padding: 'clamp(22px, 5vw, 34px)',
          borderRadius: 8,
          boxShadow: '0 20px 70px rgba(0,0,0,0.34)',
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 14,
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#c8ff00',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}>
              {isEnglish ? 'Public experiment profile' : 'Perfil publico del experimento'}
            </div>
            <div style={{
              color: '#6a6a6a',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '7px 10px',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {isEnglish ? 'Anonymous voting' : 'Voto anonimo'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{
              width: 112,
              height: 112,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.14)',
              background: '#080808',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c8ff00',
              fontFamily: 'var(--font-mono)',
              fontSize: 40,
              flexShrink: 0,
              boxShadow: '0 0 0 8px rgba(255,255,255,0.025)',
            }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.display_name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 8vw, 62px)',
                lineHeight: 0.96,
                letterSpacing: '-0.03em',
                margin: 0,
              }}>
                {profile.display_name}
              </h1>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
                <span style={{ color: '#c8ff00', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  @{profile.username}
                </span>
                <span style={{ color: '#3a3a3a', fontFamily: 'var(--font-mono)', fontSize: 12 }}>/</span>
                <span style={{ color: '#6a6a6a', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {posts.length} {isEnglish ? 'photos' : 'fotos'} · {pulses.length} pulses
                </span>
              </div>
            </div>
          </div>

          <p style={{ color: '#b8b8b8', fontSize: 15, lineHeight: 1.65, marginBottom: 22, maxWidth: 620 }}>
            {isEnglish
              ? `Vote anonymously on ${profile.display_name}'s reputation and join WML 1.0, a public experiment about digital karma and collective judgment.`
              : `Vota anonimamente la reputacion de ${profile.display_name} y entra en WML 1.0, un experimento publico sobre karma digital y juicio colectivo.`}
          </p>

          <PublicProfileActions profile={profile} locale={locale} />
        </div>

        <section style={{ marginTop: 28 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#6a6a6a',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              {isEnglish ? 'Public photos' : 'Fotos publicas'}
            </div>
            <span style={{ color: '#3f3f3f', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
              {posts.length}/5
            </span>
          </div>

          {posts.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
              gap: 8,
            }}>
              {posts.map((post, index) => (
                <figure key={post.id} style={{
                  aspectRatio: index === 0 ? '4 / 5' : '1',
                  gridColumn: index === 0 && posts.length > 2 ? 'span 2' : undefined,
                  gridRow: index === 0 && posts.length > 2 ? 'span 2' : undefined,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: '#111111',
                  overflow: 'hidden',
                  borderRadius: 6,
                  margin: 0,
                  position: 'relative',
                }}>
                  <img src={post.image_url} alt={post.caption ?? (isEnglish ? 'Public photo' : 'Foto publica')} style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }} />
                  {post.caption && (
                    <figcaption style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '18px 12px 10px',
                      color: '#f5f2ee',
                      fontSize: 12,
                      lineHeight: 1.35,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
                    }}>
                      {post.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#111111',
              color: '#6a6a6a',
              padding: 22,
              borderRadius: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {isEnglish ? 'No public photos yet.' : 'Aun no hay fotos publicas.'}
            </div>
          )}
        </section>

        <section style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: '#6a6a6a',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Pulses
          </div>

          {pulses.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {pulses.map((pulse) => (
                <article key={pulse.id} style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.025), #111111)',
                  color: '#f5f2ee',
                  padding: 18,
                  borderRadius: 6,
                }}>
                  <p style={{ fontSize: 15, lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 10 }}>
                    {pulse.body}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    color: '#6a6a6a',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    <span>{new Date(pulse.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES')}</span>
                    {pulse.reply_to_id && (
                      <span>{isEnglish ? 'reply' : 'respuesta'}</span>
                    )}
                    {pulse.reply_count > 0 && (
                      <span>{pulse.reply_count} {isEnglish ? 'replies' : 'respuestas'}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#111111',
              color: '#6a6a6a',
              padding: 22,
              borderRadius: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {isEnglish ? 'No public pulses yet.' : 'Aun no hay pulses publicos.'}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
