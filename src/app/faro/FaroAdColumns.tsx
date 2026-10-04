'use client'

import { AD_MESSAGE_TYPE, adsterraFrameHtml } from '@/lib/adsterra'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/lib/i18n'


const adCopy = {
  es: { label: 'Anuncio' },
  en: { label: 'Ad' },
} satisfies Record<Locale, { label: string }>

const adSlots = [
  { side: 'left', index: 1 },
  { side: 'left', index: 2 },
  { side: 'right', index: 1 },
  { side: 'right', index: 2 },
] as const


export default function FaroAdColumns({ locale }: { locale: Locale }) {
  const copy = adCopy[locale]
  const [loadedSlots, setLoadedSlots] = useState<Record<string, boolean>>({})

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; slotId?: string; loaded?: boolean } | null
      if (!data || data.type !== AD_MESSAGE_TYPE || !data.slotId?.startsWith('faro-')) return

      setLoadedSlots((current) => {
        const loaded = Boolean(data.loaded)
        if (current[data.slotId!] === loaded) return current
        return { ...current, [data.slotId!]: loaded }
      })
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const hasLoadedSlot = useMemo(
    () => Object.values(loadedSlots).some(Boolean),
    [loadedSlots],
  )

  return (
    <aside className={`faro-ad-columns ${hasLoadedSlot ? 'faro-ad-columns-active' : ''}`} aria-label={copy.label}>
      {adSlots.map((slot) => {
        const slotId = `faro-${slot.side}-${slot.index}`
        const isLoaded = Boolean(loadedSlots[slotId])

        return (
          <div
            key={slotId}
            className={`faro-ad-slot faro-ad-slot-${slot.side} faro-ad-slot-${slot.index} ${isLoaded ? 'faro-ad-slot-loaded' : ''}`}
          >
            <iframe
              title={`${copy.label} FARO ${slot.side} ${slot.index}`}
              className="faro-ad-frame"
              srcDoc={adsterraFrameHtml(slotId)}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )
      })}
    </aside>
  )
}
