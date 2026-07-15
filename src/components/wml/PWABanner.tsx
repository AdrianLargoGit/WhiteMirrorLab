'use client'

import { useState, useEffect, type ReactNode } from 'react'

// Icono de Compartir de iOS (Caja con flecha hacia arriba)
const IcoShareiOS = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', color: '#3b82f6' }}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

// Icono de Opciones de Android / Chrome (Tres puntos verticales)
const IcoMenuAndroid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', color: '#71717a' }}>
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
)

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false)
  const [device, setDevice] = useState<'ios' | 'android' | null>(null)
  const [lang] = useState<'es' | 'en'>(() =>
    typeof window !== 'undefined' && window.location.href.includes('/en/wml-1-0/')
      ? 'en'
      : 'es'
  )

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('wml_pwa_dismissed')
    
    // Detectar si ya está ejecutándose como app instalada
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      navigatorWithStandalone.standalone === true

    if (!hasSeenPrompt && !isStandalone) {
      const ua = navigator.userAgent.toLowerCase()
      
      // Filtro estricto solo para móviles
      if (/iphone|ipad|ipod/.test(ua)) {
        setTimeout(() => {
          setDevice('ios')
          setVisible(true)
        }, 0)
      } else if (/android/.test(ua)) {
        setTimeout(() => {
          setDevice('android')
          setVisible(true)
        }, 0)
      }
    }
  }, [])

  const handleDismissPermanently = () => {
    localStorage.setItem('wml_pwa_dismissed', 'true')
    setVisible(false)
  }

  if (!visible || !device) return null

  // Textos e instrucciones según el idioma detectado
  const contentByLang: Record<'es' | 'en', {
    header: string
    title: string
    desc: string
    btn: string
    iosSteps: ReactNode[]
    androidSteps: ReactNode[]
  }> = {
    es: {
      header: 'WML 1.0 // Acceso rápido',
      title: 'Instalar en tu pantalla de inicio',
      desc: 'Añade la aplicación a tu escritorio para entrar directamente cuando quieras de forma más cómoda.',
      btn: 'Entendido, continuar en navegador',
      iosSteps: [
        <>Toca el botón de abajo de <strong>Compartir</strong> <IcoShareiOS />.</>,
        <>Selecciona la opción <strong style={{ color: '#fff' }}>&quot;Añadir a la pantalla de inicio&quot;</strong>.</>
      ],
      androidSteps: [
        <>Toca los tres puntos de arriba <IcoMenuAndroid />.</>,
        <>Selecciona la opción <strong style={{ color: '#fff' }}>&quot;Añadir a la pantalla de inicio&quot;</strong> o &quot;Instalar app&quot;.</>
      ]
    },
    en: {
      header: 'WML 1.0 // Quick Access',
      title: 'Add to Home Screen',
      desc: 'Add the application to your home screen to access it directly and more conveniently whenever you want.',
      btn: 'Understood, continue in browser',
      iosSteps: [
        <>Tap the <strong>Share</strong> button below <IcoShareiOS />.</>,
        <>Select the <strong style={{ color: '#fff' }}>&quot;Add to Home Screen&quot;</strong> option.</>
      ],
      androidSteps: [
        <>Tap the three dots above <IcoMenuAndroid />.</>,
        <>Select <strong style={{ color: '#fff' }}>&quot;Add to Home Screen&quot;</strong> or &quot;Install app&quot;.</>
      ]
    }
  }
  const content = contentByLang[lang]

  return (
    <div 
      onClick={handleDismissPermanently} // Cierra al pulsar fuera
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} // Evita cierre al pulsar dentro
        style={{
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '360px',
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
          fontFamily: 'var(--w-font-mono, monospace)',
        }}
      >
        {/* Cabecera del Sistema */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--w-accent, #3b82f6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--w-accent, #3b82f6)', borderRadius: '50%' }} />
          {content.header}
        </div>

        {/* Títulos */}
        <h3 style={{ fontSize: '16px', fontWeight: 500, marginTop: '10px', marginBottom: '6px', color: '#fff' }}>
          {content.title}
        </h3>
        <p style={{ fontSize: '12px', color: '#71717a', marginBottom: '20px', lineHeight: '1.4' }}>
          {content.desc}
        </p>

        {/* Lista de pasos optimizada sin redirección de navegador */}
        <div style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: '1.8', backgroundColor: '#040406', padding: '16px', borderRadius: '8px', border: '1px solid #1c1c1e' }}>
          <ol style={{ paddingLeft: '18px', margin: 0 }}>
            {device === 'ios' 
              ? content.iosSteps.map((step, idx) => <li key={idx}>{step}</li>)
              : content.androidSteps.map((step, idx) => <li key={idx}>{step}</li>)
            }
          </ol>
        </div>

        {/* Botón de cierre definitivo */}
        <button
          onClick={handleDismissPermanently}
          style={{
            marginTop: '20px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {content.btn}
        </button>
      </div>
    </div>
  )
}
