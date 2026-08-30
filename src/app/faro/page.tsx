'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'

type FaroState = {
  dateKey: string
  message: string
  status: 'default' | 'pending' | 'live'
  canSubmit: boolean
  canAccessForm: boolean
  isAdmin: boolean
}

const copy = {
  es: {
    loading: 'Encendiendo FARO...',
    eyebrow: 'FARO',
    defaultStatus: 'Mensaje por defecto',
    pendingStatus: 'Mensaje recibido. Se enciende a las 20:00.',
    liveStatus: 'Mensaje del dia',
    formTitle: 'Tu frase para hoy',
    adminTitle: 'Editar FARO',
    textarea: 'Escribe aqui',
    hint: 'Maximo 240 caracteres. Sin enlaces, menciones, amenazas ni insultos evidentes.',
    submit: 'Subir frase',
    adminSubmit: 'Actualizar frase',
    sending: 'Subiendo...',
    success: 'Frase guardada. FARO se actualizara a las 20:00.',
    adminSuccess: 'FARO actualizado.',
    closed: 'La frase de hoy ya esta cerrada.',
    error: 'No se ha podido guardar la frase.',
    counter: 'caracteres',
    signupTitle: 'Quieres escribir FARO algun dia?',
    signupLead: 'Deja tu correo y entrarás en la lista desde la que elegimos a una persona al dia.',
    signupPlaceholder: 'tu@email.com',
    signupButton: 'Apuntarme',
    signupSending: 'Guardando...',
    signupSuccess: 'Correo guardado. FARO podria mirarte otro dia.',
    signupError: 'No hemos podido guardar tu correo.',
    signupInvalid: 'Introduce un email valido.',
  },
  en: {
    loading: 'Lighting FARO...',
    eyebrow: 'FARO',
    defaultStatus: 'Default message',
    pendingStatus: 'Message received. It lights up at 20:00 Spain time.',
    liveStatus: 'Message of the day',
    formTitle: 'Your sentence for today',
    adminTitle: 'Edit FARO',
    textarea: 'Write here',
    hint: 'Maximum 240 characters. No links, mentions, threats, or obvious insults.',
    submit: 'Upload sentence',
    adminSubmit: 'Update sentence',
    sending: 'Uploading...',
    success: 'Sentence saved. FARO will update at 20:00 Spain time.',
    adminSuccess: 'FARO updated.',
    closed: 'Today sentence is already closed.',
    error: 'The sentence could not be saved.',
    counter: 'characters',
    signupTitle: 'Want to write FARO one day?',
    signupLead: 'Leave your email and you will join the list we use to choose one person per day.',
    signupPlaceholder: 'you@email.com',
    signupButton: 'Join',
    signupSending: 'Saving...',
    signupSuccess: 'Email saved. FARO may look at you another day.',
    signupError: 'We could not save your email.',
    signupInvalid: 'Enter a valid email.',
  },
} as const

export default function FaroPage() {
  const lang = useLocale()
  const t = copy[lang]
  const searchParams = useSearchParams()
  const password = searchParams.get('clave') ?? ''
  const adminSecret = searchParams.get('admin') ?? ''
  const [state, setState] = useState<FaroState | null>(null)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [signupStatus, setSignupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [signupFeedback, setSignupFeedback] = useState('')

  const stateUrl = useMemo(() => {
    const params = new URLSearchParams()
    if (password) params.set('clave', password)
    if (adminSecret) params.set('admin', adminSecret)
    const query = params.toString()

    return `/api/faro${query ? `?${query}` : ''}`
  }, [adminSecret, password])

  useEffect(() => {
    let cancelled = false

    fetch(stateUrl, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setState(data)
      })
      .catch(() => {
        if (!cancelled) setFeedback(t.error)
      })

    return () => {
      cancelled = true
    }
  }, [stateUrl, t.error])

  const statusLabel = state?.status === 'live'
    ? t.liveStatus
    : state?.status === 'pending'
    ? t.pendingStatus
    : t.defaultStatus
  const messageLength = (state?.message ?? t.loading).length
  const messageSizeClass = messageLength > 185
    ? 'faro-message-xl'
    : messageLength > 120
    ? 'faro-message-lg'
    : messageLength > 70
    ? 'faro-message-md'
    : 'faro-message-sm'

  const canShowForm = Boolean(state?.canAccessForm && (state.isAdmin || state.canSubmit) && status !== 'success')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/faro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          ...(state?.isAdmin ? { adminSecret } : { password }),
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) throw new Error(data?.error ?? t.error)

      setStatus('success')
      setFeedback(state?.isAdmin ? t.adminSuccess : t.success)
      setMessage('')
      if (data?.state) setState({ ...data.state, canAccessForm: false, isAdmin: Boolean(state?.isAdmin) })
    } catch (err) {
      setStatus('error')
      setFeedback(err instanceof Error ? err.message : t.error)
    }
  }

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSignupStatus('error')
      setSignupFeedback(t.signupInvalid)
      return
    }

    setSignupStatus('loading')
    setSignupFeedback('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, source: 'faro' }),
      })

      if (!res.ok) throw new Error(t.signupError)

      setSignupStatus('success')
      setSignupFeedback(t.signupSuccess)
      setEmail('')
    } catch (err) {
      setSignupStatus('error')
      setSignupFeedback(err instanceof Error ? err.message : t.signupError)
    }
  }

  return (
    <main className="faro-main">
      {canShowForm && (
        <form className="faro-form faro-form-entry" onSubmit={handleSubmit}>
          <label>
            <span>{state?.isAdmin ? t.adminTitle : t.formTitle}</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t.textarea}
              maxLength={240}
              disabled={status === 'loading'}
              autoFocus
              required
            />
          </label>
          <div className="faro-form-footer">
            <p>{message.length}/240 {t.counter}</p>
            <button type="submit" disabled={status === 'loading' || message.trim().length < 2}>
              {status === 'loading' ? t.sending : state?.isAdmin ? t.adminSubmit : t.submit}
            </button>
          </div>
          <small>{t.hint}</small>
        </form>
      )}

      <section className="faro-stage" aria-live="polite">
        <div className="faro-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="faro-message-shell">
          <p className="faro-eyebrow">{state?.dateKey ?? t.eyebrow}</p>
          <h1 className={messageSizeClass}>
            <span>{state?.message ?? t.loading}</span>
          </h1>
          <span className="faro-status">{statusLabel}</span>
        </div>
      </section>

      {state?.canAccessForm && !canShowForm && status !== 'success' && (
        <p className="faro-feedback">{t.closed}</p>
      )}

      {feedback && (
        <p className={`faro-feedback ${status === 'error' ? 'faro-feedback-error' : ''}`}>
          {feedback}
        </p>
      )}

      <section className="faro-newsletter" aria-labelledby="faro-newsletter-title">
        <div>
          <p className="faro-eyebrow">FARO LIST</p>
          <h2 id="faro-newsletter-title">{t.signupTitle}</h2>
          <span>{t.signupLead}</span>
        </div>
        {signupStatus === 'success' ? (
          <p className="faro-newsletter-success">{signupFeedback}</p>
        ) : (
          <form className="faro-newsletter-form" onSubmit={handleSignup}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.signupPlaceholder}
              autoComplete="email"
              disabled={signupStatus === 'loading'}
              aria-label={t.signupPlaceholder}
            />
            <button type="submit" disabled={signupStatus === 'loading'}>
              {signupStatus === 'loading' ? t.signupSending : t.signupButton}
            </button>
          </form>
        )}
        {signupStatus === 'error' && <p className="faro-newsletter-error">{signupFeedback}</p>}
      </section>
    </main>
  )
}
