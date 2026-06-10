'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { setConsentCookie } from '@/lib/consent'
import { captureEvent } from '@/lib/analytics'
import { WmlBackBar } from '@/components/wml/WmlBackBar'
import { wmlCopy } from '@/lib/copy'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'

function ConsentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [age, setAge] = useState(false)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [voluntary, setVoluntary] = useState(false)
  const [error, setError] = useState('')

  const canProceed = age && terms && privacy && voluntary

  const handleContinue = () => {
    if (!canProceed) {
      setError(t.consentRequired)
      return
    }
    setConsentCookie()
    captureEvent('experiment_consent_given', { version: 'wml_consent_v1', locale })
    const authUrl = next
      ? `${wmlPath(locale, '/auth')}?next=${encodeURIComponent(next)}`
      : wmlPath(locale, '/auth')
    router.push(authUrl)
  }

  return (
    <div className="wml-consent">
      <WmlBackBar title={t.consentTitle} />

      <div className="wml-consent-card">
        <div className="wml-consent-badge">{t.consentBadge}</div>
        <h1 className="wml-consent-heading">{t.consentHeading}</h1>
        <p className="wml-consent-lead">{t.consentLead}</p>

        <div className="wml-consent-info">
          <h2>{t.consentInfoTitle}</h2>
          <ul>
            {t.consentBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="wml-consent-checks">
          <label className="wml-consent-check">
            <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} />
            <span>{t.consentAge}</span>
          </label>

          <label className="wml-consent-check">
            <input type="checkbox" checked={voluntary} onChange={(e) => setVoluntary(e.target.checked)} />
            <span>{t.consentVoluntary}</span>
          </label>

          <label className="wml-consent-check">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>
              {t.consentTermsPrefix}{' '}
              <Link href="/legal/terminos" target="_blank">{t.terms}</Link>
              {' '}/{' '}
              <Link href="/legal/etica" target="_blank">{t.ethicsFramework}</Link>.
            </span>
          </label>

          <label className="wml-consent-check">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            <span>
              {t.consentPrivacyPrefix}{' '}
              <Link href="/legal/privacidad" target="_blank">{t.privacyPolicy}</Link>
              {' '}/{' '}
              <Link href="/legal/cookies" target="_blank">{t.cookiesPolicy}</Link>.
            </span>
          </label>
        </div>

        {error && <div className="wml-error-msg">{error}</div>}

        <button
          type="button"
          className="wml-btn wml-btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          disabled={!canProceed}
          onClick={handleContinue}
        >
          {t.acceptAndJoin}
        </button>

        <p className="wml-consent-footer-note">
          {t.dataController} / <Link href="/legal/aviso-legal">{t.legalNotice}</Link>
        </p>
      </div>
    </div>
  )
}

export default function ConsentPage() {
  const locale = useLocale()
  return (
    <Suspense fallback={<div className="wml-empty">{wmlCopy[locale].loadingExperiment}</div>}>
      <ConsentForm />
    </Suspense>
  )
}
