'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CustomCursor from '@/components/CustomCursor'
import styles from './page.module.css'

// ─────────────────────────────────────────────
// Inline SVG Icons
// ─────────────────────────────────────────────
const IconScale = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
  </svg>
)
const IconMask = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
  </svg>
)
const IconWaves = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9 13.5 6 15 6s3 3 4.5 3S22 7.5 22 7.5" />
    <path d="M2 17c1.5-3 3-4.5 4.5-4.5S9 14 10.5 14 13.5 11 15 11s3 3 4.5 3S22 12.5 22 12.5" />
  </svg>
)
const IconMirror = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="3" y="3" width="18" height="14" rx="1" />
    <path d="M12 17v4M8 21h8" />
  </svg>
)
const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IconMagnet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M6 15A6 6 0 0 0 6 3H3v6h3" />
    <path d="M18 15a6 6 0 0 1 0-12h3v6h-3" />
    <path d="M6 15h12" />
  </svg>
)
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M12 2 3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z" />
  </svg>
)
const IconUnlock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconMicroscope = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M6 18h12M8 22h8M10 14a4 4 0 1 0 4-4" />
    <path d="M11 2h2v8h-2zM9 2h6" />
  </svg>
)
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)
const IconFlask = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M9 3h6M9 3v7l-4 10h14L15 10V3" />
    <line x1="9" y1="3" x2="15" y2="3" />
  </svg>
)
const IconClipboard = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
)
const IconZap = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const IconBarChart = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
)
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

// ─────────────────────────────────────────────
// Types & copy
// ─────────────────────────────────────────────
type Lang = 'es' | 'en'

const copy = {
  es: {
    marqueeItems: [
      'Comportamiento Colectivo', 'Ética Digital', 'Experimentos Sociales',
      'Transparencia Radical', 'Datos Anonimizados', 'Ciencia Abierta',
      'Psicología Digital', 'Sin Lucro',
    ],
    manifestoLabel: 'Manifiesto',
    manifestoTitle: 'La tecnología revela lo que siempre estuvo ahí.',
    manifestoTitleEm: 'lo que siempre estuvo ahí.',
    manifestoP1: 'No creamos monstruos. Los descubrimos. Cada aplicación que lanzamos es un espejo —diseñado para reflejar, con precisión quirúrgica, los patrones de comportamiento que la sociedad prefiere ignorar.',
    manifestoP1Bold: 'Los descubrimos.',
    manifestoP2: 'Somos una empresa nueva. Nuestro primer experimento, WML 1.0, acaba de arrancar. Cuando termine, publicaremos todo: datos, análisis, conclusiones y lo que hayamos aprendido sobre nosotros mismos.',
    manifestoP2Bold: 'publicaremos todo',
    manifestoP3: 'La incomodidad es parte del diseño. El objetivo no es entretener —es entender.',
    principles: [
      { num: '01', title: 'Transparencia Total', desc: 'Cada participante conoce exactamente en qué experimento está. El consentimiento informado no es letra pequeña —es el principio de todo.' },
      { num: '02', title: 'Fin Definido', desc: 'Todo experimento tiene fecha de caducidad. Ninguna app vive más de lo necesario. Lanzamos, medimos, apagamos, publicamos.' },
      { num: '03', title: 'Datos Anónimos', desc: 'Recopilamos patrones de comportamiento, nunca identidades. Los datos individuales son destruidos al finalizar cada experimento.' },
      { num: '04', title: 'Datos Abiertos', desc: 'No vendemos datos individuales. No monetizamos usuarios especificos.' },
    ],
    expLabel: 'Experimentos',
    expTitle: 'Archivo de Experimentos',
    expSubtitle: 'Todos los experimentos son opt-in, con duración máxima de 365 días y auditoría independiente.',
    experiments: [
      { id: 'wml1', num: 'WML-1.0', title: 'Karma Score', sub: 'Puntúa a otros usuarios positiva o negativamente. ¿Qué ocurre cuando todos tienen una nota pública?', status: 'active', statusLabel: 'En curso' },
      { id: 'wml2', num: 'WML-2.0', title: 'Yo no soy', sub: '¿Qué pasaría si las redes sociales fueran anónimas?', status: 'upcoming', statusLabel: 'Próximamente' },
      { id: 'wml3', num: 'WML-3.0', title: 'La Ciudad Sin Memoria', sub: 'Red social donde todo contenido desaparece a las 24 horas, sin excepción.', status: 'upcoming', statusLabel: 'Próximamente' },
    ],
    howLabel: 'Metodología',
    howTitle: 'El proceso tiene estructura.',
    howDesc: 'Cada experimento sigue el mismo protocolo. Nada se improvisa, todo se publica.',
    steps: [
      { num: 1, title: 'Diseño', desc: 'Hipótesis, variables y límites éticos definidos antes de escribir una línea de código. Revisión por comité independiente.' },
      { num: 2, title: 'Consentimiento', desc: 'Los participantes conocen el experimento antes de entrar. Pueden abandonar en cualquier momento y borrar sus datos.' },
      { num: 3, title: 'Lanzamiento', desc: 'La app se activa. El equipo observa en tiempo real. Cualquier evento inesperado puede activar el cierre anticipado.' },
      { num: 4, title: 'Publicación', desc: 'Al finalizar, todos los datos anonimizados y conclusiones se pueden entregar a terceros.' },
    ],
    areasLabel: 'Categorías',
    areasTitle: 'Áreas de Investigación',
    areasDesc: 'Los vectores donde la tecnología y la psicología humana colisionan con mayor intensidad.',
    areas: [
      { cat: 'Reputación & Juicio', title: 'El Peso de la Nota', desc: '¿Cómo cambia el comportamiento cuando cada persona lleva una puntuación pública? Exploramos los efectos del juicio colectivo digitalizado.', status: 'WML 1.0 activo' },
      { cat: 'Anónimo', title: '¿Quién soy?', desc: '¿Cómo cambia nuestro comportamiento cuando nadie sabe quién está detrás del mensaje?', status: 'Planificado' },
      { cat: 'Memoria & Olvido', title: 'La Sociedad Efímera', desc: 'El impacto del contenido permanente versus el efímero. ¿Somos más honestos cuando nada quedará registrado?', status: 'Planificado' },
      { cat: 'Identidad Digital', title: 'El Yo Construido', desc: 'Cuánto mostramos, cuánto ocultamos, y qué precio pagamos por moldear nuestra identidad online.', status: 'En estudio' },
      { cat: 'Poder & Control', title: 'Jerarquías Emergentes', desc: 'Qué ocurre cuando damos a grupos sin entrenamiento las herramientas para gobernarse o excluirse. ¿Cooperan o dominan?', status: 'En estudio' },
      { cat: 'Polarización', title: 'Fricciones Calculadas', desc: 'Experimentos sobre burbujas ideológicas y qué ocurre cuando forzamos la exposición a perspectivas radicalmente contrarias.', status: 'En estudio' },
    ],
    ethicsLabel: 'Marco Ético',
    ethicsTitle: 'Distópico en forma. Ético en fondo.',
    ethicsDesc: 'La incomodidad de nuestros experimentos es intencional. El daño, jamás. Operamos bajo el marco de investigación más estricto de la UE y con supervisión externa en cada proyecto.',
    ethicsItems: [
      { title: 'Revisión Ética Independiente', desc: 'Comité externo revisa y aprueba cada diseño experimental antes de cualquier implementación técnica.' },
      { title: 'Derecho de Abandono Total', desc: 'Los participantes pueden retirarse en cualquier momento y solicitar la eliminación completa de sus datos sin justificación.' },
      { title: 'Límite Temporal Inamovible', desc: 'Ningún experimento puede extenderse. El cierre es automático y no requiere intervención humana para ejecutarse.' },
      { title: 'Código Abierto', desc: 'El código fuente de cada app es público durante el experimento. Cualquier investigador puede verificar su funcionamiento real.' },
      { title: 'Publicación Obligatoria', desc: 'Estamos obligados a publicar todos los resultados, incluso los que contradigan nuestra hipótesis o nos hagan quedar mal.' },
    ],
    ctaLabel: 'Únete',
    ctaTitle: 'Sé parte del próximo experimento.',
    ctaDesc: 'Recibirás notificaciones cuando lancemos nuevos experimentos. Tu participación siempre será voluntaria, informada y revocable.',
    ctaPlaceholder: 'tu@email.com',
    ctaBtn: 'Inscribirme',
    ctaDisclaimer: 'Sin spam. Solo ciencia incómoda.',
    ctaSuccess: '¡Apuntado! Te avisamos cuando arranque el próximo experimento.',
    ctaError: 'Algo salió mal. Inténtalo de nuevo.',
    footerDesc: 'Exploramos los límites del comportamiento humano en entornos digitales. Con transparencia, ética y rigor científico.',
    footerLab: 'Laboratorio',
    footerCompany: 'Empresa',
    footerContact: 'Contacto',
    footerCopy: '© 2026 White Mirror Lab. Todos los experimentos cuentan con aprobación ética independiente.',
    footerPrivacy: 'Privacidad',
    footerEthics: 'Marco Ético',
    footerOSS: 'Código Abierto',
    navExperiments: 'Experimentos',
    navMethodology: 'Metodología',
    navAreas: 'Áreas',
    navEthics: 'Ética',
    navManifesto: 'Manifiesto',
    navJoin: 'Participar',
  },
  en: {
    marqueeItems: [
      'Collective Behaviour', 'Digital Ethics', 'Social Experiments',
      'Radical Transparency', 'Anonymised Data', 'Open Science',
      'Digital Psychology', 'Non-Profit',
    ],
    manifestoLabel: 'Manifesto',
    manifestoTitle: 'Technology reveals what was always there.',
    manifestoTitleEm: 'what was always there.',
    manifestoP1: "We don't create monsters. We discover them. Every app we launch is a mirror —designed to reflect, with surgical precision, the behavioural patterns society prefers to ignore.",
    manifestoP1Bold: 'We discover them.',
    manifestoP2: "We're a new company. Our first experiment, WML 1.0, just launched. When it's over, we'll publish everything: data, analysis, conclusions and what we've learned about ourselves.",
    manifestoP2Bold: "we'll publish everything",
    manifestoP3: "Discomfort is part of the design. The goal isn't to entertain —it's to understand.",
    principles: [
      { num: '01', title: 'Full Transparency', desc: 'Every participant knows exactly which experiment they are in. Informed consent is not fine print —it is the foundation of everything.' },
      { num: '02', title: 'Defined End Date', desc: 'Every experiment has an expiry date. No app lives longer than necessary. We launch, measure, shut down, publish.' },
      { num: '03', title: 'Anonymous Data', desc: 'We collect behavioural patterns, never identities. Individual data is destroyed when each experiment ends.' },
      { num: '04', title: 'General Data', desc: "We do not sell individual data. We do not monetize specific users." },
    ],
    expLabel: 'Experiments',
    expTitle: 'Experiment Archive',
    expSubtitle: 'All experiments are opt-in, with a maximum duration of 365 days and independent auditing.',
    experiments: [
      { id: 'wml1', num: 'WML-1.0', title: 'Karma Score', sub: 'Rate other users positively or negatively. What happens when everyone has a public score?', status: 'active', statusLabel: 'Active' },
      { id: 'wml2', num: 'WML-2.0', title: 'I Am Not', sub: 'What if social networks were fully anonymous?', status: 'upcoming', statusLabel: 'Coming soon' },
      { id: 'wml3', num: 'WML-3.0', title: 'The City Without Memory', sub: 'A social network where all content disappears irreversibly after 24 hours.', status: 'upcoming', statusLabel: 'Coming soon' },
    ],
    howLabel: 'Methodology',
    howTitle: 'The process has structure.',
    howDesc: 'Every experiment follows the same protocol. Nothing is improvised, everything is published.',
    steps: [
      { num: 1, title: 'Design', desc: 'Hypotheses, variables and ethical limits defined before writing a single line of code. Review by an independent committee.' },
      { num: 2, title: 'Consent', desc: 'Participants know the experiment before joining. They can leave at any time and delete their data.' },
      { num: 3, title: 'Launch', desc: 'The app goes live. The team monitors in real time. Any unexpected event can trigger early closure.' },
      { num: 4, title: 'Publication', desc: 'Upon completion, all anonymised data and conclusions may be given to third parties.' },
    ],
    areasLabel: 'Categories',
    areasTitle: 'Research Areas',
    areasDesc: 'The vectors where technology and human psychology collide with the greatest intensity.',
    areas: [
      { cat: 'Reputation & Judgement', title: 'The Weight of the Score', desc: 'How does behaviour change when every person carries a public rating? We explore the effects of digitised collective judgement.', status: 'WML 1.0 active' },
      { cat: 'Anonymous', title: 'Who Am I?', desc: 'How does our behaviour change when nobody knows who is behind the message?', status: 'Planned' },
      { cat: 'Memory & Forgetting', title: 'The Ephemeral Society', desc: 'The impact of permanent versus ephemeral content. Are we more honest when nothing will be recorded?', status: 'Planned' },
      { cat: 'Digital Identity', title: 'The Constructed Self', desc: 'How much we reveal, how much we conceal, and what price we pay for moulding our online identity.', status: 'In research' },
      { cat: 'Power & Control', title: 'Emerging Hierarchies', desc: 'What happens when we give untrained groups the tools to self-govern or exclude. Do they cooperate or dominate?', status: 'In research' },
      { cat: 'Polarisation', title: 'Calculated Friction', desc: 'Experiments on ideological bubbles and what happens when we force exposure to radically opposing perspectives.', status: 'In research' },
    ],
    ethicsLabel: 'Ethics Framework',
    ethicsTitle: 'Dystopian in form. Ethical in substance.',
    ethicsDesc: 'The discomfort of our experiments is intentional. Harm, never. We operate under the strictest EU research framework with external oversight on every project.',
    ethicsItems: [
      { title: 'Independent Ethics Review', desc: 'An external committee reviews and approves every experimental design before any technical implementation.' },
      { title: 'Full Right of Withdrawal', desc: 'Participants can withdraw at any time and request complete deletion of their data without justification.' },
      { title: 'Immovable Time Limit', desc: 'No experiment can be extended. Closure is automatic and requires no human intervention to execute.' },
      { title: 'Open Source', desc: 'The source code of each app is public during the experiment. Any researcher can verify its real operation.' },
      { title: 'Mandatory Publication', desc: 'We are obliged to publish all results, even those that contradict our hypothesis or make us look bad.' },
    ],
    ctaLabel: 'Join',
    ctaTitle: 'Be part of the next experiment.',
    ctaDesc: "You'll receive notifications when we launch new experiments. Your participation will always be voluntary, informed, and revocable.",
    ctaPlaceholder: 'your@email.com',
    ctaBtn: 'Sign me up',
    ctaDisclaimer: 'No spam. Just uncomfortable science.',
    ctaSuccess: "You're in! We'll let you know when the next experiment launches.",
    ctaError: 'Something went wrong. Please try again.',
    footerDesc: 'We explore the limits of human behaviour in digital environments. With transparency, ethics, and scientific rigour.',
    footerLab: 'Lab',
    footerCompany: 'Company',
    footerContact: 'Contact',
    footerCopy: '© 2026 White Mirror Lab. All experiments have independent ethics approval.',
    footerPrivacy: 'Privacy',
    footerEthics: 'Ethics Framework',
    footerOSS: 'Open Source',
    navExperiments: 'Experiments',
    navMethodology: 'Methodology',
    navAreas: 'Areas',
    navEthics: 'Ethics',
    navManifesto: 'Manifesto',
    navJoin: 'Join',
  },
}

const areaIcons = [IconScale, IconMask, IconWaves, IconMirror, IconEye, IconMagnet]
const ethicsIcons = [IconShield, IconUnlock, IconClock, IconMicroscope, IconUpload]
const stepIcons = [IconFlask, IconClipboard, IconZap, IconBarChart]

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Home() {
  const router = useRouter()
  // null = not yet determined (avoids SSR/client mismatch)
  const [lang, setLang] = useState<Lang | null>(null)
  const [emailVal, setEmailVal] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [emailError, setEmailError] = useState(false)

  // Detect language client-side only — prevents hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem('wml_lang') as Lang | null
    if (saved === 'es' || saved === 'en') {
      setLang(saved)
      return
    }
    const nav = (navigator.language || 'en').toLowerCase()
    setLang(nav.startsWith('es') ? 'es' : 'en')
  }, [])

  const handleLangChange = (l: Lang) => {
    setLang(l)
    localStorage.setItem('wml_lang', l)
  }

  // Scroll-reveal — re-run when lang changes so newly rendered elements get observed
  useEffect(() => {
    if (!lang) return
    // Small timeout so the DOM has updated after the lang state change
    const id = setTimeout(() => {
      const els = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible')
              observer.unobserve(e.target)
            }
          })
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      )
      els.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    }, 50)
    return () => clearTimeout(id)
  }, [lang])

  // Don't render with wrong language — wait until client has resolved it.
  // This prevents a flash of ES content on EN browsers (and vice versa).
  if (!lang) return null

  const t = copy[lang]

  const handleSignup = async () => {
    if (!emailVal || !emailVal.includes('@')) {
      setEmailError(true)
      setTimeout(() => setEmailError(false), 1500)
      return
    }
    setSubmitState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitState('success')
    } catch {
      setSubmitState('error')
      setTimeout(() => setSubmitState('idle'), 3000)
    }
  }

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} onLangChange={handleLangChange} />

      <main>
        {/* ── HERO ── */}
        <Hero lang={lang} />

        {/* ── MARQUEE ── */}
        <div className={styles.marqueeWrap} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...t.marqueeItems, ...t.marqueeItems].map((item, i) => (
              <span key={i} className={styles.marqueeItem}>{item}</span>
            ))}
          </div>
        </div>

        {/* ── MANIFESTO ── */}
        <section className={styles.sectionManifesto} id="manifesto">
          <div className={`${styles.manifestoLeft} reveal-left`}>
            <div className="section-label">{t.manifestoLabel}</div>
            <h2 className={styles.manifestoTitle}>
              {t.manifestoTitle.replace(t.manifestoTitleEm, '')}
              <em className={styles.manifestoTitleEm}>{t.manifestoTitleEm}</em>
            </h2>
          </div>
          <div className={`${styles.manifestoRight} reveal-right`}>
            <p>
              {t.manifestoP1.split(t.manifestoP1Bold)[0]}
              <strong>{t.manifestoP1Bold}</strong>
              {t.manifestoP1.split(t.manifestoP1Bold)[1]}
            </p>
            <p>
              {t.manifestoP2.split(t.manifestoP2Bold)[0]}
              <strong>{t.manifestoP2Bold}</strong>
              {t.manifestoP2.split(t.manifestoP2Bold)[1]}
            </p>
            <p>{t.manifestoP3}</p>
          </div>

          <div className={styles.principlesGrid}>
            {t.principles.map((p, i) => (
              <div
                key={p.num}
                className={`principle-card ${styles.principleCard} reveal`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className={styles.principleNum}>{p.num} —</span>
                <div className={styles.principleTitle}>{p.title}</div>
                <p className={styles.principleDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXPERIMENTS ── */}
        <section className={styles.sectionExperiments} id="experiments">
          <div className={`${styles.experimentsHeader} reveal`}>
            <div>
              <div className="section-label">{t.expLabel}</div>
              <h2 className="section-h2">{t.expTitle}</h2>
            </div>
            <p className={styles.expSubtitle}>{t.expSubtitle}</p>
          </div>
          <div className={styles.experimentsList}>
            {t.experiments.map((exp, i) => (
              <div
                key={exp.id}
                className={`experiment-row ${styles.experimentRow} reveal`}
                style={{ transitionDelay: `${i * 0.1}s`, cursor: exp.status === 'active' ? 'pointer' : 'default' }}
                tabIndex={exp.status === 'active' ? 0 : undefined}
                role={exp.status === 'active' ? 'button' : undefined}
                aria-label={exp.title}
                onClick={() => exp.status === 'active' && router.push('/web/consent')}
                onKeyDown={(e) => exp.status === 'active' && e.key === 'Enter' && router.push('/web/consent')}
              >
                <div className={styles.expNum}>{exp.num}</div>
                <div>
                  <div className={styles.expTitle}>{exp.title}</div>
                  <div className={styles.expTitleSub}>{exp.sub}</div>
                </div>
                <div className={`${styles.expTag} ${exp.status === 'active' ? styles.expTagActive : styles.expTagUpcoming}`}>
                  <div className={styles.expDot} />
                  <span>{exp.statusLabel}</span>
                </div>
                <div className={styles.expArrow}><IconArrow /></div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className={styles.sectionHow} id="how">
          <div className={`${styles.howHeader} reveal`}>
            <div className="section-label">{t.howLabel}</div>
            <h2 className="section-h2">{t.howTitle}</h2>
            <p>{t.howDesc}</p>
          </div>
          <div className={styles.howSteps}>
            {t.steps.map((step, i) => {
              const Icon = stepIcons[i]
              return (
                <div
                  key={step.num}
                  className={`${styles.howStep} reveal`}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <span className={styles.howStepNum}>{step.num}</span>
                  <span className={styles.howStepIcon}><Icon /></span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── AREAS ── */}
        <section className={styles.sectionApps} id="apps">
          <div className={`${styles.appsHeader} reveal`}>
            <div className="section-label">{t.areasLabel}</div>
            <h2 className="section-h2">{t.areasTitle}</h2>
            <p>{t.areasDesc}</p>
          </div>
          <div className={styles.appsGrid}>
            {t.areas.map((area, i) => {
              const Icon = areaIcons[i]
              return (
                <div
                  key={area.title}
                  className={`app-card ${styles.appCard} reveal`}
                  style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
                >
                  <div className={styles.appCardAccent} />
                  <div className={styles.appCardCategory}>{area.cat}</div>
                  <div className={styles.appCardIconWrap}><Icon /></div>
                  <h3 className={styles.appCardTitle}>{area.title}</h3>
                  <p className={styles.appCardDesc}>{area.desc}</p>
                  <div className={styles.appCardFooter}>
                    <span className={styles.appCardStatus}>{area.status}</span>
                    <span className={styles.appCardArrow}><IconArrow /></span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── ETHICS ── */}
        <section className={styles.sectionEthics} id="ethics">
          <div className={styles.ethicsInner}>
            <div className={`${styles.ethicsLeft} reveal-left`}>
              <div className="section-label">{t.ethicsLabel}</div>
              <h2 className="section-h2">{t.ethicsTitle}</h2>
              <p>{t.ethicsDesc}</p>
            </div>
            <div className={`${styles.ethicsRight} reveal-right`}>
              {t.ethicsItems.map((item, i) => {
                const Icon = ethicsIcons[i]
                return (
                  <div key={item.title} className={styles.ethicsItem}>
                    <div className={styles.ethicsItemIcon}><Icon /></div>
                    <div>
                      <h4 className={styles.ethicsItemTitle}>{item.title}</h4>
                      <p className={styles.ethicsItemDesc}>{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={styles.sectionCta} id="signup">
          <div className={styles.ctaGlow} aria-hidden="true" />
          <div className="section-label" style={{ justifyContent: 'center' }}>{t.ctaLabel}</div>
          <h2 className={`${styles.ctaTitle} reveal`}>{t.ctaTitle}</h2>
          <p className={`${styles.ctaDesc} reveal`}>{t.ctaDesc}</p>

          {submitState === 'success' ? (
            <p className={styles.ctaSuccessMsg}>{t.ctaSuccess}</p>
          ) : (
            <div className={`${styles.ctaForm} reveal`}>
              <input
                type="email"
                placeholder={t.ctaPlaceholder}
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                style={{ borderColor: emailError ? '#ff3c00' : undefined }}
                aria-label="Email address"
                disabled={submitState === 'loading'}
              />
              <button
                type="button"
                onClick={handleSignup}
                disabled={submitState === 'loading'}
                aria-busy={submitState === 'loading'}
              >
                {submitState === 'loading' ? '...' : t.ctaBtn}
              </button>
            </div>
          )}

          {submitState === 'error' && (
            <p className={styles.ctaErrorMsg}>{t.ctaError}</p>
          )}

          <p className={`${styles.ctaDisclaimer} reveal`}>{t.ctaDisclaimer}</p>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogo}>
            <span className={styles.logoDot} />
            White Mirror Lab
          </div>
          <p>{t.footerDesc}</p>
        </div>
        <div className={styles.footerCol}>
          <h4>{t.footerLab}</h4>
          <ul>
            <li><a href="#experiments">{t.navExperiments}</a></li>
            <li><a href="#how">{t.navMethodology}</a></li>
            <li><a href="#apps">{t.navAreas}</a></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4>{t.footerCompany}</h4>
          <ul>
            <li><a href="#manifesto">{t.navManifesto}</a></li>
            <li><a href="#ethics">{t.navEthics}</a></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4>{t.footerContact}</h4>
          <ul>
            <li><a href="#signup">{t.navJoin}</a></li>
            <li><a href="mailto:lab@whitemirrorlab.com">lab@whitemirrorlab.com</a></li>
          </ul>
        </div>
        <div className={styles.footerBottom}>
          <p>{t.footerCopy}</p>
          <div className={styles.footerLegal}>
            <a href="/legal/privacidad">{t.footerPrivacy}</a>
            <a href="/legal/etica">{t.footerEthics}</a>
            <a href="/legal/aviso-legal">Aviso legal</a>
            <a href="/legal/cookies">Cookies</a>
            <a href="/legal/terminos">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}