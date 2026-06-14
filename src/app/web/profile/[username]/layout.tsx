import { Metadata } from 'next'
import { fetchProfileByUsername } from '@/lib/queries' // Ajusta el import si es necesario

type Props = {
  params: { username: string }
}

// src/app/web/profile/[username]/layout.tsx

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = Array.isArray(params.username) ? params.username[0] : params.username
  
  // 1. Hacemos la consulta
  const { data: profile } = await fetchProfileByUsername(username)

  // 2. EL GUARDIÁN: Si el perfil es null o no existe, devolvemos un fallback 
  // Esto evita que la app rompa si el usuario no existe o si Next.js compila a ciegas
  if (!profile) {
    return {
      title: 'Perfil | WML',
      description: 'Perfil de WML.',
    }
  }

  // 3. Si pasa el guardián, es 100% seguro que "profile" tiene datos
  const title = `¡Vota a ${profile.display_name || username} en WML!`
  const description = `Apóyame con un voto positivo. Mi Karma actual es ${profile.karma_score || 0}. 🚀`
  const ogImage = profile.avatar_url || 'https://localhost:3000/icon.svg' 

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tudominio.com/web/profile/${profile.username}`, // Cambia por tu dominio real
      type: 'profile',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: `Avatar de ${profile.display_name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}
// El layout simplemente envuelve a tu página (Client Component)
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}