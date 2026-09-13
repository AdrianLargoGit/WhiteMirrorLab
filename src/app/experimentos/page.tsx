'use client'

import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLocale } from '@/hooks/useLocale'
import { blogPath, downloadPath, faroPath, type Locale } from '@/lib/i18n'
import styles from './page.module.css'

const copy = {
  es: {
    eyebrow: 'Experimentos',
    open: 'Abrir',
    cards: [
      {
        title: 'WML X.X.0',
        label: 'Principal',
        meta: 'Mascota local para Windows',
        body: 'Compañía flotante para el escritorio: puntos, skins, IA local y acciones confirmadas sin leer lo que escribes.',
        hrefKey: 'download',
        image: '/wmlxx0/paint-hedgehog.png',
        tone: 'sun',
      },
      {
        title: 'Blog',
        label: 'Editorial',
        meta: 'Artículos jugables',
        body: 'Un blog atrapado entre anuncios, ruido y pequeñas ventanas de atención que también se puede jugar.',
        hrefKey: 'blog',
        image: '/wmlxx0/flower-sit.png',
        tone: 'pink',
      },
      {
        title: 'FARO',
        label: 'Señal diaria',
        meta: 'Una frase al día',
        body: 'Una pieza mínima, humana y temporal: una frase publicada cada día sin convertir a nadie en producto.',
        hrefKey: 'faro',
        image: '/wmlxx0/smiley.png',
        tone: 'blue',
      },
      {
        title: '¿Y mañana?',
        label: 'Después',
        meta: 'Casilla sin anunciar',
        body: 'Quién sabe lo que va a pasar mañana. Todavía no tiene forma pública.',
        hrefKey: 'download',
        image: '/wmlxx0/figure.png',
        tone: 'ghost',
      },
    ],
  },
  en: {
    eyebrow: 'Experiments',
    open: 'Open',
    cards: [
      {
        title: 'WML X.X.0',
        label: 'Main',
        meta: 'Local pet for Windows',
        body: 'A floating desktop companion: points, skins, local AI, and confirmed actions without reading what you type.',
        hrefKey: 'download',
        image: '/wmlxx0/paint-hedgehog.png',
        tone: 'sun',
      },
      {
        title: 'Blog',
        label: 'Editorial',
        meta: 'Playable articles',
        body: 'A blog caught between ads, noise, and small windows of attention that can also be played.',
        hrefKey: 'blog',
        image: '/wmlxx0/flower-sit.png',
        tone: 'pink',
      },
      {
        title: 'FARO',
        label: 'Daily signal',
        meta: 'One sentence per day',
        body: 'A minimal, human, temporary piece: one sentence published each day without turning anyone into a product.',
        hrefKey: 'faro',
        image: '/wmlxx0/smiley.png',
        tone: 'blue',
      },
      {
        title: 'Tomorrow?',
        label: 'Next',
        meta: 'Unannounced square',
        body: 'Who knows what tomorrow will do. It has no public shape yet.',
        hrefKey: 'download',
        image: '/wmlxx0/figure.png',
        tone: 'ghost',
      },
    ],
  },
} as const

type Card = (typeof copy.es.cards)[number]
type HrefKey = Card['hrefKey']

function hrefFor(lang: Locale, key: HrefKey) {
  if (key === 'download') return downloadPath(lang)
  if (key === 'blog') return blogPath(lang)
  return faroPath(lang)
}

export default function ExperimentosPage() {
  const lang = useLocale()
  const t = copy[lang]

  return (
    <div className={styles.page}>
      <Navbar lang={lang} />
      <main>
        <section className={styles.grid} aria-label={t.eyebrow}>
          {t.cards.map((card, index) => (
            <Link
              key={card.title}
              href={hrefFor(lang, card.hrefKey)}
              className={`${styles.square} ${styles[card.tone]}`}
            >
              <div className={styles.squareTop}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{card.label}</strong>
              </div>
              <div className={styles.squareImage}>
                <Image
                  src={card.image}
                  alt=""
                  width={210}
                  height={210}
                  sizes="(max-width: 700px) 54vw, 210px"
                />
              </div>
              <div className={styles.squareCopy}>
                <p>{card.meta}</p>
                <h2>{card.title}</h2>
                <span>{card.body}</span>
              </div>
              <small>{t.open}</small>
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
