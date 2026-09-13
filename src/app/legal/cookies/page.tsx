import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Cookie policy / Politica de cookies - White Mirror Lab',
  description: 'Cookie policy for White Mirror Lab, including technical and analytics cookies.',
}

export default function CookiesPage() {
  return (
    <LegalShell currentPath="/legal/cookies">
      <LocalizedLegalContent page="cookies">
        <h1>Politica de cookies</h1>
        <p className="legal-updated">
          Ultima actualizacion: 7 de septiembre de 2026 - Directiva ePrivacy y guia de cookies de la AEPD.
        </p>

        <p>
          Esta politica explica como White Mirror Lab usa cookies y tecnologias similares. Las
          cookies tecnicas necesarias no requieren consentimiento; las de analitica se activan solo
          si las aceptas.
        </p>

        <h2>1. Tecnologias que usamos</h2>
        <ul>
          <li><strong>wml_locale:</strong> recuerda la preferencia de idioma.</li>
          <li><strong>wml_cookie_consent:</strong> guarda preferencias de cookies y analitica.</li>
          <li><strong>ph_*:</strong> cookies de PostHog, solo si aceptas analitica.</li>
          <li><strong>Cookies de proveedores:</strong> checkout, marketplace, anuncios o servicios embebidos pueden usar cookies cuando se cargan sus funciones.</li>
        </ul>

        <h2>2. Gestion del consentimiento</h2>
        <p>
          El banner de cookies permite aceptar o rechazar la analitica no esencial. Puedes retirar
          el consentimiento desde las preferencias de cookies o desde la configuracion del navegador.
        </p>

        <h2>3. Controles del navegador y opt-out</h2>
        <p>
          Puedes bloquear o eliminar cookies en Chrome, Firefox, Safari, Edge y otros navegadores.
          Tambien puedes rechazar la analitica en el panel de cookies o usar el mecanismo opt-out de
          PostHog descrito en <a href="https://posthog.com/docs/libraries/js#opt-out" target="_blank" rel="noopener noreferrer">posthog.com</a>.
        </p>

        <h2>4. Mas informacion</h2>
        <p>
          Para consultas sobre cookies: <strong>support@whitemirrorlab.com</strong>. Consulta
          tambien la <a href="/legal/privacidad">Politica de privacidad</a>.
        </p>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
