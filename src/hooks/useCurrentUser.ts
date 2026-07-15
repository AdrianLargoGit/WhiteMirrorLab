'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { identifyUser } from '@/lib/posthog'
import { useLocale } from './useLocale'
import type { Profile } from '@/lib/database.types'

export function useCurrentUser() {
  const locale = useLocale()
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (mounted) {
        if(data) {
          setProfile(data)
          identifyUser(user.id, {
            preferred_language: data.preferred_language ?? locale,
            country: data.country ?? undefined,
            account_created_at: data.created_at,
          })
        }
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [locale])

  return { userId, profile, loading }
}
