import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'
import { PublicVotePage } from '@/components/wml/PublicVotePage'
import './public.css'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('public_profiles')
    .select('display_name, karma_score')
    .eq('username', username)
    .single()

  if (!data) {
    return { title: 'Perfil no encontrado — WML 1.0' }
  }

  const karma = data.karma_score > 0 ? `+${data.karma_score}` : String(data.karma_score)
  return {
    title: `${data.display_name} (@${username}) — Karma ${karma}`,
    description: `Vota anónimamente a ${data.display_name} en el experimento WML 1.0 Karma Score.`,
    openGraph: {
      title: `¿Qué karma le das a ${data.display_name}?`,
      description: `Karma actual: ${karma}. Vota positiva o negativamente — es anónimo.`,
      type: 'website',
    },
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params
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
          <a href="/" className="public-back">← Inicio</a>
          <span className="public-brand">WML 1.0</span>
        </header>
        <div className="public-empty">Usuario no encontrado.</div>
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
