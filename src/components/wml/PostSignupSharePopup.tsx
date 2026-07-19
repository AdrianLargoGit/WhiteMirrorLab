'use client'

import { useMemo, useState } from 'react'
import { publicProfilePath, type Locale } from '@/lib/i18n'
import { captureEvent } from '@/lib/posthog'
import styles from './PostSignupSharePopup.module.css'

type Props = {
  username: string
  locale: Locale
  onClose: () => void
}

export default function PostSignupSharePopup({ username, locale, onClose }: Props) {
  const isEnglish = locale === 'en'
  const [copied, setCopied] = useState(false)
  const profileUrl = useMemo(() => {
    if (typeof window === 'undefined') return publicProfilePath(locale, username)
    return `${window.location.origin}${publicProfilePath(locale, username)}`
  }, [locale, username])

  const shareText = isEnglish
    ? 'Vote for me on WML. Help me get my first 5 votes.'
    : 'Votame en WML. Ayudame a conseguir mis primeros 5 votos.'

  const copyLink = async (channel: string) => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      captureEvent('profile_shared', { channel })
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const openShareUrl = (channel: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    void copyLink(channel)
  }

  const encodedText = encodeURIComponent(`${shareText} ${profileUrl}`)

  return (
    <div role="dialog" aria-modal="true" className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <div className={styles.logo}>
              <span className={styles.dot} />
              WML 1.0
            </div>
            <h2 className={styles.title}>
              {isEnglish
                ? 'Share your profile and get your first 5 votes'
                : 'Comparte tu perfil y consigue tus primeros 5 votos'}
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label={isEnglish ? 'Close' : 'Cerrar'}>
            x
          </button>
        </div>

        <p className={styles.sub}>
          {isEnglish
            ? 'Send your public profile now while the account is fresh. The faster people open it, the faster your first votes arrive.'
            : 'Envia ahora tu perfil publico mientras la cuenta esta recien creada. Cuanto antes lo abran, antes llegan tus primeros votos.'}
        </p>

        <span className={styles.linkBox}>{profileUrl}</span>

        <div className={styles.grid}>
          <button
            type="button"
            className={styles.button}
            onClick={() => openShareUrl('whatsapp', `https://wa.me/?text=${encodedText}`)}
          >
            WhatsApp
          </button>
          <button type="button" className={`${styles.button} ${copied ? styles.copied : ''}`} onClick={() => copyLink('clipboard')}>
            {copied ? (isEnglish ? 'Copied' : 'Copiado') : (isEnglish ? 'Copy link' : 'Copiar enlace')}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => openShareUrl('instagram_story', 'https://www.instagram.com/')}
          >
            Instagram story
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => openShareUrl('x', `https://twitter.com/intent/tweet?text=${encodedText}`)}
          >
            X
          </button>
        </div>
      </div>
    </div>
  )
}
