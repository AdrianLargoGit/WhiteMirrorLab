import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, isLocale, wmlPath, type Locale } from '@/lib/i18n'
import SpainWorldCupBadge from '@/components/wml/SpainWorldCupBadge'
import PublicProfileActions from './PublicProfileActions'
import styles from './PublicProfile.module.css'

type PublicProfile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  country: string | null
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
    .select('id, username, display_name, avatar_url, country, karma_score, votes_received_positive, votes_received_negative')
    .eq('username', username)
    .single()

  const profile = publicProfileQuery.data ?? (await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, country, karma_score, votes_received_positive, votes_received_negative')
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
    return { title: 'Perfil no encontrado - WML 1.0' }
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
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link href={wmlPath(locale, '/auth')} className={styles.brand}>
          <span className={styles.brandDot} />
          WML 1.0 / Karma Score
        </Link>

        <div className={styles.profileCard}>
          <div className={styles.cardTop}>
            <div className={styles.eyebrow}>
              {isEnglish ? 'Public experiment profile' : 'Perfil publico del experimento'}
            </div>
            <div className={styles.pill}>
              {isEnglish ? 'Anonymous voting' : 'Voto anonimo'}
            </div>
          </div>

          <div className={styles.hero}>
            <div className={styles.avatar}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} />
              ) : (
                profile.display_name?.[0]?.toUpperCase() ?? '?'
              )}
            </div>

            <div className={styles.identity}>
              <h1 className={styles.name}>
                {profile.display_name}
                <SpainWorldCupBadge country={profile.country} />
              </h1>
              <div className={styles.meta}>
                <span className={styles.handle}>@{profile.username}</span>
                <span className={styles.divider}>/</span>
                <span>{posts.length} {isEnglish ? 'photos' : 'fotos'} / {pulses.length} pulses</span>
              </div>
            </div>
          </div>

          <p className={styles.description}>
            {isEnglish
              ? `Vote anonymously on ${profile.display_name}'s reputation and join WML 1.0, a public experiment about digital karma and collective judgment.`
              : `Vota anonimamente la reputacion de ${profile.display_name} y entra en WML 1.0, un experimento publico sobre karma digital y juicio colectivo.`}
          </p>

          <PublicProfileActions profile={profile} locale={locale} />
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              {isEnglish ? 'Public photos' : 'Fotos publicas'}
            </div>
            <span className={styles.sectionCount}>{posts.length}/5</span>
          </div>

          {posts.length > 0 ? (
            <div className={styles.photoGrid}>
              {posts.map((post, index) => (
                <figure
                  key={post.id}
                  className={`${styles.photo} ${index === 0 && posts.length > 2 ? styles.photoFeatured : ''}`}
                  style={{ aspectRatio: index === 0 ? '4 / 5' : '1' }}
                >
                  <img src={post.image_url} alt={post.caption ?? (isEnglish ? 'Public photo' : 'Foto publica')} />
                  {post.caption && (
                    <figcaption className={styles.caption}>{post.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              {isEnglish ? 'No public photos yet.' : 'Aun no hay fotos publicas.'}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>Pulses</div>

          {pulses.length > 0 ? (
            <div className={styles.pulseList}>
              {pulses.map((pulse) => (
                <article key={pulse.id} className={styles.pulse}>
                  <p className={styles.pulseBody}>{pulse.body}</p>
                  <div className={styles.pulseMeta}>
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
            <div className={styles.empty}>
              {isEnglish ? 'No public pulses yet.' : 'Aun no hay pulses publicos.'}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
