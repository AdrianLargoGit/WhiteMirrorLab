'use client'

import { FormEvent, useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { captureEvent } from '@/lib/posthog'

const copy = {
  es: {
    label: 'Contacto',
    title: 'Hablemos.',
    description: 'Cuéntanos qué necesitas y te responderemos por email lo antes posible.',
    name: 'Nombre',
    email: 'Email',
    subject: 'Asunto',
    message: 'Mensaje',
    submit: 'Enviar mensaje',
    sending: 'Enviando...',
    success: 'Mensaje enviado. Te responderemos pronto.',
    error: 'No hemos podido enviar el mensaje. Inténtalo de nuevo.',
    invalid: 'Rellena todos los campos con un email válido.',
  },
  en: {
    label: 'Contact',
    title: 'Let us talk.',
    description: 'Tell us what you need and we will reply by email as soon as possible.',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending...',
    success: 'Message sent. We will reply soon.',
    error: 'We could not send the message. Please try again.',
    invalid: 'Fill in every field with a valid email.',
  },
} as const

export default function ContactPage() {
  const lang = useLocale()
  const t = copy[lang]
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      locale: lang,
    }

    if (!payload.name || !payload.subject || !payload.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError(t.invalid)
      return
    }

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed')

      setStatus('success')
      setForm({ name: '', email: '', subject: '', message: '' })
      captureEvent('contact_form_submitted', { locale: lang })
    } catch {
      setStatus('error')
      setError(t.error)
    }
  }

  return (
    <div>
      <div className="contact-label">{t.label}</div>
      <h1 className="contact-title">{t.title}</h1>
      <p className="contact-desc">{t.description}</p>

      <form className="contact-card" onSubmit={handleSubmit}>
        <label className="contact-field">
          <span>{t.name}</span>
          <input
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            autoComplete="name"
            disabled={status === 'loading'}
            required
          />
        </label>

        <label className="contact-field">
          <span>{t.email}</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
            disabled={status === 'loading'}
            required
          />
        </label>

        <label className="contact-field">
          <span>{t.subject}</span>
          <input
            value={form.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            disabled={status === 'loading'}
            required
          />
        </label>

        <label className="contact-field">
          <span>{t.message}</span>
          <textarea
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
            rows={7}
            disabled={status === 'loading'}
            required
          />
        </label>

        <button type="submit" className="contact-submit" disabled={status === 'loading'}>
          {status === 'loading' ? t.sending : t.submit}
        </button>

        {status === 'success' && <p className="contact-success">{t.success}</p>}
        {error && <p className="contact-error">{error}</p>}
      </form>
    </div>
  )
}
