import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { PublicVotePage } from '@/components/wml/PublicVotePage'
import { DEFAULT_LOCALE, homePath, isLocale, type Locale } from '@/lib/i18n'
import './public.css'

interface PageProps {
  params: Promise<{ username: string }>
}

async function getRequestLocale(): Promise<Locale> {
  const headerLocale = (await headers()).get('x-wml-locale')
  return isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const locale = await getRequestLocale()
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('public_profiles')
    .select('display_name, karma_score')
    .eq('username', username)
    .single()

  if (!data) {
    return { title: locale === 'es' ? 'Perfil no encontrado - WML 1.0' : 'Profile not found - WML 1.0' }
  }

  const karma = data.karma_score > 0 ? `+${data.karma_score}` : String(data.karma_score)
  const title = `${data.display_name} (@${username}) - Karma ${karma}`
  const description = locale === 'es'
    ? `Vota anonimamente a ${data.display_name} en el experimento WML 1.0 Karma Score.`
    : `Vote anonymously for ${data.display_name} in the WML 1.0 Karma Score experiment.`

  return {
    title,
    description,
    openGraph: {
      title: locale === 'es'
        ? `Que karma le das a ${data.display_name}?`
        : `What karma would you give ${data.display_name}?`,
      description: locale === 'es'
        ? `Karma actual: ${karma}. Vota positiva o negativamente. Es anonimo.`
        : `Current karma: ${karma}. Vote positively or negatively. It is anonymous.`,
      type: 'website',
    },
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
  const locale = await getRequestLocale()
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return (
      <div className="public-page">
        <header className="public-header">
          <a href={homePath(locale)} className="public-back">
            {locale === 'es' ? '<- Inicio' : '<- Home'}
          </a>
          <span className="public-brand">WML 1.0</span>
        </header>
        <div className="public-empty">
          {locale === 'es' ? 'Usuario no encontrado.' : 'User not found.'}
        </div>
      </div>
    )
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: true })
    .limit(5)

  return (
    <PublicVotePage
      profile={profile}
      photos={photos ?? []}
    />
  )
}
