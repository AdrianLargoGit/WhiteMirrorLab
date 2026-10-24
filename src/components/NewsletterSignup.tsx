'use client'

import { useState } from 'react'
import { landingCopy } from '@/lib/copy'
import { downloadPath, type Locale } from '@/lib/i18n'
import { isValidEmailAddress } from '@/lib/emailValidation'
import styles from '@/app/page.module.css'

export default function NewsletterSignup({ lang }: { lang: Locale }) {
  const t = landingCopy[lang]
  const [emailVal, setEmailVal] = useState('')
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [emailError, setEmailError] = useState(false)

  const handleSignup = async () => {
    const normalizedEmail = emailVal.trim().toLowerCase()

    if (!isValidEmailAddress(normalizedEmail)) {
      setEmailError(true)
      setTimeout(() => setEmailError(false), 1500)
      return
    }
    setSubmitState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, source: 'general' }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitState('success')
      window.setTimeout(() => {
        window.location.assign(downloadPath(lang))
      }, 700)
    } catch {
      setSubmitState('error')
      setTimeout(() => setSubmitState('idle'), 3000)
    }
  }

  return (
    <>
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
    </>
  )
}
