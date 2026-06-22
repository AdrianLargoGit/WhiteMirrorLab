'use client'

import { useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { captureEvent } from '@/lib/posthog'
import { wmlProfilePath } from '@/lib/i18n'

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

export default function ShareProfileButton({
  username,
  displayName,
}: {
  username: string
  displayName: string
}) {
  const [copied, setCopied] = useState(false)
  const locale = useLocale()
  const isEnglish = locale === 'en'

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}${wmlProfilePath(locale, username)}`
    const shareData = {
      title: isEnglish ? `Vote for ${displayName} on WML` : `Vota por ${displayName} en WML`,
      text: isEnglish
        ? 'Visit my profile and support me with a positive vote.'
        : 'Entra en mi perfil y apoyame con un voto positivo.',
      url: profileUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        captureEvent('profile_shared', { channel: 'native' })
      } catch {
        // Closing the native share sheet is not an application error.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      captureEvent('profile_shared', { channel: 'clipboard' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className="wml-btn wml-btn-ghost"
      onClick={handleShare}
      style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, display: 'flex', gap: 6, alignItems: 'center' }}
    >
      <ShareIcon />
      {copied ? (isEnglish ? 'Copied' : 'Copiado') : (isEnglish ? 'Share' : 'Compartir')}
    </button>
  )
}
