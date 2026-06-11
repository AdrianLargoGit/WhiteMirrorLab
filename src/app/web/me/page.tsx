'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'
import { wmlProfilePath, homePath } from '@/lib/i18n'

export default function MePage() {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const { profile, loading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (profile) {
        router.replace(wmlProfilePath(locale, profile.username))
      } else {
        router.replace(homePath(locale))
      }
    }
  }, [loading, profile, router, locale])

  return <div className="wml-empty">{t.loadingYourProfile}</div>
}
