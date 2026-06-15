'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Estados de las cookies
  const [analyticsConsent, setAnalyticsConsent] = useState(true)

  // Comprobar si ya aceptó las cookies anteriormente
  useEffect(() => {
    const hasConsent = localStorage.getItem('wml_cookie_consent')
    if (!hasConsent) {
      setIsVisible(true)
    }
  }, [])

  // Función para guardar el consentimiento
  const saveConsent = (allAccepted: boolean) => {
    const consentObj = {
      essential: true,
      analytics: allAccepted ? true : analyticsConsent,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('wml_cookie_consent', JSON.stringify(consentObj))
    
    // Aquí puedes inicializar tus scripts de Analytics si analytics es true
    if (consentObj.analytics) {
      // window.gtag(...) o tu sistema de analíticas
    }

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
      backgroundColor: '#121214', // Fondo gris oscuro premium
      border: '1px solid #27272a',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
      padding: '20px',
      zIndex: 999999, // Por encima de todo, incluso del chat o menús
      margin: '0 auto', // Centrado en móviles automáticamente
    }}>
      
      {/* Título y Texto Principal */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
            <path d="M8.5 14.5A1.5 1.5 0 1 1 7 13a1.5 1.5 0 0 1 1.5 1.5Z" />
            <path d="M16.5 15.5A1.5 1.5 0 1 1 15 14a1.5 1.5 0 0 1 1.5 1.5Z" />
          </svg>
          Aviso de Cookies
        </h3>
        <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5', margin: 0 }}>
          Utilizamos cookies para garantizar el funcionamiento básico de la plataforma y mejorar tu experiencia de simulación. Puedes personalizar tus opciones en cualquier momento.
        </p>
      </div>

      {/* Panel de Configuración Avanzada (Se despliega al pulsar "Configurar") */}
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
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>Esenciales y Seguridad</div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>Necesarias para iniciar sesión y proteger tu cuenta.</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>Obligatorias</span>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #1f2937', margin: 0 }} />

          {/* Analíticas */}
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>Métricas y Rendimiento</div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>Nos ayudan de forma anónima a saber qué funciones usas más.</div>
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
            backgroundColor: '#ffffff', // Forzado blanco brillante
            color: '#000000', // Texto negro absoluto
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Aceptar todas
        </button>

        {/* Fila de acciones secundarias */}
        <div style={{ display: 'flex', gap: '8px' }}>
          
          {/* Botón: Configurar / Guardar Selección */}
          <button
            type="button"
            onClick={() => {
              if (showSettings) {
                saveConsent(false) // Guarda lo que haya seleccionado
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
            {showSettings ? 'Guardar configuración' : 'Configurar'}
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
              Solo esenciales
            </button>
          )}
        </div>

      </div>
    </div>
  )
}