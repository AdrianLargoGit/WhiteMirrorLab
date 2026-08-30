'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useLocale } from '@/hooks/useLocale'
import {
  blogPath,
  downloadPath,
  faroPath,
  localizedHashPath,
  wmlPath,
} from '@/lib/i18n'
import styles from './page.module.css'

const copy = {
  es: {
    eyebrow: 'Experimentos',
    title: 'Todo lo que White Mirror Lab pone en marcha.',
    lead: 'Un mapa vivo de experimentos sociales, herramientas, observatorios y relatos. Cada pieza existe para mirar una parte distinta del comportamiento digital.',
    stats: ['4 activos', '3 proximos', '20:00 FARO'],
    activeLabel: 'Activos ahora',
    catalogLabel: 'En preparacion',
    open: 'Acceder',
    details: 'Ver detalle',
    cards: [
      {
        num: '01',
        title: 'WML 1.0',
        tag: 'Activo',
        state: 'active',
        meta: 'Reputacion publica / karma visible',
        body: 'El experimento principal de reputacion publica: perfiles, votos anonimos y karma visible para estudiar como cambia la conducta cuando el juicio colectivo queda expuesto.',
        tone: 'lime',
        hrefKey: 'wml',
      },
      {
        num: '02',
        title: 'Proximos experimentos',
        tag: 'Archivo futuro',
        state: 'planned',
        meta: 'Anonimato / memoria / poder',
        body: 'Ideas en preparacion sobre anonimato, memoria efimera, identidad digital y dinamicas de poder. Aun no estan abiertos, pero ya forman parte del mapa de investigacion.',
        tone: 'pink',
        hrefKey: 'upcoming',
      },
      {
        num: '03',
        title: 'Blog',
        tag: 'Cuaderno',
        state: 'active',
        meta: 'Textos y contexto',
        body: 'Textos, casos, ensayos y piezas de contexto alrededor de los temas que atraviesan el laboratorio: tecnologia, comportamiento, reputacion y cultura digital.',
        tone: 'blue',
        hrefKey: 'blog',
      },
      {
        num: '04',
        title: 'WML X.X.0',
        tag: 'Widget experimental',
        state: 'active',
        meta: 'Mascota de escritorio / puntos',
        body: 'Una mascota de escritorio para Windows que convierte actividad local en puntos y prueba nuevas formas de convivencia entre interfaz, rutina y asistencia local.',
        tone: 'sun',
        hrefKey: 'download',
      },
      {
        num: '05',
        title: 'FARO',
        tag: 'Mensaje diario',
        state: 'active',
        meta: 'Una frase al dia',
        body: 'Una pagina que muestra una sola frase al dia. La frase la escribe una persona elegida para ese dia y se publica como una senal minima, anonima y temporal.',
        tone: 'dark',
        hrefKey: 'faro',
      },
    ],
    upcomingTitle: 'Proximos experimentos',
    upcomingLead: 'No tienen pagina propia todavia. Cuando se abran, apareceran aqui con acceso directo.',
    upcoming: [
      {
        name: 'WML-2.0 / Yo no soy',
        body: 'Una red social anonima para observar como cambia la expresion cuando nadie sabe quien esta detras del mensaje.',
      },
      {
        name: 'WML-3.0 / La ciudad sin memoria',
        body: 'Un espacio donde todo desaparece a las 24 horas para estudiar si la ausencia de permanencia cambia lo que la gente decide mostrar.',
      },
      {
        name: 'Identidad, poder y friccion',
        body: 'Lineas de investigacion sobre jerarquias emergentes, polarizacion e identidad construida en sistemas digitales.',
      },
    ],
  },
  en: {
    eyebrow: 'Experiments',
    title: 'Everything White Mirror Lab sets in motion.',
    lead: 'A living map of social experiments, tools, observatories, and writing. Each piece exists to look at a different part of digital behavior.',
    stats: ['4 active', '3 upcoming', '20:00 FARO'],
    activeLabel: 'Active now',
    catalogLabel: 'In preparation',
    open: 'Open',
    details: 'View details',
    cards: [
      {
        num: '01',
        title: 'WML 1.0',
        tag: 'Active',
        state: 'active',
        meta: 'Public reputation / visible karma',
        body: 'The main public reputation experiment: profiles, anonymous votes, and visible karma to study how behavior changes when collective judgment is exposed.',
        tone: 'lime',
        hrefKey: 'wml',
      },
      {
        num: '02',
        title: 'Upcoming experiments',
        tag: 'Future archive',
        state: 'planned',
        meta: 'Anonymity / memory / power',
        body: 'Ideas in preparation around anonymity, ephemeral memory, digital identity, and power dynamics. They are not open yet, but already belong to the research map.',
        tone: 'pink',
        hrefKey: 'upcoming',
      },
      {
        num: '03',
        title: 'Blog',
        tag: 'Notebook',
        state: 'active',
        meta: 'Writing and context',
        body: 'Texts, cases, essays, and context pieces around the themes running through the lab: technology, behavior, reputation, and digital culture.',
        tone: 'blue',
        hrefKey: 'blog',
      },
      {
        num: '04',
        title: 'WML X.X.0',
        tag: 'Experimental widget',
        state: 'active',
        meta: 'Desktop pet / points',
        body: 'A desktop pet for Windows that turns local activity into points and tests new ways for interfaces, routines, and local assistance to coexist.',
        tone: 'sun',
        hrefKey: 'download',
      },
      {
        num: '05',
        title: 'FARO',
        tag: 'Daily message',
        state: 'active',
        meta: 'One sentence per day',
        body: 'A page that shows one sentence per day. The sentence is written by the person selected for that date and published as a minimal, anonymous, temporary signal.',
        tone: 'dark',
        hrefKey: 'faro',
      },
    ],
    upcomingTitle: 'Upcoming experiments',
    upcomingLead: 'They do not have their own pages yet. When they open, they will appear here with direct access.',
    upcoming: [
      {
        name: 'WML-2.0 / I Am Not',
        body: 'An anonymous social network for observing how expression changes when nobody knows who is behind the message.',
      },
      {
        name: 'WML-3.0 / The City Without Memory',
        body: 'A space where everything disappears after 24 hours to study whether impermanence changes what people choose to show.',
      },
      {
        name: 'Identity, power, and friction',
        body: 'Research lines around emerging hierarchies, polarization, and constructed identity in digital systems.',
      },
    ],
  },
} as const

type HrefKey = (typeof copy.es.cards)[number]['hrefKey']

export default function ExperimentosPage() {
  const lang = useLocale()
  const t = copy[lang]
  const hrefs: Record<HrefKey, string> = {
    wml: wmlPath(lang, '/consent'),
    upcoming: '#proximos',
    blog: blogPath(lang),
    download: downloadPath(lang),
    faro: faroPath(lang),
  }
  const activeCards = t.cards.filter((card) => card.state === 'active')
  const plannedCards = t.cards.filter((card) => card.state === 'planned')

  return (
    <div className={styles.page}>
      <Navbar lang={lang} />
      <main>
        <section className={styles.hero}>
          <p>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <span>{t.lead}</span>
          <div className={styles.heroStats} aria-label={lang === 'es' ? 'Resumen' : 'Summary'}>
            {t.stats.map((item) => (
              <strong key={item}>{item}</strong>
            ))}
          </div>
        </section>

        <section className={styles.activeSection} aria-label={t.activeLabel}>
          <p className={styles.sectionLabel}>{t.activeLabel}</p>
          <div className={styles.activeGrid}>
            {activeCards.map((card) => (
              <article key={card.title} className={`${styles.activeCard} ${styles[card.tone]}`}>
                <small>{card.num}</small>
                <div>
                  <span>{card.tag}</span>
                  <h2>{card.title}</h2>
                </div>
                <div>
                  <strong>{card.meta}</strong>
                  <p>{card.body}</p>
                </div>
                <Link href={hrefs[card.hrefKey]}>{t.open}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.grid} aria-label={t.catalogLabel}>
          <p className={styles.sectionLabel}>{t.catalogLabel}</p>
          {plannedCards.map((card) => (
            <article key={card.title} className={`${styles.card} ${styles[card.tone]}`}>
              <div className={styles.cardIdentity}>
                <small>{card.num}</small>
                <h2>{card.title}</h2>
                <span>{card.tag}</span>
              </div>
              <div className={styles.cardBody}>
                <strong>{card.meta}</strong>
                <p>{card.body}</p>
              </div>
              <Link href={hrefs[card.hrefKey]}>
                {card.hrefKey === 'upcoming' ? t.details : t.open}
              </Link>
            </article>
          ))}
        </section>

        <section id="proximos" className={styles.upcoming}>
          <div className={styles.upcomingIntro}>
            <p>{t.upcomingTitle}</p>
            <h2>{t.upcomingLead}</h2>
          </div>
          <div className={styles.upcomingList}>
            {t.upcoming.map((item) => (
              <article key={item.name}>
                <h3>{item.name}</h3>
                <p>{item.body}</p>
                <Link href={localizedHashPath(lang, '#signup')}>{t.open}</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
