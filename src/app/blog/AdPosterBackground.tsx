import type { Locale } from '@/lib/i18n'
import styles from './page.module.css'

type AdFrame = {
  x: number
  y: number
  w: number
  h: number
  r: number
}

const adFallback = {
  es: {
    title: 'Anuncio no disponible',
    body: 'Tu navegador o bloqueador ha impedido cargar este espacio publicitario.',
    action: 'Desactiva el bloqueador para ver patrocinadores.',
    label: 'Anuncio',
  },
  en: {
    title: 'Ad unavailable',
    body: 'Your browser or blocker prevented this advertising slot from loading.',
    action: 'Disable your blocker to see sponsors.',
    label: 'Ad',
  },
} satisfies Record<Locale, { title: string; body: string; action: string; label: string }>

const adFrames: AdFrame[] = [
  { x: 2, y: 2, w: 23, h: 20, r: -4 },
  { x: 23, y: 1, w: 24, h: 22, r: 2 },
  { x: 46, y: 3, w: 22, h: 19, r: -1 },
  { x: 68, y: 1, w: 28, h: 24, r: 3 },
  { x: 5, y: 24, w: 28, h: 24, r: 2 },
  { x: 34, y: 25, w: 23, h: 22, r: -3 },
  { x: 58, y: 27, w: 21, h: 20, r: 4 },
  { x: 77, y: 28, w: 22, h: 23, r: -2 },
  { x: 1, y: 52, w: 22, h: 23, r: 3 },
  { x: 22, y: 51, w: 26, h: 24, r: -2 },
  { x: 48, y: 54, w: 25, h: 23, r: 2 },
  { x: 72, y: 53, w: 27, h: 25, r: -4 },
  { x: 8, y: 78, w: 29, h: 22, r: -3 },
  { x: 38, y: 78, w: 24, h: 21, r: 4 },
  { x: 62, y: 79, w: 32, h: 23, r: -1 },
]

function adsterraFrameHtml(locale: Locale) {
  const fallback = adFallback[locale]

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      html, body, body * { cursor: none !important; }
      html, body { width: 100%; height: 100%; margin: 0; background: transparent; overflow: hidden; }
      body { position: relative; display: grid; place-items: stretch; font-family: Arial, Helvetica, sans-serif; }
      #container-54237a243e6e5ead86fd96dfae1f4fe7 { position: absolute; inset: 0; z-index: 2; width: 100%; min-height: 100%; display: grid; place-items: center; background: transparent; }
      body.ad-empty #container-54237a243e6e5ead86fd96dfae1f4fe7 { display: none; }
      .fallback { position: absolute; inset: 0; z-index: 1; display: grid; align-content: center; gap: 8px; padding: 16px; background: linear-gradient(135deg, rgba(255,255,255,.22), transparent 34%), repeating-linear-gradient(0deg, transparent 0 12px, rgba(0,0,0,.05) 13px 14px), #d8cdb5; color: #080808; }
      .fallback span { width: fit-content; padding: 4px 7px; background: #080808; color: #c8ff00; font: 800 10px/1 monospace; letter-spacing: .12em; text-transform: uppercase; }
      .fallback strong { max-width: 10ch; font: 900 clamp(24px, 8vw, 48px)/.86 Arial Black, Impact, Arial, sans-serif; text-transform: uppercase; }
      .fallback small { max-width: 30ch; color: rgba(8,8,8,.72); font: 700 12px/1.25 monospace; text-transform: uppercase; }
      .fallback i { position: absolute; left: 12px; right: 12px; bottom: 10px; height: 12px; background: repeating-linear-gradient(90deg, rgba(8,8,8,.86) 0 2px, transparent 2px 5px); }
    </style>
  </head>
  <body>
    <div class="fallback" aria-hidden="true">
      <span>AD</span>
      <strong>${fallback.title}</strong>
      <small>${fallback.body}</small>
      <small>${fallback.action}</small>
      <i></i>
    </div>
    <script async="async" data-cfasync="false" src="https://pl31053382.profitableratecpmnetwork.com/54237a243e6e5ead86fd96dfae1f4fe7/invoke.js"></script>
    <div id="container-54237a243e6e5ead86fd96dfae1f4fe7"></div>
    <script>
      (function () {
        var container = document.getElementById('container-54237a243e6e5ead86fd96dfae1f4fe7');
        function hasAdContent() {
          return Boolean(container && (container.children.length > 0 || container.textContent.trim().length > 0));
        }
        function update() {
          document.body.classList.toggle('ad-empty', !hasAdContent());
        }
        if (container && 'MutationObserver' in window) {
          new MutationObserver(update).observe(container, { childList: true, subtree: true, characterData: true });
        }
        window.setTimeout(update, 2200);
        window.setTimeout(update, 5200);
      })();
    </script>
  </body>
</html>`
}

export default function AdPosterBackground({ locale }: { locale: Locale }) {
  const fallback = adFallback[locale]

  return (
    <div className={styles.posterWall}>
      {adFrames.map((frame, index) => (
        <div
          key={`adsterra-frame-${index}`}
          className={styles.adSlot}
          style={{
            left: `${frame.x}%`,
            top: `${frame.y}%`,
            width: `${frame.w}%`,
            height: `${frame.h}%`,
            transform: `rotate(${frame.r}deg)`,
          }}
        >
          <iframe
            title={`${fallback.label} ${index + 1}`}
            className={styles.adFrame}
            srcDoc={adsterraFrameHtml(locale)}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ))}
    </div>
  )
}
