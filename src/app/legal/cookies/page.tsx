import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Cookie policy / Politica de cookies - White Mirror Lab',
  description: 'Cookie policy for White Mirror Lab.',
}

export default function CookiesPage() {
  return (
    <LegalShell currentPath="/legal/cookies">
      <LocalizedLegalContent page="cookies">
        <h1>Politica de cookies</h1>
        <p className="legal-updated">
          Ultima actualizacion: 2 de octubre de 2026.
        </p>

        <p>
          Esta politica explica como White Mirror Lab usa cookies y tecnologias similares.
        </p>

        <h2>1. Tecnologias que usamos</h2>
        <ul>
          <li><strong>wml_locale:</strong> recuerda la preferencia de idioma.</li>
          <li><strong>Cookies de proveedores:</strong> checkout, marketplace, anuncios o servicios embebidos pueden usar cookies cuando se cargan sus funciones.</li>
        </ul>

        <h2>2. Controles del navegador</h2>
        <p>
          Puedes bloquear o eliminar cookies en Chrome, Firefox, Safari, Edge y otros navegadores.
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
