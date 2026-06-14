'use client'

import { useState } from 'react'

const ICO_SHARE = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
)

export default function ShareProfileButton({ 
  username, 
  displayName 
}: { 
  username: string
  displayName: string 
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/web/profile/${username}`
    const shareTitle = `¡Vota por ${displayName} en WML!`
    const shareText = `¡Entra a mi perfil y apóyame con un voto positivo! 🚀`

    // Intenta abrir el menú nativo (iOS/Android)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: profileUrl,
        })
      } catch (error) {
        console.log('Interacción cancelada o error', error)
      }
    } else {
      // Si no hay menú nativo (PC), copia al portapapeles
      try {
        await navigator.clipboard.writeText(profileUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Error al copiar', err)
      }
    }
  }

  return (
    <button 
      className="wml-btn wml-btn-ghost" 
      onClick={handleShare}
      style={{ padding: '6px 12px', fontSize: 12, borderRadius: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}
    >
      <ICO_SHARE /> {copied ? '¡Copiado!' : 'Compartir'}
    </button>
  )
}