'use client'

import { useState, useSyncExternalStore } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { ANALYTICS_CONSENT_EVENT, ANALYTICS_CONSENT_KEY } from '@/lib/posthog'

const copy = {
  es: {
    title: 'Preferencias de privacidad',
    description: 'Usamos almacenamiento esencial para que la plataforma funcione. La analítica opcional mide el uso de forma agregada y solo se activa con tu permiso.',
    essentialTitle: 'Esenciales y seguridad',
    essentialDesc: 'Necesarias para iniciar sesión y proteger tu cuenta.',
    required: 'Obligatorias',
    analyticsTitle: 'Analítica de uso',
    analyticsDesc: 'Pageviews, funciones usadas, dispositivo aproximado e idioma. No incluye textos, contraseñas ni contenido de formularios.',
    acceptAll: 'Aceptar todas',
    configure: 'Configurar',
    saveSettings: 'Guardar selección',
    onlyEssential: 'Solo esenciales',
  },
  en: {
    title: 'Privacy preferences',
    description: 'We use essential storage to keep the platform working. Optional analytics measures aggregated usage and is enabled only with your permission.',
    essentialTitle: 'Essential and security',
    essentialDesc: 'Required to sign in and protect your account.',
    required: 'Required',
    analyticsTitle: 'Usage analytics',
    analyticsDesc: 'Pageviews, features used, approximate device class, and language. It excludes text, passwords, and form content.',
    acceptAll: 'Accept all',
    configure: 'Configure',
    saveSettings: 'Save selection',
    onlyEssential: 'Essential only',
  },
} as const

function subscribeToConsent(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(ANALYTICS_CONSENT_EVENT, callback)

  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(ANALYTICS_CONSENT_EVENT, callback)
  }
}

function getConsentSnapshot() {
  return !localStorage.getItem(ANALYTICS_CONSENT_KEY)
}

export default function CookieBanner() {
  const locale = useLocale()
  const t = copy[locale]
  const isVisible = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, () => false)
  const [showSettings, setShowSettings] = useState(false)
  const [analyticsConsent, setAnalyticsConsent] = useState(false)

  const saveConsent = (analytics: boolean) => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
    }))
    window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, {
      detail: { analytics },
    }))
  }

  if (!isVisible) return null

  return (
    <aside className="cookie-banner" aria-labelledby="cookie-title">
      <h2 id="cookie-title">{t.title}</h2>
      <p>{t.description}</p>

      {showSettings && (
        <div className="cookie-settings">
          <div className="cookie-setting-row">
            <div>
              <strong>{t.essentialTitle}</strong>
              <span>{t.essentialDesc}</span>
            </div>
            <span className="cookie-required">{t.required}</span>
          </div>
          <label className="cookie-setting-row">
            <div>
              <strong>{t.analyticsTitle}</strong>
              <span>{t.analyticsDesc}</span>
            </div>
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={(event) => setAnalyticsConsent(event.target.checked)}
            />
          </label>
        </div>
      )}

      <div className="cookie-actions">
        <button type="button" className="cookie-primary" onClick={() => saveConsent(true)}>
          {t.acceptAll}
        </button>
        <button
          type="button"
          onClick={() => showSettings ? saveConsent(analyticsConsent) : setShowSettings(true)}
        >
          {showSettings ? t.saveSettings : t.configure}
        </button>
        {!showSettings && (
          <button type="button" onClick={() => saveConsent(false)}>{t.onlyEssential}</button>
        )}
      </div>
    </aside>
  )
}
