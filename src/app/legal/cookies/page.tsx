import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = { title: 'Política de cookies — White Mirror Lab' }

export default function CookiesPage() {
  return (
    <LegalShell currentPath="/legal/cookies">
      <h1>Política de cookies</h1>
      <p className="legal-updated">Última actualización: 10 de junio de 2026</p>

      <p>
        Esta política describe el uso de cookies y tecnologías similares en el sitio web de
        White Mirror Lab, de conformidad con la Directiva ePrivacy y la guía de la AEPD.
      </p>

      <h2>1. ¿Qué son las cookies?</h2>
      <p>
        Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
        visitas un sitio web. Permiten recordar preferencias, mantener sesiones activas y analizar
        el uso del sitio.
      </p>

      <h2>2. Cookies que utilizamos</h2>

      <h3>2.1. Cookies técnicas (necesarias)</h3>
      <p><strong>Base legal:</strong> Interés legítimo / ejecución del servicio solicitado. No requieren consentimiento.</p>
      <ul>
        <li><strong>Sesión de autenticación (Supabase):</strong> Mantener tu sesión iniciada en WML 1.0</li>
        <li><strong>wml_consent_v1:</strong> Registra que has dado tu consentimiento informado para participar</li>
        <li><strong>wml_lang:</strong> Preferencia de idioma en la landing page (localStorage)</li>
      </ul>

      <h3>2.2. Cookies de analítica</h3>
      <p><strong>Base legal:</strong> Consentimiento (para cookies no esenciales en la UE).</p>
      <ul>
        <li><strong>PostHog:</strong> Analítica de uso de la plataforma (páginas visitadas, eventos de interacción). Configurado con <code>person_profiles: identified_only</code> — solo identifica usuarios tras iniciar sesión.</li>
      </ul>

      <h2>3. Gestión de cookies</h2>
      <p>Puedes gestionar las cookies de las siguientes formas:</p>
      <ul>
        <li>Configuración de tu navegador (bloquear, eliminar o alertar sobre cookies)</li>
        <li>Extensiones de privacidad del navegador</li>
        <li>Opt-out de PostHog: <a href="https://posthog.com/docs/libraries/js#opt-out" target="_blank" rel="noopener noreferrer">documentación oficial</a></li>
      </ul>
      <p>
        Ten en cuenta que bloquear cookies técnicas puede impedir el acceso al experimento WML 1.0.
      </p>

      <h2>4. Conservación</h2>
      <ul>
        <li><strong>wml_consent_v1:</strong> 1 año</li>
        <li><strong>Sesión Supabase:</strong> Según configuración de sesión (renovable)</li>
        <li><strong>PostHog:</strong> Según política de retención configurada en el panel de PostHog</li>
      </ul>

      <h2>5. Más información</h2>
      <p>
        Para consultas sobre cookies: whitemirrorlab.info@gmail.com. Consulta también nuestra{' '}
        <a href="/legal/privacidad">Política de privacidad</a>.
      </p>
    </LegalShell>
  )
}
