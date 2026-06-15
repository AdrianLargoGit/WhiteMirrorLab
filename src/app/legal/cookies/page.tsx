import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = {
  title: 'Política de cookies — White Mirror Lab',
  description: 'Política de cookies de White Mirror Lab conforme a la Directiva ePrivacy y la guía de la AEPD.',
}

export default function CookiesPage() {
  return (
    <LegalShell currentPath="/legal/cookies">
      <h1>Política de cookies</h1>
      <p className="legal-updated">
        Última actualización: 10 de junio de 2026 · Directiva 2009/136/CE (ePrivacy) ·
        Guía sobre el uso de cookies de la AEPD (actualización 2023)
      </p>

      <p>
        Esta política describe el uso de cookies y tecnologías similares de almacenamiento local en
        el sitio web de White Mirror Lab, de conformidad con la Directiva 2009/136/CE (Directiva
        ePrivacy) y la Guía sobre el uso de cookies publicada por la Agencia Española de Protección
        de Datos (AEPD).
      </p>
      <p>
        Al acceder a este sitio web, el usuario puede aceptar o rechazar el uso de cookies no
        esenciales a través del panel de preferencias de cookies. El uso de cookies estrictamente
        necesarias no requiere consentimiento al ser imprescindibles para el funcionamiento del
        servicio solicitado.
      </p>

      <h2>1. ¿Qué son las cookies y tecnologías similares?</h2>
      <p>
        Las cookies son pequeños ficheros de texto que un servidor web envía al navegador del
        usuario y que se almacenan en su dispositivo. Permiten que el sitio web recuerde
        información sobre tu visita (como el idioma preferido o el estado de tu sesión), lo que
        puede facilitar tu próxima visita y hacer que el sitio te resulte más útil.
      </p>
      <p>
        Además de las cookies, también utilizamos <strong>almacenamiento local</strong>{' '}
        (<em>localStorage</em> y <em>sessionStorage</em>) para guardar preferencias de usuario.
        Estas tecnologías son funcionalmente similares a las cookies pero no se envían
        automáticamente al servidor.
      </p>

      <h2>2. Tipos de cookies según su titularidad y duración</h2>
      <ul>
        <li><strong>Por titularidad:</strong> Propias (instaladas por White Mirror Lab) y de terceros (instaladas por los encargados de tratamiento)</li>
        <li><strong>Por duración:</strong> De sesión (se eliminan al cerrar el navegador) y persistentes (permanecen durante el período definido)</li>
        <li><strong>Por finalidad:</strong> Técnicas / necesarias, de preferencias y de analítica</li>
      </ul>

      <h2>3. Cookies y almacenamiento local que utilizamos</h2>

      <h3>3.1. Cookies y almacenamiento técnico — necesario (no requieren consentimiento)</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Tipo</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Finalidad</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Duración</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Titular</th>
          </tr>
        </thead>
        <tbody style={{ color: '#c8c4be' }}>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}><code>wml-1-0-auth</code></td>
            <td style={{ padding: '10px 8px' }}>localStorage</td>
            <td style={{ padding: '10px 8px' }}>Token de sesión autenticada en WML 1.0. Imprescindible para mantener el login.</td>
            <td style={{ padding: '10px 8px' }}>Sesión / hasta expiración del token</td>
            <td style={{ padding: '10px 8px' }}>Propia (Supabase)</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}><code>wml_consent_v1</code></td>
            <td style={{ padding: '10px 8px' }}>Cookie / localStorage</td>
            <td style={{ padding: '10px 8px' }}>Registra que el usuario ha otorgado el consentimiento informado para participar en el experimento. Sin esta cookie, no es posible acceder a la plataforma.</td>
            <td style={{ padding: '10px 8px' }}>1 año</td>
            <td style={{ padding: '10px 8px' }}>Propia</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}><code>wml_locale</code></td>
            <td style={{ padding: '10px 8px' }}>localStorage</td>
            <td style={{ padding: '10px 8px' }}>Preferencia de idioma del usuario (es / en).</td>
            <td style={{ padding: '10px 8px' }}>Persistente hasta modificación</td>
            <td style={{ padding: '10px 8px' }}>Propia</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 8px' }}><code>wml_session_hash</code></td>
            <td style={{ padding: '10px 8px' }}>sessionStorage</td>
            <td style={{ padding: '10px 8px' }}>Hash aleatorio anónimo para analytics de sesión (sin vinculación a identidad antes del login).</td>
            <td style={{ padding: '10px 8px' }}>Sesión</td>
            <td style={{ padding: '10px 8px' }}>Propia</td>
          </tr>
        </tbody>
      </table>

      <h3>3.2. Cookies de analítica (requieren consentimiento)</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Nombre</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Titular</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Finalidad</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Duración</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Más info</th>
          </tr>
        </thead>
        <tbody style={{ color: '#c8c4be' }}>
          <tr>
            <td style={{ padding: '10px 8px' }}><code>ph_*</code> (PostHog)</td>
            <td style={{ padding: '10px 8px' }}>PostHog Inc.</td>
            <td style={{ padding: '10px 8px' }}>
              Analítica de producto: páginas vistas, eventos de interacción, grabaciones de sesión
              (con enmascaramiento de campos sensibles). Configurado con{' '}
              <code>person_profiles: identified_only</code> — no crea perfiles individuales
              antes de que el usuario inicie sesión.
            </td>
            <td style={{ padding: '10px 8px' }}>Hasta 1 año</td>
            <td style={{ padding: '10px 8px' }}>
              <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
                Política PostHog
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>4. Consentimiento: cómo lo obtenemos y cómo puedes gestionarlo</h2>
      <p>
        Conforme a la guía de la AEPD, el consentimiento para cookies no esenciales debe ser:
        libre, específico, informado e inequívoco (acción afirmativa, nunca por omisión o
        mediante casillas premarcadas).
      </p>
      <p>
        Al acceder por primera vez a este sitio, mostramos un <strong>panel de preferencias de
        cookies</strong> que te permite aceptar o rechazar las cookies de analítica de forma
        granular. Puedes modificar tus preferencias en cualquier momento a través del enlace
        «Gestionar cookies» disponible en el pie de página.
      </p>
      <p>
        <strong>Retirar el consentimiento:</strong> puedes hacerlo en cualquier momento sin
        consecuencias. La retirada no afecta a la licitud del tratamiento basado en el
        consentimiento previo a su retirada.
      </p>

      <h2>5. Cómo desactivar o eliminar cookies desde el navegador</h2>
      <p>
        Puedes configurar tu navegador para bloquear, eliminar o recibir alertas sobre cookies.
        Ten en cuenta que bloquear cookies técnicas puede impedir el correcto funcionamiento de
        la plataforma WML 1.0 (en particular, el inicio de sesión).
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
      </ul>

      <h2>6. Opt-out específico de PostHog</h2>
      <p>
        Puedes desactivar la analítica de PostHog sin afectar al resto de funcionalidades:
      </p>
      <ul>
        <li>Rechazando las cookies de analítica en el panel de preferencias al acceder al sitio</li>
        <li>Usando el mecanismo de opt-out de PostHog:{' '}
          <a href="https://posthog.com/docs/libraries/js#opt-out" target="_blank" rel="noopener noreferrer">
            documentación oficial
          </a>
        </li>
        <li>Instalando una extensión de bloqueo de rastreadores como uBlock Origin o Privacy Badger</li>
      </ul>

      <h2>7. Más información y reclamaciones</h2>
      <p>
        Para cualquier consulta sobre esta política: <strong>whitemirrorlab.info@gmail.com</strong>.
        Consulta también nuestra <a href="/legal/privacidad">Política de privacidad</a>.
      </p>
      <p>
        Si consideras que el uso de cookies vulnera tus derechos, puedes presentar una reclamación
        ante la Agencia Española de Protección de Datos:{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
      </p>
    </LegalShell>
  )
}