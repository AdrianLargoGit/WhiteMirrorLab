import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = { title: 'Política de privacidad — White Mirror Lab' }

export default function PrivacidadPage() {
  return (
    <LegalShell currentPath="/legal/privacidad">
      <h1>Política de privacidad</h1>
      <p className="legal-updated">Última actualización: 10 de junio de 2026 · RGPD (UE) 2016/679 · LOPDGDD 3/2018</p>

      <p>
        White Mirror Lab respeta tu privacidad y trata tus datos personales de conformidad con el
        Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales
        y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Responsable:</strong> White Mirror Lab</li>
        <li><strong>Contacto:</strong> whitemirrorlab.info@gmail.com</li>
        <li><strong>Finalidad principal:</strong> Gestión de la participación en experimentos sociales digitales</li>
      </ul>

      <h2>2. Datos que recopilamos</h2>
      <h3>2.1. Suscripción al newsletter (landing)</h3>
      <ul>
        <li>Dirección de correo electrónico</li>
        <li>Fecha de suscripción y fuente de registro</li>
      </ul>
      <p><strong>Base legal:</strong> Consentimiento (art. 6.1.a RGPD).</p>

      <h3>2.2. Participación en WML 1.0</h3>
      <ul>
        <li>Email y credenciales de acceso (gestionadas por Supabase Auth)</li>
        <li>Username, nombre visible y perfil público</li>
        <li>Fotografías e historias que subas voluntariamente</li>
        <li>Votos emitidos (almacenados de forma que otros participantes no pueden ver tu identidad como votante)</li>
        <li>Votos recibidos y puntuación de karma (visibles públicamente dentro del experimento)</li>
        <li>Fecha de consentimiento informado</li>
        <li>Datos de uso y eventos de interacción (mediante PostHog, con identificación solo tras login)</li>
      </ul>
      <p><strong>Base legal:</strong> Consentimiento explícito (art. 6.1.a RGPD) y ejecución de la participación en el experimento (art. 6.1.b).</p>

      <h3>2.3. Datos técnicos</h3>
      <ul>
        <li>Dirección IP (anonimizada cuando es posible), tipo de navegador, páginas visitadas</li>
        <li>Cookies técnicas y de analítica (ver <a href="/legal/cookies">Política de cookies</a>)</li>
      </ul>

      <h2>3. Finalidades del tratamiento</h2>
      <ol>
        <li>Gestionar tu participación en el experimento WML 1.0</li>
        <li>Calcular y mostrar puntuaciones de karma y rankings</li>
        <li>Enviar comunicaciones sobre el experimento si te has suscrito</li>
        <li>Analizar el comportamiento agregado para la publicación de resultados científicos</li>
        <li>Garantizar la seguridad y el correcto funcionamiento de la plataforma</li>
        <li>Cumplir obligaciones legales</li>
      </ol>

      <h2>4. Destinatarios y encargados</h2>
      <p>Tus datos pueden ser tratados por los siguientes encargados, con contrato de tratamiento conforme al art. 28 RGPD:</p>
      <ul>
        <li><strong>Supabase Inc.</strong> — Base de datos, autenticación y almacenamiento (UE/EE.UU. con cláusulas contractuales tipo)</li>
        <li><strong>PostHog Inc.</strong> — Analítica de producto (configurada con perfiles identificados solo tras login)</li>
        <li><strong>Loops.so</strong> — Gestión de suscriptores al newsletter</li>
        <li><strong>Vercel Inc.</strong> — Alojamiento de la aplicación web</li>
      </ul>
      <p>No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>

      <h2>5. Plazos de conservación</h2>
      <ul>
        <li><strong>Cuenta de experimento:</strong> Durante el experimento y hasta 90 días después de su cierre, salvo solicitud de supresión anticipada</li>
        <li><strong>Newsletter:</strong> Hasta que retires tu consentimiento</li>
        <li><strong>Datos analíticos agregados:</strong> Pueden conservarse de forma anonimizada para publicación de resultados</li>
        <li><strong>Historias (24 h):</strong> Eliminadas automáticamente tras expirar</li>
      </ul>

      <h2>6. Tus derechos</h2>
      <p>Puedes ejercer los siguientes derechos contactando en whitemirrorlab.info@gmail.com:</p>
      <ul>
        <li>Acceso, rectificación y supresión</li>
        <li>Limitación u oposición al tratamiento</li>
        <li>Portabilidad de los datos</li>
        <li>Retirar el consentimiento en cualquier momento (sin afectar a la licitud del tratamiento previo)</li>
        <li>Presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es)</li>
      </ul>

      <h2>7. Menores de edad</h2>
      <p>
        WML 1.0 está restringido a personas <strong>mayores de 18 años</strong>. No recopilamos
        datos de menores de forma consciente. Si detectamos una cuenta de menor, será eliminada.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas apropiadas: cifrado en tránsito (HTTPS),
        políticas de acceso por filas (RLS) en base de datos, autenticación segura y principio de
        minimización de datos.
      </p>

      <div className="legal-contact-box">
        <p>
          <strong>Delegado de protección de datos / contacto privacidad:</strong> whitemirrorlab.info@gmail.com
        </p>
      </div>
    </LegalShell>
  )
}
