'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CustomCursor from '@/components/CustomCursor'
import { useLocale } from '@/hooks/useLocale'
import { landingCopy } from '@/lib/copy'
import {
  localizedHashPath,
  legalPath,
  contactPath,
  wmlPath,
  type Locale,
} from '@/lib/i18n'
import styles from './page.module.css'

const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const makeIcon = (path: ReactNode, size = 20) => function Icon() {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {path}
    </svg>
  )
}

const areaIcons = [
  makeIcon(<><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></>),
  makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>),
  makeIcon(<><path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9 13.5 6 15 6s3 3 4.5 3S22 7.5 22 7.5" /><path d="M2 17c1.5-3 3-4.5 4.5-4.5S9 14 10.5 14 13.5 11 15 11s3 3 4.5 3S22 12.5 22 12.5" /></>),
  makeIcon(<><rect x="3" y="3" width="18" height="14" rx="1" /><path d="M12 17v4M8 21h8" /></>),
  makeIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>),
  makeIcon(<><path d="M6 15A6 6 0 0 0 6 3H3v6h3" /><path d="M18 15a6 6 0 0 1 0-12h3v6h-3" /><path d="M6 15h12" /></>),
]

const ethicsIcons = [
  makeIcon(<path d="M12 2 3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z" />),
  makeIcon(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></>),
  makeIcon(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  makeIcon(<><path d="M6 18h12M8 22h8M10 14a4 4 0 1 0 4-4" /><path d="M11 2h2v8h-2zM9 2h6" /></>),
  makeIcon(<><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></>),
]

const stepIcons = [
  makeIcon(<><path d="M9 3h6M9 3v7l-4 10h14L15 10V3" /><line x1="9" y1="3" x2="15" y2="3" /></>, 28),
  makeIcon(<><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>, 28),
  makeIcon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, 28),
  makeIcon(<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></>, 28),
]

function emphasize(text: string, bold: string) {
  const [before, after] = text.split(bold)
  return (
    <>
      {before}
      <strong>{bold}</strong>
      {after}
    </>
  )
}

export default function Home() {
  const detectedLocale = useLocale()
  const lang: Locale = detectedLocale
  const [emailVal, setEmailVal] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => {
      const els = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)')
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer.unobserve(entry.target)
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

  const t = landingCopy[lang]

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
        body: JSON.stringify({ email: emailVal, source: 'general' }),
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
      <Navbar lang={lang} />

      <main>
        <Hero lang={lang} />

        <div className={styles.marqueeWrap} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...t.marqueeItems, ...t.marqueeItems].map((item, i) => (
              <span key={`${item}-${i}`} className={styles.marqueeItem}>{item}</span>
            ))}
          </div>
        </div>

        <section className={styles.sectionManifesto} id="manifesto">
          <div className={`${styles.manifestoLeft} reveal-left`}>
            <div className="section-label">{t.manifestoLabel}</div>
            <h2 className={styles.manifestoTitle}>
              {t.manifestoTitle.replace(t.manifestoTitleEm, '')}
              <em className={styles.manifestoTitleEm}>{t.manifestoTitleEm}</em>
            </h2>
          </div>
          <div className={`${styles.manifestoRight} reveal-right`}>
            <p>{emphasize(t.manifestoP1, t.manifestoP1Bold)}</p>
            <p>{emphasize(t.manifestoP2, t.manifestoP2Bold)}</p>
            <p>{t.manifestoP3}</p>
          </div>

          <div className={styles.principlesGrid}>
            {t.principles.map((p, i) => (
              <div
                key={p.num}
                className={`principle-card ${styles.principleCard} reveal`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className={styles.principleNum}>{p.num} -</span>
                <div className={styles.principleTitle}>{p.title}</div>
                <p className={styles.principleDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

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
              <a
                key={exp.id}
                className={`experiment-row ${styles.experimentRow} reveal`}
                style={{ transitionDelay: `${i * 0.1}s`, cursor: exp.status === 'active' ? 'pointer' : 'default' }}
                href={exp.status === 'active' ? wmlPath(lang, '/consent') : undefined}
                aria-label={exp.title}
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
              </a>
            ))}
          </div>
        </section>

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
                <div key={step.num} className={`${styles.howStep} reveal`} style={{ transitionDelay: `${i * 0.1}s` }}>
                  <span className={styles.howStepNum}>{step.num}</span>
                  <span className={styles.howStepIcon}><Icon /></span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

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
                <div key={area.title} className={`app-card ${styles.appCard} reveal`} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
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

          {submitState === 'error' && <p className={styles.ctaErrorMsg}>{t.ctaError}</p>}
          <p className={`${styles.ctaDisclaimer} reveal`}>{t.ctaDisclaimer}</p>
        </section>
      </main>

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
            <li><a href={localizedHashPath(lang, '#experiments')}>{t.navExperiments}</a></li>
            <li><a href={localizedHashPath(lang, '#how')}>{t.navMethodology}</a></li>
            <li><a href={localizedHashPath(lang, '#apps')}>{t.navAreas}</a></li>
            <li><a href={contactPath(lang)}>{t.navContact}</a></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4>{t.footerCompany}</h4>
          <ul>
            <li><a href={localizedHashPath(lang, '#manifesto')}>{t.navManifesto}</a></li>
            <li><a href={localizedHashPath(lang, '#ethics')}>{t.navEthics}</a></li>
            <li><a href={wmlPath(lang, '/consent')}>{t.navWml}</a></li>
            <li><a href={contactPath(lang)}>{t.navContact}</a></li>
          </ul>
        </div>
        <div className={styles.footerCol}>
          <h4>{t.footerContact}</h4>
          <ul>
            <li><a href={localizedHashPath(lang, '#signup')}>{t.navJoin}</a></li>
            <li><a href="mailto:hello@whitemirrorlab.com">hello@whitemirrorlab.com</a></li>
          </ul>
        </div>
        <div className={styles.footerBottom}>
          <p>{t.footerCopy}</p>
          <div className={styles.footerLegal}>
            <a href={legalPath(lang, 'privacy')}>{t.footerPrivacy}</a>
            <a href={legalPath(lang, 'ethics')}>{t.footerEthics}</a>
            <a href={legalPath(lang, 'legalNotice')}>{t.footerLegalNotice}</a>
            <a href={legalPath(lang, 'cookies')}>Cookies</a>
            <a href={legalPath(lang, 'terms')}>{t.footerTerms}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
