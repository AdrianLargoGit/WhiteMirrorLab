'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'

// Diccionario de textos en Español e Inglés
const translations = {
  es: {
    title: 'Aviso de Cookies',
    description: 'Utilizamos cookies para garantizar el funcionamiento básico de la plataforma y mejorar tu experiencia de simulación. Puedes personalizar tus opciones en cualquier momento.',
    essentialTitle: 'Esenciales y Seguridad',
    essentialDesc: 'Necesarias para iniciar sesión y proteger tu cuenta.',
    required: 'Obligatorias',
    analyticsTitle: 'Métricas y Rendimiento',
    analyticsDesc: 'Nos ayudan de forma anónima a saber qué funciones usas más.',
    acceptAll: 'Aceptar todas',
    configure: 'Configurar',
    saveSettings: 'Guardar configuración',
    onlyEssential: 'Solo esenciales'
  },
  en: {
    title: 'Cookie Notice',
    description: 'We use cookies to ensure the basic functionality of the platform and improve your simulation experience. You can customize your choices at any time.',
    essentialTitle: 'Essential & Security',
    essentialDesc: 'Required to log in and secure your account.',
    required: 'Required',
    analyticsTitle: 'Metrics & Performance',
    analyticsDesc: 'They anonymously help us know which features you use the most.',
    acceptAll: 'Accept all',
    configure: 'Configure',
    saveSettings: 'Save settings',
    onlyEssential: 'Only essential'
  }
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [analyticsConsent, setAnalyticsConsent] = useState(true)

  // Detectamos el idioma actual ('en', o por defecto 'es')
  const locale = useLocale()
  const t = translations[locale as keyof typeof translations] || translations.es

  useEffect(() => {
    const hasConsent = localStorage.getItem('wml_cookie_consent')
    if (!hasConsent) {
      setIsVisible(true)
    }
  }, [])

  const saveConsent = (allAccepted: boolean) => {
    const consentObj = {
      essential: true,
      analytics: allAccepted ? true : analyticsConsent,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('wml_cookie_consent', JSON.stringify(consentObj))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      left: '24px',
      maxWidth: '420px',
      backgroundColor: '#121214',
      border: '1px solid #27272a',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
      padding: '20px',
      zIndex: 999999,
      margin: '0 auto',
    }}>
      
      {/* Título y Texto Principal */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 14.5A1.5 1.5 0 1 1 7 13a1.5 1.5 0 0 1 1.5 1.5Z" />
            <path d="M16.5 15.5A1.5 1.5 0 1 1 15 14a1.5 1.5 0 0 1 1.5 1.5Z" />
          </svg>
          {t.title}
        </h3>
        <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5', margin: 0 }}>
          {t.description}
        </p>
      </div>

      {/* Panel de Configuración Avanzada */}
      {showSettings && (
        <div style={{ 
          backgroundColor: '#09090b', 
          padding: '12px', 
          borderRadius: '10px', 
          border: '1px solid #1f2937',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* Esenciales */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{t.essentialTitle}</div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>{t.essentialDesc}</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
              {t.required}
            </span>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #1f2937', margin: 0 }} />

          {/* Analíticas */}
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{t.analyticsTitle}</div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>{t.analyticsDesc}</div>
            </div>
            <input 
              type="checkbox" 
              checked={analyticsConsent} 
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#00f0ff', cursor: 'pointer' }}
            />
          </label>
        </div>
      )}

      {/* Botones de Acción */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Botón Principal: Aceptar Todas */}
        <button
          type="button"
          onClick={() => saveConsent(true)}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {t.acceptAll}
        </button>

        {/* Fila de acciones secundarias */}
        <div style={{ display: 'flex', gap: '8px' }}>
          
          {/* Botón: Configurar / Guardar Selección */}
          <button
            type="button"
            onClick={() => {
              if (showSettings) {
                saveConsent(false)
              } else {
                setShowSettings(true)
              }
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '12px',
              backgroundColor: 'transparent',
              color: showSettings ? '#00f0ff' : '#e4e4e7',
              border: `1px solid ${showSettings ? '#00f0ff' : '#27272a'}`,
              cursor: 'pointer',
            }}
          >
            {showSettings ? t.saveSettings : t.configure}
          </button>

          {/* Botón rápido: Solo esenciales */}
          {!showSettings && (
            <button
              type="button"
              onClick={() => {
                setAnalyticsConsent(false)
                saveConsent(false)
              }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '12px',
                backgroundColor: 'transparent',
                color: '#a1a1aa',
                border: '1px solid #27272a',
                cursor: 'pointer',
              }}
            >
              {t.onlyEssential}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}