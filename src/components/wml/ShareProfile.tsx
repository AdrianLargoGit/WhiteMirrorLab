'use client'

import { useState } from 'react'
import {
  copyToClipboard,
  getPublicProfileUrl,
  getShareMessage,
  getWhatsAppShareUrl,
} from '@/lib/share'
import { captureEvent } from '@/lib/analytics'
import type { PublicProfile } from '@/lib/types'

interface ShareProfileProps {
  profile: PublicProfile
}

export function ShareProfile({ profile }: ShareProfileProps) {
  const [copied, setCopied] = useState(false)

  const url = getPublicProfileUrl(profile.username)
  const message = getShareMessage(profile.display_name, profile.username, profile.karma_score)
  const whatsappUrl = getWhatsAppShareUrl(message, url)

  const handleCopy = async () => {
    const ok = await copyToClipboard(`${message}\n${url}`)
    if (ok) {
      setCopied(true)
      captureEvent('profile_link_copied', { username: profile.username })
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleWhatsApp = () => {
    captureEvent('profile_shared_whatsapp', { username: profile.username })
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleInstagram = async () => {
    await copyToClipboard(url)
    setCopied(true)
    captureEvent('profile_shared_instagram', { username: profile.username })
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="wml-share-card">
      <div className="wml-section-title">Comparte tu perfil</div>
      <p className="wml-share-desc">
        Pide votos anónimos. Quien abra tu enlace puede votarte tras unirse al experimento.
      </p>

      <div className="wml-share-preview">
        <span className="wml-share-preview-label">Tu enlace</span>
        <code className="wml-share-url">{url.replace(/^https?:\/\//, '')}</code>
      </div>

      <div className="wml-share-btns">
        <button type="button" className="wml-share-btn wml-share-btn-wa" onClick={handleWhatsApp}>
          <span className="wml-share-btn-icon" aria-hidden="true">WA</span>
          WhatsApp
        </button>
        <button type="button" className="wml-share-btn wml-share-btn-ig" onClick={handleInstagram}>
          <span className="wml-share-btn-icon" aria-hidden="true">IG</span>
          Instagram
        </button>
        <button type="button" className="wml-share-btn wml-share-btn-copy" onClick={handleCopy}>
          <span className="wml-share-btn-icon" aria-hidden="true">⎘</span>
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>

      <p className="wml-share-hint">
        Instagram: copiamos el enlace — pégalo en tu historia o bio.
      </p>
    </div>
  )
}
