'use client'

import { useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { ANALYTICS_CONSENT_EVENT, ANALYTICS_CONSENT_KEY } from '@/lib/posthog'

const copy = {
  es: {
    title: 'Preferencias de privacidad',
    description: 'Usamos almacenamiento esencial para que la plataforma funcione. La analitica opcional mide el uso de forma agregada y solo se activa con tu permiso.',
    essentialTitle: 'Esenciales y seguridad',
    essentialDesc: 'Necesarias para iniciar sesion y proteger tu cuenta.',
    required: 'Obligatorias',
    analyticsTitle: 'Analitica de uso',
    analyticsDesc: 'Pageviews, funciones usadas, dispositivo aproximado e idioma. No incluye textos, contrasenas ni contenido de formularios.',
    acceptAll: 'Aceptar todas',
    configure: 'Configurar',
    saveSettings: 'Guardar seleccion',
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

export default function CookieBanner() {
  const locale = useLocale()
  const t = copy[locale]
  const [isVisible, setIsVisible] = useState(() =>
    typeof window !== 'undefined' && !localStorage.getItem(ANALYTICS_CONSENT_KEY)
  )
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
    setIsVisible(false)
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
