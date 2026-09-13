'use client'

import Link from 'next/link'
import { downloadPath, wmlPath, type Locale } from '@/lib/i18n'
import styles from './PublicProfileActions.module.css'

type PublicProfile = {
  username: string
}

export default function PublicProfileActions({
  locale,
}: {
  profile: PublicProfile
  locale: Locale
}) {
  const isEnglish = locale === 'en'

  return (
    <div className={styles.votePanel}>
      <div className={styles.votePanelHeader}>
        <span>{isEnglish ? 'Closed archive' : 'Archivo cerrado'}</span>
        <span className={styles.live}>WML 1.0</span>
      </div>

      <p className={styles.voteCallout}>
        {isEnglish
          ? 'This public profile belongs to the previous stage. '
          : 'Este perfil público pertenece a la etapa anterior. '}
        <span>{isEnglish ? 'The active experiment is WML X.X.0.' : 'El experimento activo es WML X.X.0.'}</span>
      </p>

      <div className={styles.voteGrid}>
        <Link className={styles.voteButton} href={wmlPath(locale)}>
          <span className={styles.voteIcon}>1.0</span>
          <span className={styles.voteCopy}>
            <span className={styles.voteTitle}>{isEnglish ? 'Results archive' : 'Archivo de resultados'}</span>
            <span className={styles.voteHint}>{isEnglish ? 'previous stage' : 'etapa anterior'}</span>
          </span>
        </Link>
        <Link className={styles.voteButton} href={downloadPath(locale)}>
          <span className={styles.voteIcon}>X</span>
          <span className={styles.voteCopy}>
            <span className={styles.voteTitle}>WML X.X.0</span>
            <span className={styles.voteHint}>{isEnglish ? 'active experiment' : 'experimento activo'}</span>
          </span>
        </Link>
      </div>
    </div>
  )
}
