'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n'

const AD_MESSAGE_TYPE = 'wml-adsterra-status'
const AD_CONTAINER_ID = 'container-54237a243e6e5ead86fd96dfae1f4fe7'
const AD_SCRIPT_SRC = 'https://pl31053382.profitableratecpmnetwork.com/54237a243e6e5ead86fd96dfae1f4fe7/invoke.js'

const copy = {
  es: {
    label: 'Anuncio',
    source: 'White Mirror Lab',
    meta: 'Anuncio · Patrocinado',
  },
  en: {
    label: 'Ad',
    source: 'White Mirror Lab',
    meta: 'Ad · Sponsored',
  },
} satisfies Record<Locale, { label: string; source: string; meta: string }>

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

export default function FeedAdCard({ locale, slotId }: { locale: Locale; slotId: string }) {
  const [loaded, setLoaded] = useState(false)
  const text = copy[locale]

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; slotId?: string; loaded?: boolean } | null
      if (!data || data.type !== AD_MESSAGE_TYPE || data.slotId !== slotId) return
      setLoaded(Boolean(data.loaded))
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [slotId])

  return (
    <article className={`wml-post-card wml-ad-post-card ${loaded ? 'wml-ad-post-card-loaded' : ''}`} aria-label={text.label}>
      <div className="wml-post-header wml-ad-post-header">
        <div className="wml-ad-avatar" aria-hidden="true">AD</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="wml-post-username">{text.source}</div>
          <div className="wml-post-time">{text.meta}</div>
        </div>
        <span className="wml-ad-label">{text.label}</span>
      </div>
      <div className="wml-ad-frame-wrap">
        <iframe
          title={`${text.label} WML 1.0`}
          className="wml-ad-frame"
          srcDoc={adsterraFrameHtml(slotId)}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </article>
  )
}
