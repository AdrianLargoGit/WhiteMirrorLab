'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/authcontext'
import { wmlPath, type Locale } from '@/lib/i18n'
import SpainWorldCupBadge from '@/components/wml/SpainWorldCupBadge'
import styles from './PublicProfile.module.css'

type PublicProfileIdentityProps = {
  profile: {
    username: string
    display_name: string
    avatar_url: string | null
    country: string | null
  }
  locale: Locale
  meta: React.ReactNode
}

export default function PublicProfileIdentity({
  profile,
  locale,
  meta,
}: PublicProfileIdentityProps) {
  const { user } = useAuth()
  const profileHref = wmlPath(locale, `/profile/${profile.username}`)
  const canOpenInternalProfile = Boolean(user)

  const avatar = (
    <div className={styles.avatar}>
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.display_name} />
      ) : (
        profile.display_name?.[0]?.toUpperCase() ?? '?'
      )}
    </div>
  )

  const name = (
    <h1 className={styles.name}>
      {profile.display_name}
      <SpainWorldCupBadge country={profile.country} />
    </h1>
  )

  return (
    <div className={styles.hero}>
      {canOpenInternalProfile ? (
        <Link href={profileHref} className={styles.avatarLink}>
          {avatar}
        </Link>
      ) : avatar}

      <div className={styles.identity}>
        {canOpenInternalProfile ? (
          <Link href={profileHref} className={styles.nameLink}>
            {name}
          </Link>
        ) : name}
        <div className={styles.meta}>{meta}</div>
      </div>
    </div>
  )
}
