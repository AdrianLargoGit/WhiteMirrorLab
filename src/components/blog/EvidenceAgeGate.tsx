'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './EvidenceAgeGate.module.css'

type EvidenceAgeGateProps = {
  href: string
  className: string
  label: string
  pcRecommendation: string
  children: ReactNode
}

export function EvidenceAgeGate({ href, className, label, pcRecommendation, children }: EvidenceAgeGateProps) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const gatedHref = `${href}${href.includes('?') ? '&' : '?'}age_confirmed=1`

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const previousPosition = document.body.style.position
    const previousTop = document.body.style.top
    const previousWidth = document.body.style.width
    const scrollY = window.scrollY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.body.style.position = previousPosition
      document.body.style.top = previousTop
      document.body.style.width = previousWidth
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const continueToPayment = () => {
    if (!confirmed) return
    window.location.assign(gatedHref)
  }

  const modal = open ? (
    <div className={styles.backdrop} role="presentation" onClick={() => setOpen(false)}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-age-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.kicker}>Acceso restringido</div>
        <h2 id="evidence-age-title">Contenido documental +18</h2>
        <p>
          Este dossier contiene material real de casos criminales: fuentes publicas, escenas,
          victimas, sospechosos y posibles imagenes sensibles veladas por defecto.
        </p>
        <p className={styles.pcNotice}>{pcRecommendation}</p>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          <span>{label}</span>
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={!confirmed}
            onClick={continueToPayment}
          >
            Continuar al pago
          </button>
        </div>
      </section>
    </div>
  ) : null

  return (
    <>
      <button type="button" className={`${className} ${styles.trigger}`} onClick={() => setOpen(true)}>
        {children}
      </button>

      {modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  )
}
