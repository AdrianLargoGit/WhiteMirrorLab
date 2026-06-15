'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { setConsentCookie } from '@/lib/consent'
import { captureEvent } from '@/lib/posthog'
import { wmlCopy } from '@/lib/copy'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'

const IcoBulletCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--w-accent, #00f0ff)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

function ConsentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const mode = searchParams.get('mode')
  const locale = useLocale()
  const t = wmlCopy[locale]

  const [age, setAge] = useState(false)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [voluntary, setVoluntary] = useState(false)
  const [error, setError] = useState('')

  const canProceed = age && terms && privacy && voluntary

  const handleAcceptAllToggles = () => {
    setAge(true)
    setVoluntary(true)
    setTerms(true)
    setPrivacy(true)
    setError('')
  }

  const handleContinue = () => {
    if (!canProceed) {
      setError(t.consentRequired || 'Por favor, acepta todos los puntos obligatorios.')
      return
    }
    setConsentCookie()
    captureEvent('experiment_consent_given', { version: 'wml_consent_v1', locale })
    
    // Genera la ruta a la página principal respetando el idioma actual
    const homeUrl = wmlPath(locale, '/')
      
    // Redirige al usuario
    router.push(homeUrl)
  }

  return (
    /* 
      CAPA DE ENMASCARAMIENTO INYECTADA: 
      Usa position 'fixed' e inset '0' para tapar absolutamente todo el Navbar y Sidebar de la app 
    */
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#09090b', // Fondo ultra oscuro para aislar la vista
      zIndex: 99999, // Prioridad absoluta sobre cualquier componente
      overflowY: 'auto',
      padding: '40px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Contenedor central limitado */}
      <div className="wml-consent-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '460px', margin: 'auto 0' }}>
        
        {/* Encabezado */}
        <div className="wml-consent-header" style={{ textAlign: 'center' }}>
          <span className="wml-consent-badge" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px', borderRadius: '4px', background: '#1f2937', color: '#f3f4f6' }}>
            {t.consentBadge}
          </span>
          <h1 className="wml-consent-heading" style={{ fontSize: '24px', fontWeight: 700, marginTop: '14px', marginBottom: '8px', lineHeight: 1.2, color: '#ffffff' }}>
            {t.consentHeading}
          </h1>
          <p className="wml-consent-lead" style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.5 }}>
            {t.consentLead}
          </p>
        </div>

        {/* Módulo Informativo */}
        <div className="wml-consent-info" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#ffffff' }}>{t.consentInfoTitle}</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
            {t.consentBullets.map((item, index) => (
              <li key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: '#eaebd5', lineHeight: 1.4 }}>
                <IcoBulletCheck />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Selector rápido */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <span style={{ color: '#6b7280' }}>Revisión de requerimientos</span>
          {!canProceed && (
            <button 
              type="button" 
              onClick={handleAcceptAllToggles}
              style={{ background: 'none', border: 'none', color: '#00f0ff', fontWeight: 500, cursor: 'pointer', fontSize: '13px', padding: 0 }}
            >
              Aceptar todos
            </button>
          )}
        </div>

        {/* Check-Cards */}
        <div className="wml-consent-checks" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <label style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', borderRadius: '10px', border: `1px solid ${age ? '#00f0ff' : 'rgba(255,255,255,0.1)'}`, background: age ? 'rgba(0,240,255,0.03)' : 'transparent', cursor: 'pointer' }}>
            <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#00f0ff' }} />
            <span style={{ fontSize: '13px', color: '#ffffff' }}>{t.consentAge}</span>
          </label>

          <label style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', borderRadius: '10px', border: `1px solid ${voluntary ? '#00f0ff' : 'rgba(255,255,255,0.1)'}`, background: voluntary ? 'rgba(0,240,255,0.03)' : 'transparent', cursor: 'pointer' }}>
            <input type="checkbox" checked={voluntary} onChange={(e) => setVoluntary(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#00f0ff' }} />
            <span style={{ fontSize: '13px', color: '#ffffff' }}>{t.consentVoluntary}</span>
          </label>

          <label style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', borderRadius: '10px', border: `1px solid ${terms ? '#00f0ff' : 'rgba(255,255,255,0.1)'}`, background: terms ? 'rgba(0,240,255,0.03)' : 'transparent', cursor: 'pointer' }}>
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#00f0ff', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#ffffff', lineHeight: 1.4 }} onClick={(e) => (e.target as HTMLElement).tagName === 'A' && e.stopPropagation()}>
              {t.consentTermsPrefix}{' '}
              <Link href="/legal/terminos" target="_blank" style={{ color: '#00f0ff', textDecoration: 'underline' }}>{t.terms}</Link>
              {' '}/{' '}
              <Link href="/legal/etica" target="_blank" style={{ color: '#00f0ff', textDecoration: 'underline' }}>{t.ethicsFramework}</Link>.
            </span>
          </label>

          <label style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', borderRadius: '10px', border: `1px solid ${privacy ? '#00f0ff' : 'rgba(255,255,255,0.1)'}`, background: privacy ? 'rgba(0,240,255,0.03)' : 'transparent', cursor: 'pointer' }}>
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#00f0ff', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#ffffff', lineHeight: 1.4 }} onClick={(e) => (e.target as HTMLElement).tagName === 'A' && e.stopPropagation()}>
              {t.consentPrivacyPrefix}{' '}
              <Link href="/legal/privacidad" target="_blank" style={{ color: '#00f0ff', textDecoration: 'underline' }}>{t.privacyPolicy}</Link>
              {' '}/{' '}
              <Link href="/legal/cookies" target="_blank" style={{ color: '#00f0ff', textDecoration: 'underline' }}>{t.cookiesPolicy}</Link>.
            </span>
          </label>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* 
          BOTÓN CORREGIDO: 
          Forzamos estilos inline estrictos para contrastar perfectamente sobre el fondo negro.
        */}
        <button
          type="button"
          disabled={!canProceed}
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '15px',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            border: 'none',
            // Intercambio dinámico de colores visibles:
            backgroundColor: canProceed ? '#ffffff' : '#27272a', 
            color: canProceed ? '#000000' : '#71717a',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {t.acceptAndJoin}
        </button>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#6b7280', lineHeight: 1.4 }}>
          {t.dataController} / <Link href="/legal/aviso-legal" style={{ textDecoration: 'underline', color: '#9ca3af' }}>{t.legalNotice}</Link>
        </p>
      </div>
    </div>
  )
}

export default function ConsentPage() {
  const locale = useLocale()
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>{wmlCopy[locale].loadingExperiment}</div>}>
      <ConsentForm />
    </Suspense>
  )
}