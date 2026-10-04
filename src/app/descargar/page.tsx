'use client'

import { adsterraFrameHtml } from '@/lib/adsterra'
import { useAdLoaded } from '@/hooks/useAdLoaded'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { downloadCopy } from '@/lib/copy'
import { homePath, skinTemplatePath } from '@/lib/i18n'
import { BREVO_COUNT_FALLBACK, fetchBrevoCount } from '@/lib/brevo-count'
import { isValidEmailAddress } from '@/lib/emailValidation'
import { getDeviceType, type DeviceType } from '@/lib/deviceType'
import { useLocale } from '@/hooks/useLocale'
import { proCopy } from '@/lib/proCopy'
import { WIDGET_DOWNLOAD_URL as DOWNLOAD_URL } from '@/lib/widgetDownload'
import type { ProBillingPlan } from '@/lib/proConfig'
import styles from './page.module.css'

type Platform = 'windows' | 'linux'
type DialogMode = 'download' | 'mobile'
type DownloadPlan = 'free' | 'pro'
type ProRequestState = 'idle' | 'loading' | 'error'


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

const IconWindows = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 4.6 10.7 3.5v8H3V4.6Zm8.7-1.25L21 2v9.5h-9.3V3.35ZM3 12.5h7.7v8L3 19.4v-6.9Zm8.7 0H21V22l-9.3-1.35V12.5Z" />
  </svg>
)


function DownloadAd({ label }: { label: string }) {
  const slotId = 'download-primary'
  const loaded = useAdLoaded(slotId)

  return (
    <aside className={`${styles.downloadAd} ${loaded ? styles.downloadAdLoaded : ''}`} aria-label={label}>
      <div className={styles.downloadAdHeader}>
        <span>{label}</span>
      </div>
      <iframe
        title={`${label} WML X.X.0`}
        className={styles.downloadAdFrame}
        srcDoc={adsterraFrameHtml(slotId)}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </aside>
  )
}

export default function DownloadPage() {
  const lang = useLocale()
  const t = downloadCopy[lang]
  const p = proCopy[lang]
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [hasSubscribed, setHasSubscribed] = useState(false)
  const [acceptedWidgetTerms, setAcceptedWidgetTerms] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>('download')
  const [selectedPlan, setSelectedPlan] = useState<DownloadPlan>('free')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [proRequestState, setProRequestState] = useState<ProRequestState>('idle')
  const [billingPlan, setBillingPlan] = useState<ProBillingPlan>('monthly')
  const [proMessage, setProMessage] = useState('')
  const proCheckoutBusy = useRef(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('unknown')
  const [downloadCount, setDownloadCount] = useState(BREVO_COUNT_FALLBACK)
  const canDownload = deviceType === 'computer'

  useEffect(() => {
    const detectDevice = window.setTimeout(() => {
      setDeviceType(getDeviceType())
      if (new URLSearchParams(window.location.search).get('pro') === 'cancelled') setMessage(p.cancelled)
    }, 0)

    return () => window.clearTimeout(detectDevice)
  }, [p.cancelled])

  useEffect(() => {
    let isMounted = true

    async function fetchDownloadCount() {
      const count = await fetchBrevoCount('tech')
      if (isMounted) {
        setDownloadCount(count)
      }
    }

    fetchDownloadCount()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!showDownloadDialog) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDownloadDialog(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDownloadDialog])

  const handleSubscribe = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmailAddress(normalizedEmail)) {
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
        body: JSON.stringify({ email: normalizedEmail, source: 'tech' }),
      })

      if (!res.ok) throw new Error('Subscribe failed')

      setSubmitState('success')
      setHasSubscribed(true)
      setDialogMode(canDownload ? 'download' : 'mobile')
      setShowDownloadDialog(true)
      setMessage('')
    } catch {
      setSubmitState('error')
      setMessage(t.subscribeError)
    }
  }

  const startInstallerDownload = () => {
    setShowDownloadDialog(false)
    setMessage(t.downloadThanksTitle)
    const downloadWindow = window.open(DOWNLOAD_URL, '_blank')
    if (downloadWindow) {
      downloadWindow.opener = null
    } else {
      window.location.assign(DOWNLOAD_URL)
    }
  }

  const startProCheckout = async () => {
    if (proCheckoutBusy.current) return
    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmailAddress(normalizedEmail)) {
      setProRequestState('error')
      setProMessage(t.invalidEmail)
      return
    }

    setProRequestState('loading')
    proCheckoutBusy.current = true
    setProMessage('')

    try {
      const response = await fetch('/api/pro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          plan: billingPlan,
          locale: lang,
          acceptedTerms: acceptedWidgetTerms,
        }),
      })
      const payload = (await response.json()) as { ok?: boolean; url?: string; recovery?: boolean; error?: string }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'request_failed')
      }
      if (payload.recovery) {
        setProRequestState('idle')
        setProMessage(p.licenseRecovery)
        return
      }

      if (!payload.url || new URL(payload.url).protocol !== 'https:' ||
          !['checkout.stripe.com', 'billing.stripe.com'].includes(new URL(payload.url).hostname)) throw new Error('invalid_checkout_url')
      window.location.assign(payload.url)
    } catch (error) {
      setProRequestState('error')
      setProMessage(error instanceof Error && error.message === 'invalid_email' ? t.invalidEmail : p.checkoutError)
    } finally {
      proCheckoutBusy.current = false
    }
  }

  const handleAcceptAndDownload = () => {
    if (!acceptedWidgetTerms) {
      setSubmitState('error')
      setMessage(t.consentRequired)
      return
    }

    if (!canDownload) {
      setDialogMode('mobile')
      setShowDownloadDialog(true)
      return
    }

    if (selectedPlatform !== 'windows') {
      setSubmitState('error')
      setMessage(t.choosePlatform)
      return
    }

    if (selectedPlan === 'pro') {
      void startProCheckout()
      return
    }

    startInstallerDownload()
  }

  const closeDialog = () => {
    setShowDownloadDialog(false)
  }

  return (
    <div className="landing-page">

      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <div className="section-label">{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p className={styles.lead}>{t.lead}</p>

            <div className={styles.downloadForm}>
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

            <div className={styles.creatorCallout}>
              <div>
                <span>{t.creatorsTitle}</span>
                <p>{t.creatorsText}</p>
              </div>
              <Link href={skinTemplatePath(lang)}>{t.creatorsCta}</Link>
            </div>

            {showDownloadDialog && (
              <div className={styles.modalOverlay} role="presentation" onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeDialog()
              }}>
                <div
                  className={styles.downloadModal}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="download-consent-title"
                >
                  <div className={styles.modalHeader}>
                    <div>
                      <div className="section-label">{t.version}</div>
                      <h2 id="download-consent-title">
                        {dialogMode === 'mobile' ? t.mobileDialogTitle : t.consentTitle}
                      </h2>
                    </div>
                    <button type="button" className={styles.closeButton} onClick={closeDialog} aria-label={t.closePopup}>
                      ×
                    </button>
                  </div>

                  {dialogMode === 'mobile' ? (
                    <>
                      <p className={styles.modalLead}>{t.mobileDialogText}</p>
                      <div className={styles.modalActions}>
                        <button type="button" className={styles.secondaryButton} onClick={closeDialog}>
                          {t.closePopup}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.modalLead}>{t.consentLead}</p>
                      <div className={styles.planBlock}>
                        <h3>{t.planTitle}</h3>
                        <p>{t.planLead}</p>
                        <div className={styles.planGrid}>
                          <button
                            type="button"
                            className={`${styles.planButton} ${selectedPlan === 'free' ? styles.planButtonActive : ''}`}
                            onClick={() => {
                              setSelectedPlan('free')
                              setProMessage('')
                              setProRequestState('idle')
                            }}
                            aria-pressed={selectedPlan === 'free'}
                          >
                            <strong>{t.freePlanTitle}</strong>
                            <span>{t.freePlanText}</span>
                            <b>{p.freePrice}</b>
                            <span className={styles.planFeatures}>
                              {p.freeFeatures.map(feature => <span key={feature}>{feature}</span>)}
                            </span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.planButton} ${selectedPlan === 'pro' ? styles.planButtonActive : ''}`}
                            onClick={() => {
                              setSelectedPlan('pro')
                              setProMessage('')
                              setProRequestState('idle')
                            }}
                            aria-pressed={selectedPlan === 'pro'}
                          >
                            <strong>{t.proPlanTitle}</strong>
                            <span>{p.includesFree}</span>
                            <b>{p.monthly} · {p.annual}</b>
                            <span className={styles.planFeatures}>
                              {p.features.map(feature => <span key={feature}>{feature}</span>)}
                            </span>
                          </button>
                        </div>
                        {selectedPlan === 'pro' && (
                          <>
                            <div className={styles.billingGrid} role="group" aria-label={lang === 'es' ? 'Periodo de pago' : 'Billing period'}>
                              {(['monthly', 'annual'] as const).map(plan => (
                                <button key={plan} type="button" className={`${styles.planButton} ${billingPlan === plan ? styles.planButtonActive : ''}`} onClick={() => setBillingPlan(plan)} aria-pressed={billingPlan === plan}>
                                  <strong>{p[plan]}</strong>
                                </button>
                              ))}
                            </div>
                            <p>{p.annualSaving}</p>
                            <p>{p.renewal}</p>
                            <p>{p.licenseConnection}</p>
                          </>
                        )}
                      </div>

                      <ul className={styles.modalList}>
                        {[...t.consentItems, ...(selectedPlan === 'pro' ? p.proConsent : [])].map((item) => (
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
                            if (!event.target.checked) setSelectedPlatform(null)
                            if (event.target.checked && submitState === 'error') {
                              setSubmitState('success')
                              setMessage('')
                            }
                          }}
                        />
                        <span>{t.consentCheckbox}</span>
                      </label>

                      <div className={styles.requirementsBlock}>
                        <h3>{t.requirementsTitle}</h3>
                        <ul>
                          {t.requirements.map((item) => (
                            <li key={item}>
                              <IconCheck />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        {selectedPlan === 'pro' && (
                          <div className={styles.proModelRequirements}>
                            <h4>{t.proModelsTitle}</h4>
                            <div className={styles.proModelGrid}>
                              {t.proModels.map((model) => (
                                <div className={styles.proModelRow} key={model.name}>
                                  <strong>{model.name}</strong>
                                  <b>{model.ram} RAM</b>
                                </div>
                              ))}
                            </div>
                            <p>{t.proModelsNote}</p>
                          </div>
                        )}
                      </div>

                      <div className={styles.platformBlock} aria-disabled={!acceptedWidgetTerms}>
                        <h3>{t.platformTitle}</h3>
                        <p>{t.platformLead}</p>
                        <div className={styles.platformGrid}>
                          <button
                            type="button"
                            className={`${styles.platformButton} ${selectedPlatform === 'windows' ? styles.platformButtonActive : ''}`}
                            onClick={() => acceptedWidgetTerms && setSelectedPlatform('windows')}
                            disabled={!acceptedWidgetTerms}
                            aria-pressed={selectedPlatform === 'windows'}
                          >
                            <IconWindows />
                            <span>{t.windowsLabel}</span>
                          </button>
                          <button
                            type="button"
                            className={styles.platformButton}
                            disabled
                            aria-disabled="true"
                          >
                            <span className={styles.linuxIcon} aria-hidden="true" />
                            <span>{t.linuxLabel}</span>
                            <small>{t.linuxUnavailable}</small>
                          </button>
                        </div>
                      </div>

                      {selectedPlan === 'pro' && (
                        <div className={styles.proLicenseBlock} role="alert">
                          <p>{p.licensePersonal}</p>
                          {proMessage && <p className={`${styles.proStatus} ${proRequestState === 'error' ? styles.proStatusError : ''}`}>{proMessage}</p>}
                        </div>
                      )}

                      <div className={styles.modalActions}>
                        <button
                          type="button"
                          className={styles.downloadButton}
                          onClick={handleAcceptAndDownload}
                          disabled={!acceptedWidgetTerms || selectedPlatform !== 'windows' || proRequestState === 'loading'}
                          aria-busy={proRequestState === 'loading'}
                        >
                          <IconDownload />
                          <span>
                            {selectedPlan === 'pro'
                              ? proRequestState === 'loading'
                                ? p.loading
                                : `${p.checkout} · ${p[billingPlan]}`
                              : t.consentCta}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {message && (
              <p className={`${styles.formMessage} ${submitState === 'success' ? styles.formMessageSuccess : styles.formMessageError}`}>
                {message}
              </p>
            )}

            <div className={styles.actions}>
              <Link className="btn-ghost" href={homePath(lang)}>
                <span className="btn-ghost-arrow" aria-hidden="true" />
                {t.backHome}
              </Link>
            </div>

            {canDownload ? (
              <p className={styles.hint}>{t.desktopHint}</p>
            ) : deviceType !== 'unknown' ? (
              <div className={styles.mobileNotice} role="status">
                <h2>{t.mobileTitle}</h2>
                <p>{t.mobileText}</p>
              </div>
            ) : null}
            <a className={styles.subscriptionLink} href="/api/pro/portal">{p.manage}</a>
          </div>

          <div className={styles.sideColumn}>
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
                <div>
                  <dt>{t.downloadsLabel}</dt>
                  <dd>{downloadCount.toLocaleString(lang)}</dd>
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
            <DownloadAd label={lang === 'es' ? 'Anuncio' : 'Ad'} />
          </div>
        </section>
      </main>
    </div>
  )
}
