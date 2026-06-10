'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { setConsentCookie } from '@/lib/consent'
import { captureEvent } from '@/lib/analytics'
import { WmlBackBar } from '@/components/wml/WmlBackBar'

function ConsentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const [age, setAge] = useState(false)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [voluntary, setVoluntary] = useState(false)
  const [error, setError] = useState('')

  const canProceed = age && terms && privacy && voluntary

  const handleContinue = () => {
    if (!canProceed) {
      setError('Debes aceptar todas las condiciones para continuar.')
      return
    }
    setConsentCookie()
    captureEvent('experiment_consent_given', { version: 'wml_consent_v1' })
    const authUrl = next ? `/web/auth?next=${encodeURIComponent(next)}` : '/web/auth'
    router.push(authUrl)
  }

  return (
    <div className="wml-consent">
      <WmlBackBar title="Consentimiento informado" />

      <div className="wml-consent-card">
        <div className="wml-consent-badge">WML 1.0 — Karma Score</div>
        <h1 className="wml-consent-heading">Antes de participar</h1>
        <p className="wml-consent-lead">
          WML 1.0 es un experimento social de reputación digital conducido por White Mirror Lab.
          Tu participación es voluntaria y puedes retirarte en cualquier momento cerrando sesión
          o solicitando la eliminación de tus datos.
        </p>

        <div className="wml-consent-info">
          <h2>Qué implica participar</h2>
          <ul>
            <li>Recibirás votos positivos o negativos de otros participantes de forma anónima.</li>
            <li>Tu karma (puntuación neta) y los votos recibidos serán visibles públicamente.</li>
            <li>Nadie podrá ver a quién has votado tú, pero sí cuántos votos has recibido.</li>
            <li>Puedes subir hasta 5 fotos y publicar historias que desaparecen a las 24 horas.</li>
            <li>Al finalizar el experimento, publicaremos un análisis agregado y anónimo.</li>
          </ul>
        </div>

        <div className="wml-consent-checks">
          <label className="wml-consent-check">
            <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} />
            <span>
              Confirmo que tengo <strong>18 años o más</strong> y capacidad legal para participar.
            </span>
          </label>

          <label className="wml-consent-check">
            <input type="checkbox" checked={voluntary} onChange={(e) => setVoluntary(e.target.checked)} />
            <span>
              Entiendo que mi participación es <strong>voluntaria</strong> y que puedo retirarme
              sin penalización en cualquier momento.
            </span>
          </label>

          <label className="wml-consent-check">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>
              He leído y acepto los{' '}
              <Link href="/legal/terminos" target="_blank">Términos de participación</Link>
              {' '}y el{' '}
              <Link href="/legal/etica" target="_blank">Marco ético del experimento</Link>.
            </span>
          </label>

          <label className="wml-consent-check">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
            <span>
              He leído y acepto la{' '}
              <Link href="/legal/privacidad" target="_blank">Política de privacidad</Link>
              {' '}y la{' '}
              <Link href="/legal/cookies" target="_blank">Política de cookies</Link>.
            </span>
          </label>
        </div>

        {error && <div className="wml-error-msg">{error}</div>}

        <button
          className="wml-btn wml-btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          disabled={!canProceed}
          onClick={handleContinue}
        >
          Acepto y quiero participar
        </button>

        <p className="wml-consent-footer-note">
          Responsable del tratamiento: White Mirror Lab ·{' '}
          <Link href="/legal/aviso-legal">Aviso legal</Link>
        </p>
      </div>
    </div>
  )
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="wml-empty">Cargando…</div>}>
      <ConsentForm />
    </Suspense>
  )
}
