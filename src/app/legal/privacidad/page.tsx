import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Privacy policy / Politica de privacidad - White Mirror Lab',
  description: 'Privacy policy for White Mirror Lab under GDPR and applicable Spanish data protection law.',
}

export default function PrivacidadPage() {
  return (
    <LegalShell currentPath="/legal/privacidad">
      <LocalizedLegalContent page="privacy">
      <h1>Política de privacidad</h1>
      <p className="legal-updated">
        Última actualización: 10 de junio de 2026 · RGPD (UE) 2016/679 · LOPDGDD 3/2018 ·
        Art. 13 y 14 RGPD (información en el momento de recogida)
      </p>

      <p>
        White Mirror Lab («nosotros», «el responsable») trata tus datos personales de conformidad
        con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de
        2016 (RGPD), y la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos
        Personales y garantía de los derechos digitales (LOPDGDD).
      </p>
      <p>
        Te recomendamos leer este documento completo. Si tienes preguntas, escríbenos a{' '}
        <strong>support@whitemirrorlab.com</strong> antes de proporcionar tus datos.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li><strong>Responsable:</strong> White Mirror Lab</li>
        <li><strong>Correo electrónico:</strong> support@whitemirrorlab.com</li>
        <li><strong>Domicilio:</strong> España (Unión Europea)</li>
        <li><strong>Sitio web:</strong> whitemirrorlab.com</li>
      </ul>
      <p>
        No estamos obligados a designar Delegado de Protección de Datos (DPD) según el art. 37
        RGPD, pero puedes dirigir cualquier consulta de privacidad a la dirección indicada.
      </p>

      <h2>2. Finalidades, bases legales y plazos de conservación</h2>

      <h3>2.1. Suscripción a la lista de espera / newsletter (landing page)</h3>
      <ul>
        <li><strong>Datos:</strong> Dirección de correo electrónico, fecha y hora de suscripción, fuente de registro</li>
        <li><strong>Finalidad:</strong> Enviar comunicaciones informativas sobre White Mirror Lab y sus experimentos</li>
        <li><strong>Base legal:</strong> Consentimiento del interesado (art. 6.1.a RGPD). Puedes retirarlo en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</li>
        <li><strong>Plazo:</strong> Hasta que retires tu consentimiento o solicites la supresión</li>
        <li><strong>Encargado:</strong> Brevo (plataforma de email marketing)</li>
      </ul>

      <h3>2.2. Registro y participación en el experimento WML 1.0</h3>
      <ul>
        <li><strong>Datos recogidos en el registro:</strong> Correo electrónico, contraseña (cifrada; nunca accesible por nosotros), nombre de usuario (<em>username</em>), nombre visible, edad, país, idioma preferido</li>
        <li><strong>Datos generados durante la participación:</strong>
          <ul>
            <li>Fotografías e historias que publicas voluntariamente</li>
            <li>Texto libre en <em>pulses</em> y respuestas</li>
            <li>Votos emitidos (identificados internamente, nunca visibles para otros participantes)</li>
            <li>Votos recibidos y puntuación de karma (visibles públicamente dentro del experimento)</li>
            <li>Fecha y versión del consentimiento informado aceptado</li>
            <li>Fecha de creación de la cuenta y última actividad</li>
          </ul>
        </li>
        <li>
          <strong>Finalidades:</strong>
          <ol>
            <li>Gestionar tu acceso y participación en el experimento</li>
            <li>Calcular y mostrar puntuaciones de karma y rankings</li>
            <li>Garantizar la seguridad y el correcto funcionamiento de la plataforma</li>
            <li>Moderar contenidos y prevenir usos abusivos</li>
            <li>Analizar el comportamiento agregado para la publicación científica de resultados</li>
            <li>Cumplir obligaciones legales aplicables</li>
          </ol>
        </li>
        <li>
          <strong>Bases legales:</strong>
          <ul>
            <li>Consentimiento explícito e informado del interesado (art. 6.1.a RGPD) para la participación en el experimento y el tratamiento de datos de comportamiento</li>
            <li>Ejecución del acuerdo de participación (art. 6.1.b RGPD) para la gestión de la cuenta y el acceso a la plataforma</li>
            <li>Interés legítimo de White Mirror Lab (art. 6.1.f RGPD) para la seguridad de la plataforma y la prevención de fraude, ponderado con tus derechos e intereses</li>
            <li>Cumplimiento de obligaciones legales (art. 6.1.c RGPD) cuando proceda</li>
          </ul>
        </li>
        <li>
          <strong>Plazos de conservación:</strong>
          <ul>
            <li>Datos de cuenta activa: durante el experimento</li>
            <li>Datos tras la finalización del experimento: 90 días, salvo solicitud de supresión anticipada</li>
            <li>Datos de votos emitidos y recibidos: eliminados con la cuenta o 90 días tras la finalización</li>
            <li>Fotografías e historias: eliminadas con la cuenta (las historias, a las 24 h)</li>
            <li>Registros de seguridad (logs): máximo 12 meses</li>
            <li>Datos en publicaciones de resultados: siempre anonimizados o seudonimizados; conservación indefinida en ese formato</li>
          </ul>
        </li>
      </ul>

      <h3>2.3. Analítica de producto</h3>
      <ul>
        <li><strong>Datos:</strong> Identificador de usuario (solo tras login), páginas visitadas, eventos de interacción (votos, publicaciones, tiempo de sesión), país aproximado derivado de IP</li>
        <li><strong>Finalidad:</strong> Comprender el comportamiento dentro de la plataforma para mejorar el experimento y publicar resultados</li>
        <li>
          <strong>Base legal:</strong>
          <ul>
            <li>Consentimiento (art. 6.1.a RGPD) para la analítica de usuarios identificados mediante cookies no esenciales</li>
            <li>Interés legítimo (art. 6.1.f RGPD) para analítica agregada y anonimizada</li>
          </ul>
        </li>
        <li><strong>Configuración de privacidad:</strong> PostHog se configura con <code>{"person_profiles: 'identified_only'"}</code> — solo crea perfiles de persona para usuarios que han iniciado sesión. Antes del login, los datos son anónimos.</li>
        <li><strong>Plazo:</strong> Según configuración de retención del panel PostHog (máximo 1 año para datos identificados)</li>
      </ul>

      <h3>2.4. Datos técnicos de navegación</h3>
      <ul>
        <li><strong>Datos:</strong> Dirección IP (anonimizada en la medida de lo posible), tipo y versión de navegador, sistema operativo, páginas visitadas, hora de acceso</li>
        <li><strong>Finalidad:</strong> Seguridad de la plataforma, detección de fraude, mantenimiento técnico</li>
        <li><strong>Base legal:</strong> Interés legítimo (art. 6.1.f RGPD)</li>
        <li><strong>Plazo:</strong> Máximo 12 meses en logs del servidor</li>
      </ul>

      <h2>3. Destinatarios y transferencias internacionales</h2>
      <p>
        Tus datos son tratados por los siguientes encargados del tratamiento, con los que mantenemos
        contratos de tratamiento de datos conformes al art. 28 RGPD:
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Encargado</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Servicio</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Ubicación / garantías</th>
          </tr>
        </thead>
        <tbody style={{ color: '#c8c4be' }}>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Supabase Inc.</td>
            <td style={{ padding: '10px 8px' }}>Base de datos, autenticación, almacenamiento de archivos</td>
            <td style={{ padding: '10px 8px' }}>EE.UU. — Cláusulas Contractuales Tipo (CCT) CE 2021/914</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>PostHog Inc.</td>
            <td style={{ padding: '10px 8px' }}>Analítica de producto (instancia UE disponible)</td>
            <td style={{ padding: '10px 8px' }}>EE.UU. / UE — CCT o instancia EU (eu.posthog.com)</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Brevo</td>
            <td style={{ padding: '10px 8px' }}>Gestión de newsletter y suscriptores</td>
            <td style={{ padding: '10px 8px' }}>EE.UU. — CCT</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 8px' }}>Vercel Inc.</td>
            <td style={{ padding: '10px 8px' }}>Alojamiento y CDN de la aplicación web</td>
            <td style={{ padding: '10px 8px' }}>EE.UU. / UE — CCT; opción de región UE disponible</td>
          </tr>
        </tbody>
      </table>

      <p>
        No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines comerciales.
        No realizamos transferencias internacionales más allá de las indicadas, y en todos los
        casos garantizamos el nivel de protección exigido por el capítulo V del RGPD.
      </p>

      <h2>4. Tus derechos</h2>
      <p>
        Puedes ejercer los siguientes derechos en cualquier momento, de forma gratuita, dirigiéndote
        a <strong>support@whitemirrorlab.com</strong> con el asunto «Ejercicio de derechos RGPD»
        e indicando tu nombre de usuario:
      </p>
      <ul>
        <li><strong>Acceso (art. 15 RGPD):</strong> Obtener confirmación de si tratamos tus datos y una copia de los mismos</li>
        <li><strong>Rectificación (art. 16 RGPD):</strong> Corregir datos inexactos o incompletos</li>
        <li><strong>Supresión / «derecho al olvido» (art. 17 RGPD):</strong> Solicitar la eliminación de tus datos cuando ya no sean necesarios o retires tu consentimiento</li>
        <li><strong>Limitación del tratamiento (art. 18 RGPD):</strong> Solicitar que limitemos el uso de tus datos en determinadas circunstancias</li>
        <li><strong>Portabilidad (art. 20 RGPD):</strong> Recibir tus datos en formato estructurado y legible por máquina cuando el tratamiento se base en consentimiento o contrato</li>
        <li><strong>Oposición (art. 21 RGPD):</strong> Oponerte al tratamiento basado en interés legítimo, incluida la elaboración de perfiles</li>
        <li><strong>Retirada del consentimiento (art. 7.3 RGPD):</strong> En cualquier momento, sin afectar a la licitud del tratamiento previo</li>
        <li><strong>No ser objeto de decisiones automatizadas (art. 22 RGPD):</strong> No aplicamos decisiones individuales automatizadas con efectos jurídicos significativos (el karma es un marcador de juego experimental, no una decisión con efectos legales)</li>
      </ul>
      <p>
        Responderemos en el plazo máximo de un mes desde la recepción de la solicitud (prorrogable
        dos meses más en casos complejos, con notificación previa). Si la solicitud es manifiestamente
        infundada o excesiva, podremos cobrar un canon razonable o negarnos a actuar.
      </p>
      <p>
        Si consideras que el tratamiento vulnera tus derechos, puedes presentar una reclamación
        ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>:{' '}
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
      </p>

      <h2>5. Menores de edad</h2>
      <p>
        La participación en WML 1.0 está restringida a personas mayores de <strong>18 años</strong>.
        No recabamos datos de menores de forma consciente. Si tienes conocimiento de que un menor
        ha creado una cuenta, comunícalo a support@whitemirrorlab.com para proceder a su
        eliminación inmediata.
      </p>

      <h2>6. Seguridad de los datos</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas conforme al art. 32 RGPD:
      </p>
      <ul>
        <li>Cifrado en tránsito mediante TLS/HTTPS en todas las comunicaciones</li>
        <li>Contraseñas almacenadas con hash seguro (gestionado por Supabase Auth/bcrypt)</li>
        <li>Políticas de seguridad a nivel de fila (Row-Level Security, RLS) en la base de datos: ningún usuario puede acceder a datos de otro</li>
        <li>Anonimato del votante garantizado por diseño técnico: solo el propio usuario puede ver sus votos emitidos</li>
        <li>Acceso restringido a datos de producción solo al personal autorizado</li>
        <li>Copias de seguridad cifradas gestionadas por Supabase</li>
      </ul>

      <h2>7. Cookies</h2>
      <p>
        Para información detallada sobre el uso de cookies, consulta nuestra{' '}
        <a href="/legal/cookies">Política de cookies</a>.
      </p>

      <h2>8. Cambios en esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios en nuestras prácticas o en la
        normativa aplicable. Cuando los cambios sean sustanciales, te lo notificaremos por email
        o mediante un aviso destacado en la plataforma antes de que entren en vigor. La fecha de
        «última actualización» en el encabezado siempre reflejará la versión vigente.
      </p>

      <div className="legal-contact-box">
        <p>
          <strong>Contacto privacidad / DPD:</strong> support@whitemirrorlab.com<br />
          Asunto sugerido: «Ejercicio de derechos RGPD» o «Consulta privacidad»<br />
          Plazo de respuesta: máximo 30 días naturales
        </p>
      </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
