'use client'

import { useEffect, useState } from 'react'
import { AD_MESSAGE_TYPE } from '@/lib/adsterra'

export function useAdLoaded(slotId: string) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; slotId?: string; loaded?: boolean } | null
      if (!data || data.type !== AD_MESSAGE_TYPE || data.slotId !== slotId) return
      setLoaded(Boolean(data.loaded))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [slotId])
  return loaded
}
