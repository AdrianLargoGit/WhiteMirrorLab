'use client'

import { useEffect, useRef, useState } from 'react'
import type { Story, Profile } from '@/lib/database.types'
import { AvatarMini } from './AppShell'
import SpainWorldCupBadge from './SpainWorldCupBadge'

type StoryWithProfile = Story & {
  profile: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'display_name' | 'country'>
}

const DURATION_MS = 5000

interface Props {
  story: StoryWithProfile
  onClose: () => void
  onCompleted?: () => void
}

export default function StoryViewer({ story, onClose, onCompleted }: Props) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number>(0)
  const rafRef   = useRef<number>(0)

  useEffect(() => {
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct     = Math.min((elapsed / DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onCompleted?.()
        onClose()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onClose, onCompleted])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div 
      className="wml-story-viewer" 
      onClick={onClose}
      style={{
        width: '100%',
        height: 'calc(100vh - 64px)', // Se ajusta al espacio disponible bajo tu Navbar
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fondo oscuro para centrar la atención
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="wml-story-viewer-inner" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px', // Ancho máximo idéntico a un smartphone en PC
          aspectRatio: '9/16', // Fuerza la proporción vertical clásica de Instagram/TikTok
          maxHeight: '100%', // Evita que desborde verticalmente en pantallas pequeñas
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Progress bar */}
        <div 
          className="wml-story-progress"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          <div 
            className="wml-story-progress-fill" 
            style={{ 
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#fff',
              transition: 'width 40ms linear'
            }} 
          />
        </div>

        {/* Close Button */}
        <button 
          className="wml-story-close" 
          onClick={onClose} 
          aria-label="Cerrar historia"
          style={{
            position: 'absolute',
            top: '24px',
            right: '16px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6"  y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Media (La foto adaptada perfectamente a la tarjeta) */}
        <img 
          src={story.media_url} 
          alt="Historia" 
          className="wml-story-media" 
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Cambiado a 'cover' para que llene el marco del "móvil" de forma nativa
            display: 'block'
          }}
        />

        {/* Author overlay */}
        <div 
          className="wml-story-viewer-info"
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '20px 16px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10
          }}
        >
          <AvatarMini profile={story.profile} size={32} />
          <div>
            <div style={{ fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 13, color: 'var(--w-white)' }}>
              {story.profile.display_name}
              <SpainWorldCupBadge country={story.profile.country} />
            </div>
            <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, color: 'rgba(240,237,232,0.5)', letterSpacing: '0.06em' }}>
              @{story.profile.username}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
