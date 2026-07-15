'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocale } from '@/hooks/useLocale'
import { LOCALE_COOKIE, wmlPath } from '@/lib/i18n'
import { createClient } from '@/lib/supabase'

// Estructura limpia de Iconos Vectoriales
const IcoTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
const IcoGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const IcoAlert = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

export default function ConfigurationPage() {
  const { userId, loading: authLoading } = useCurrentUser()
  const locale = useLocale()
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const username = params?.username || ''

  // Estados
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const texts = {
    es: {
      title: 'CONFIGURACIÓN',
      langTitle: 'IDIOMA DE LA INTERFAZ',
      langDesc: 'Selecciona el idioma. Solo se cambiará para esta sesión.',
      dangerZone: 'ZONA DE PELIGRO',
      deleteTitle: 'Eliminar cuenta definitivamente',
      deleteDesc: 'Esta acción es irreversible. Se purgarán tu perfil, imágenes, historias y registros de actividad de forma permanente.',
      deleteBtn: 'ELIMINAR MI CUENTA',
      modalTitle: 'CONFIRMAR ELIMINACIÓN',
      modalInstructions: 'Para confirmar la destrucción, escribe "ELIMINAR" en el campo inferior:',
      modalPlaceholder: 'Escribe ELIMINAR',
      cancel: 'CANCELAR',
      confirm: 'CONFIRMAR BORRADO',
    },
    en: {
      title: 'CONFIGURATION',
      langTitle: 'INTERFACE LANGUAGE',
      langDesc: 'Select the language. It will only change for this session.',
      dangerZone: 'DANGER ZONE',
      deleteTitle: 'Permanently delete account',
      deleteDesc: 'This action is irreversible. Your profile, images, stories, and activity records will be permanently purged.',
      deleteBtn: 'DELETE MY ACCOUNT',
      modalTitle: 'CONFIRM DELETION',
      modalInstructions: 'To confirm the destruction, type "DELETE" in the field below:',
      modalPlaceholder: 'Type DELETE',
      cancel: 'CANCEL',
      confirm: 'CONFIRM DELETION',
    }
  }[locale === 'es' ? 'es' : 'en']

  // Manejar cambio de idioma con enrutamiento personalizado estricto
  const handleLanguageChange = (newLang: 'es' | 'en') => {
    if (newLang === locale) return
    document.cookie = `${LOCALE_COOKIE}=${newLang}; path=/; max-age=31536000; samesite=lax`
    
    // Generación de rutas absolutas bajo la nueva estructura especificada
    const destPath = newLang === 'en'
      ? `/en/wml-1-0/profile/${username}/configuration`
      : `/web/profile/${username}/configuration`
    
    router.push(destPath)
  }

  const handleDeleteAccount = async () => {
    const requiredWord = locale === 'es' ? 'ELIMINAR' : 'DELETE'
    if (confirmText !== requiredWord) return

    setIsDeleting(true)
    setErrorMsg('')

    try {
      const { error } = await supabase.rpc('delete_user_account')
      if (error) throw error

      await supabase.auth.signOut()
      router.push(wmlPath(locale, '/auth'))
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      setErrorMsg(err instanceof Error ? err.message : 'Error processing request.')
      setIsDeleting(false)
    }
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50dvh' }}>
        <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
          {locale === 'es' ? 'CARGANDO...' : 'LOADING...'}
        </span>
      </div>
    )
  }

  if (!userId) {
    router.replace(wmlPath(locale, '/auth'))
    return null
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px 80px 16px', boxSizing: 'border-box' }}>
      
      {/* Título unificado con el ecosistema visual */}
      <h1 style={{ fontFamily: 'var(--w-font-mono)', fontSize: 13, letterSpacing: '0.15em', color: 'var(--w-white)', marginBottom: 40, marginTop: 0 }}>
        {texts.title}
      </h1>

      {errorMsg && (
        <div className="wml-error-msg" style={{ marginBottom: 24, fontSize: 12, fontFamily: 'var(--w-font-mono)' }}>
          {errorMsg}
        </div>
      )}

      {/* ── SECCIÓN: IDIOMA ── */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--w-muted)' }}>
          <IcoGlobe />
          <h2 style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, letterSpacing: '0.08em', margin: 0, color: 'var(--w-muted-text, #a1a1aa)' }}>
            {texts.langTitle}
          </h2>
        </div>
        <p style={{ fontFamily: 'var(--w-font-body)', fontSize: 13, color: 'var(--w-muted)', marginTop: 0, marginBottom: 20, lineHeight: 1.5 }}>
          {texts.langDesc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => handleLanguageChange('es')}
            className={`wml-btn ${locale === 'es' ? 'wml-btn-primary' : ''}`}
            style={{ 
              height: 40,
              fontSize: 11, 
              fontFamily: 'var(--w-font-mono)', 
              letterSpacing: '0.05em',
              background: locale === 'es' ? 'var(--w-accent)' : 'var(--w-surface)',
              color: locale === 'es' ? '#000' : 'var(--w-text)',
              border: locale === 'es' ? 'none' : '1px solid var(--w-border)'
            }}
          >
            ESPAÑOL
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`wml-btn ${locale === 'en' ? 'wml-btn-primary' : ''}`}
            style={{ 
              height: 40,
              fontSize: 11, 
              fontFamily: 'var(--w-font-mono)', 
              letterSpacing: '0.05em',
              background: locale === 'en' ? 'var(--w-accent)' : 'var(--w-surface)',
              color: locale === 'en' ? '#000' : 'var(--w-text)',
              border: locale === 'en' ? 'none' : '1px solid var(--w-border)'
            }}
          >
            ENGLISH
          </button>
        </div>
      </section>

      {/* ── SECCIÓN: ZONA DE PELIGRO ── */}
      <section style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: 24, borderRadius: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center' }}><IcoAlert /></span>
          <h2 style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, letterSpacing: '0.12em', color: '#ef4444', margin: 0 }}>
            {texts.dangerZone}
          </h2>
        </div>
        
        <h3 style={{ fontFamily: 'var(--w-font-body)', fontSize: 13, fontWeight: 600, color: 'var(--w-white)', margin: '0 0 6px 0' }}>
          {texts.deleteTitle}
        </h3>
        <p style={{ fontFamily: 'var(--w-font-body)', fontSize: 12, color: 'var(--w-muted)', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          {texts.deleteDesc}
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="wml-btn"
          style={{
            width: '100%',
            height: 42,
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            fontFamily: 'var(--w-font-mono)',
            fontSize: 11,
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
            e.currentTarget.style.borderColor = '#ef4444'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
          }}
        >
          <IcoTrash />
          {texts.deleteBtn}
        </button>
      </section>

      {/* ── MODAL DE CONFIRMACIÓN BRUTALISTA ── */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16
        }}>
          <div style={{
            background: 'var(--w-surface, #141417)', border: '1px solid var(--w-border)',
            maxWidth: 400, width: '100%', padding: 24, boxSizing: 'border-box', position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', marginBottom: 12 }}>
              <IcoAlert />
              <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700 }}>
                {texts.modalTitle}
              </span>
            </div>
            
            <p style={{ fontFamily: 'var(--w-font-body)', fontSize: 13, color: 'var(--w-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {texts.modalInstructions}
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={texts.modalPlaceholder}
              disabled={isDeleting}
              className="wml-input"
              style={{
                width: '100%', padding: '10px 12px', background: 'var(--w-surface-2, #1c1c21)',
                border: '1px solid var(--w-border)', color: 'var(--w-white)', outline: 'none',
                fontFamily: 'var(--w-font-mono)', fontSize: 12, marginBottom: 20, boxSizing: 'border-box',
                borderRadius: 0
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                disabled={isDeleting}
                onClick={() => { setShowDeleteModal(false); setConfirmText('') }}
                className="wml-btn"
                style={{
                  height: 38, border: '1px solid var(--w-border)', background: 'transparent',
                  color: 'var(--w-muted)', fontFamily: 'var(--w-font-mono)', fontSize: 10, letterSpacing: '0.05em'
                }}
              >
                {texts.cancel}
              </button>
              <button
                disabled={isDeleting || confirmText !== (locale === 'es' ? 'ELIMINAR' : 'DELETE')}
                onClick={handleDeleteAccount}
                className="wml-btn"
                style={{
                  height: 38, border: 'none',
                  background: confirmText === (locale === 'es' ? 'ELIMINAR' : 'DELETE') ? '#ef4444' : 'var(--w-surface-2, #27272a)',
                  color: confirmText === (locale === 'es' ? 'ELIMINAR' : 'DELETE') ? '#fff' : 'var(--w-muted)',
                  fontFamily: 'var(--w-font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                  cursor: confirmText === (locale === 'es' ? 'ELIMINAR' : 'DELETE') ? 'pointer' : 'not-allowed'
                }}
              >
                {isDeleting ? '...' : texts.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
