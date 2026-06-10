'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function MePage() {
  const { profile, loading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile) {
      router.replace(`/web/profile/${profile.username}`)
    }
  }, [loading, profile, router])

  return <div className="wml-empty">Cargando tu perfil…</div>
}
