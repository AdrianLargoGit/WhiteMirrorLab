'use client'

import { useEffect, useState } from 'react'
import { PRO_TRIAL_CAMPAIGN, PRO_TRIAL_END } from '@/lib/proPromotion'

export function useProPromotion() {
  const [remaining, setRemaining] = useState(0)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let disposed = false
    let sample: { enabled: boolean; serverNow: number; receivedAt: number } | null = null
    let controller: AbortController | null = null
    function tick() {
      if (disposed) return
      setRemaining(sample?.enabled ? Math.max(0, Math.ceil((PRO_TRIAL_END - sample.serverNow - (performance.now() - sample.receivedAt)) / 1000)) : 0)
    }
    async function refresh() {
      controller?.abort()
      const request = new AbortController()
      controller = request
      const sentAt = performance.now()
      try {
        const response = await fetch('/api/pro/checkout', { cache: 'no-store', signal: request.signal })
        if (!response.ok) throw new Error('promotion_unavailable')
        const { promotion } = await response.json()
        if (disposed || request.signal.aborted) return
        if (typeof promotion?.serverNow !== 'number' || !Number.isFinite(promotion.serverNow)) throw new Error('invalid_promotion')
        // Include the full round-trip conservatively; never rely on the user's clock.
        sample = { enabled: promotion.active === true && promotion.campaign === PRO_TRIAL_CAMPAIGN && promotion.endsAt === PRO_TRIAL_END,
          serverNow: promotion.serverNow, receivedAt: sentAt }
      } catch {
        if (disposed || request.signal.aborted) return
        sample = null
      }
      tick()
      setReady(true)
    }
    void refresh()
    const timer = window.setInterval(tick, 1000)
    const poll = window.setInterval(() => { void refresh() }, 60_000)
    const visible = () => { if (document.visibilityState === 'visible') { tick(); void refresh() } }
    document.addEventListener('visibilitychange', visible)
    return () => { disposed = true; controller?.abort(); window.clearInterval(timer); window.clearInterval(poll); document.removeEventListener('visibilitychange', visible) }
  }, [])
  return { active: remaining > 0, remaining, ready }
}
