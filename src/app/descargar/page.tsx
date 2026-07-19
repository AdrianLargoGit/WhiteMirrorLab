'use client'

import { useState } from 'react'
import Link from 'next/link'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { downloadCopy } from '@/lib/copy'
import { homePath } from '@/lib/i18n'
import { useLocale } from '@/hooks/useLocale'
import styles from './page.module.css'

const DOWNLOAD_URL = 'https://github.com/AdrianLargoGit/WhiteMirrorLab/releases/download/v1.0.1/wml-xx0-1.0.0-setup.exe'

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M4 21h16" />
  </svg>
)

const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
)

export default function DownloadPage() {
  const lang = useLocale()
  const t = downloadCopy[lang]
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [hasSubscribed, setHasSubscribed] = useState(false)
  const [acceptedWidgetTerms, setAcceptedWidgetTerms] = useState(false)

  const handleSubscribe = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSubmitState('error')
      setMessage(t.invalidEmail)
      return
    }

    setSubmitState('loading')
    setMessage('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (!res.ok) throw new Error('Subscribe failed')

      setSubmitState('success')
      setHasSubscribed(true)
      setMessage(t.subscribeSuccess)
    } catch {
      setSubmitState('error')
      setMessage(t.subscribeError)
    }
  }

  const handleAcceptAndDownload = () => {
    if (!acceptedWidgetTerms) {
      setSubmitState('error')
      setMessage(t.consentRequired)
      return
    }

    window.location.assign(DOWNLOAD_URL)
  }

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <div className="section-label">{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p className={styles.lead}>{t.lead}</p>

            <div className={`${styles.downloadForm} ${styles.desktopOnly}`}>
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && !hasSubscribed && handleSubscribe()}
                disabled={submitState === 'loading' || hasSubscribed}
                aria-label={t.emailPlaceholder}
              />
              <button
                type="button"
                className={styles.downloadButton}
                onClick={handleSubscribe}
                disabled={submitState === 'loading' || hasSubscribed}
                aria-busy={submitState === 'loading'}
              >
                <IconDownload />
                <span>{submitState === 'loading' ? '...' : t.desktopCta}</span>
              </button>
            </div>

            {message && (
              <p className={`${styles.formMessage} ${submitState === 'success' ? styles.formMessageSuccess : styles.formMessageError}`}>
                {message}
              </p>
            )}

            {hasSubscribed && (
              <div className={`${styles.consentBox} ${styles.desktopOnly}`}>
                <h2>{t.consentTitle}</h2>
                <p>{t.consentLead}</p>
                <ul>
                  {t.consentItems.map((item) => (
                    <li key={item}>
                      <IconCheck />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <label className={styles.consentCheck}>
                  <input
                    type="checkbox"
                    checked={acceptedWidgetTerms}
                    onChange={(event) => {
                      setAcceptedWidgetTerms(event.target.checked)
                      if (event.target.checked && submitState === 'error') {
                        setSubmitState('success')
                        setMessage(t.subscribeSuccess)
                      }
                    }}
                  />
                  <span>{t.consentCheckbox}</span>
                </label>
                <button
                  type="button"
                  className={styles.downloadButton}
                  onClick={handleAcceptAndDownload}
                >
                  <IconDownload />
                  <span>{t.consentCta}</span>
                </button>
              </div>
            )}

            <div className={styles.actions}>
              <Link className="btn-ghost" href={homePath(lang)}>
                <span className="btn-ghost-arrow" aria-hidden="true" />
                {t.backHome}
              </Link>
            </div>

            <p className={`${styles.hint} ${styles.desktopOnly}`}>{t.desktopHint}</p>
            <div className={`${styles.mobileNotice} ${styles.mobileOnly}`} role="status">
              <h2>{t.mobileTitle}</h2>
              <p>{t.mobileText}</p>
            </div>
          </div>

          <aside className={styles.panel} aria-label={t.version}>
            <div className={styles.panelTop}>
              <span>WML</span>
              <span>X.X.0</span>
            </div>
            <dl className={styles.specs}>
              <div>
                <dt>{t.versionLabel}</dt>
                <dd>{t.version}</dd>
              </div>
              <div>
                <dt>{t.petLabel}</dt>
                <dd>{t.pet}</dd>
              </div>
              <div>
                <dt>{t.pointsLabel}</dt>
                <dd>{t.points}</dd>
              </div>
            </dl>
            <ul className={styles.checks}>
              {t.checks.map((item) => (
                <li key={item}>
                  <IconCheck />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
    </div>
  )
}
