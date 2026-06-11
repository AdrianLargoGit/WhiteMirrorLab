'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { identifyUser } from '@/lib/analytics'
import type { PublicProfile } from '@/lib/types'

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<PublicProfile | null>(null)
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
          setProfile(data as PublicProfile)
          identifyUser(user.id, { username: data.username })
        }
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return { userId, profile, loading }
}
