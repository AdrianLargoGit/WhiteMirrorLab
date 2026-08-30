'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Locale } from '@/lib/i18n'

const AD_MESSAGE_TYPE = 'wml-adsterra-status'
const AD_CONTAINER_ID = 'container-54237a243e6e5ead86fd96dfae1f4fe7'
const AD_SCRIPT_SRC = 'https://pl31053382.profitableratecpmnetwork.com/54237a243e6e5ead86fd96dfae1f4fe7/invoke.js'

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

function adsterraFrameHtml(slotId: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      html, body { width: 100%; height: 100%; margin: 0; background: transparent; overflow: hidden; }
      body { position: relative; font-family: Arial, Helvetica, sans-serif; }
      #${AD_CONTAINER_ID} { position: absolute; inset: 0; width: 100%; min-height: 100%; display: grid; place-items: center; background: transparent; }
    </style>
  </head>
  <body>
    <script async="async" data-cfasync="false" src="${AD_SCRIPT_SRC}"></script>
    <div id="${AD_CONTAINER_ID}"></div>
    <script>
      (function () {
        var container = document.getElementById('${AD_CONTAINER_ID}');
        function hasAdContent() {
          return Boolean(container && (container.children.length > 0 || container.textContent.trim().length > 0));
        }
        function update() {
          window.parent.postMessage({
            type: '${AD_MESSAGE_TYPE}',
            slotId: '${slotId}',
            loaded: hasAdContent()
          }, '*');
        }
        if (container && 'MutationObserver' in window) {
          new MutationObserver(update).observe(container, { childList: true, subtree: true, characterData: true });
        }
        window.addEventListener('load', update);
        window.setTimeout(update, 1200);
        window.setTimeout(update, 2200);
        window.setTimeout(update, 5200);
      })();
    </script>
  </body>
</html>`
}

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
