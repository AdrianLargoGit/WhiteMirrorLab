'use client'

import { adsterraFrameHtml } from '@/lib/adsterra'
import { useAdLoaded } from '@/hooks/useAdLoaded'
import type { Locale } from '@/lib/i18n'
import marketplaceStyles from '@/app/marketplace/page.module.css'
import styles from './MarketplaceAdBanner.module.css'


const copy = {
  es: {
    label: 'Anuncio',
  },
  en: {
    label: 'Ad',
  },
} satisfies Record<Locale, { label: string }>


export default function MarketplaceAdCard({ locale, slotId, index }: { locale: Locale; slotId: string; index: number }) {
  const loaded = useAdLoaded(slotId)
  const text = copy[locale]

  return (
    <article
      className={`${marketplaceStyles.card} ${styles.card} ${loaded ? styles.loaded : styles.probe}`}
      aria-label={text.label}
    >
      <div className={`${marketplaceStyles.art} ${marketplaceStyles[`tone${(index % 4) + 1}` as keyof typeof marketplaceStyles]}`}>
        <span>{text.label}</span>
        <iframe
          title={`${text.label} ${index + 1} Marketplace WML X.X.0`}
          className={styles.frame}
          srcDoc={adsterraFrameHtml(slotId)}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </article>
  )
}
