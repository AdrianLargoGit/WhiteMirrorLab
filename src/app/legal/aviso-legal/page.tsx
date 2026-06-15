import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = {
  title: 'Aviso legal — White Mirror Lab',
  description: 'Información legal obligatoria del titular del sitio web White Mirror Lab conforme a la LSSI-CE.',
}

export default function AvisoLegalPage() {
  return (
    <LegalShell currentPath="/legal/aviso-legal">
      <h1>Aviso legal</h1>
      <p className="legal-updated">
        Última actualización: 10 de junio de 2026 · En cumplimiento del art. 10 LSSI-CE (Ley 34/2002)
      </p>

      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se ponen a disposición de
        los usuarios los datos identificativos del titular de este sitio web.
      </p>

      <h2>1. Datos identificativos del titular</h2>
      <ul>
        <li><strong>Denominación:</strong> White Mirror Lab</li>
        <li><strong>Actividad:</strong> Laboratorio de experimentación social digital sin ánimo de lucro</li>
        <li><strong>Domicilio social:</strong> España (Unión Europea)</li>
        <li><strong>Correo electrónico de contacto:</strong> whitemirrorlab.info@gmail.com</li>
        <li><strong>Sitio web:</strong> whitemirror.lab</li>
        <li>
          <strong>Nota sobre NIF/CIF:</strong> White Mirror Lab opera como proyecto de investigación
          no mercantil. En caso de requerir datos registrales adicionales para fines legales, diríjase
          a whitemirrorlab.info@gmail.com.
        </li>
      </ul>

      <h2>2. Objeto y ámbito de aplicación</h2>
      <p>
        El presente sitio web tiene por objeto informar sobre los experimentos sociales conducidos
        por White Mirror Lab, facilitar la suscripción a comunicaciones informativas y permitir la
        participación voluntaria en el experimento WML 1.0 («Karma Score»).
      </p>
      <p>
        El acceso y uso de este sitio web implica la aceptación íntegra y sin reservas de las
        presentes condiciones, así como de la{' '}
        <a href="/legal/privacidad">Política de privacidad</a>,{' '}
        <a href="/legal/cookies">Política de cookies</a> y, en su caso, los{' '}
        <a href="/legal/terminos">Términos de participación</a> del experimento activo.
        Si no está de acuerdo con alguna de estas condiciones, debe abstenerse de acceder o usar
        este sitio web.
      </p>

      <h2>3. Mayoría de edad</h2>
      <p>
        Este sitio web y, en particular, la participación en el experimento WML 1.0 están dirigidos
        exclusivamente a personas <strong>mayores de 18 años</strong> con plena capacidad de obrar.
        White Mirror Lab no recaba datos de menores de edad de forma consciente. Si se detecta una
        cuenta creada por un menor, será eliminada de forma inmediata y sus datos suprimidos.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        La totalidad de los contenidos de este sitio web —incluyendo, sin carácter limitativo,
        textos, diseño gráfico, código fuente, logotipos, imágenes, vídeos, bases de datos y
        elementos interactivos— son propiedad de White Mirror Lab o de sus licenciantes, y están
        protegidos por la legislación española y comunitaria en materia de propiedad intelectual
        e industrial (Real Decreto Legislativo 1/1996, de 12 de abril, por el que se aprueba el
        Texto Refundido de la Ley de Propiedad Intelectual, y legislación concordante).
      </p>
      <p>
        Queda expresamente prohibida cualquier reproducción, distribución, comunicación pública,
        transformación, puesta a disposición o cualquier otra forma de explotación, parcial o total,
        de dichos contenidos sin la autorización escrita y expresa de White Mirror Lab. El
        incumplimiento de esta prohibición podrá dar lugar a las acciones legales oportunas.
      </p>
      <p>
        El contenido generado por los usuarios dentro del experimento WML 1.0 (fotografías,
        publicaciones de texto e historias) es propiedad de sus respectivos autores. Los usuarios
        conceden a White Mirror Lab una licencia no exclusiva, limitada al ámbito del experimento,
        para mostrar dicho contenido dentro de la plataforma y en publicaciones de resultados
        agregados y anonimizados. Esta licencia se extingue con la eliminación de la cuenta o la
        finalización del experimento, salvo para datos ya incorporados a publicaciones académicas.
      </p>

      <h2>5. Exclusión de responsabilidad</h2>

      <h3>5.1. Disponibilidad del servicio</h3>
      <p>
        White Mirror Lab no garantiza la disponibilidad continua e ininterrumpida del sitio web ni
        de la plataforma del experimento. Se excluye la responsabilidad por daños o perjuicios de
        cualquier naturaleza derivados de interrupciones, errores técnicos, virus informáticos o
        fallos de conectividad ajenos al control razonable de White Mirror Lab.
      </p>

      <h3>5.2. Contenido de usuarios</h3>
      <p>
        White Mirror Lab actúa como prestador de servicios de intermediación en los términos de la
        LSSI-CE y el Reglamento (UE) 2022/2065 (Ley de Servicios Digitales). No es responsable de
        los contenidos publicados por los usuarios, pero dispondrá mecanismos de notificación y
        retirada (<em>notice and takedown</em>) y podrá retirar contenidos ilegales o contrarios a
        las normas de conducta del experimento tan pronto tenga conocimiento efectivo de su
        existencia.
      </p>
      <p>
        Para notificar contenido ilegal o abusivo: <strong>whitemirrorlab.info@gmail.com</strong>,
        indicando en el asunto «Notificación de contenido» y describiendo el contenido y su
        localización.
      </p>

      <h3>5.3. Vínculos externos</h3>
      <p>
        Este sitio puede contener enlaces a sitios de terceros. White Mirror Lab no controla ni
        se responsabiliza del contenido, políticas de privacidad ni prácticas de dichos sitios.
        La inclusión de un enlace no implica respaldo ni asociación alguna.
      </p>

      <h3>5.4. Exactitud de la información</h3>
      <p>
        White Mirror Lab procura mantener actualizada la información publicada en este sitio, pero
        no garantiza la exactitud, completitud o actualidad de los contenidos. La información
        tiene carácter meramente informativo y no constituye asesoramiento profesional de ningún
        tipo.
      </p>

      <h2>6. Legislación aplicable y jurisdicción</h2>
      <p>
        Las relaciones derivadas del acceso o uso de este sitio web se regirán e interpretarán
        conforme a la legislación española y, en lo que proceda, a la normativa de la Unión
        Europea. Para la resolución de controversias, y sin perjuicio de la normativa imperativa
        de protección de consumidores y usuarios (Real Decreto Legislativo 1/2007 y legislación
        comunitaria), las partes se someten a la competencia de los Juzgados y Tribunales
        competentes conforme a la normativa procesal vigente.
      </p>
      <p>
        Los consumidores residentes en la Unión Europea pueden utilizar la plataforma de
        resolución de litigios en línea de la Comisión Europea:{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>.
      </p>

      <h2>7. Modificaciones</h2>
      <p>
        White Mirror Lab se reserva el derecho de modificar el presente Aviso Legal en cualquier
        momento. Los cambios entrarán en vigor desde su publicación en este sitio. Se recomienda
        consultar esta página periódicamente. El uso continuado del sitio tras la publicación de
        cambios implica su aceptación.
      </p>

      <div className="legal-contact-box">
        <p>
          <strong>Contacto legal:</strong> whitemirrorlab.info@gmail.com<br />
          Consulta también: <a href="/legal/privacidad">Privacidad</a> ·{' '}
          <a href="/legal/cookies">Cookies</a> ·{' '}
          <a href="/legal/terminos">Términos de participación</a> ·{' '}
          <a href="/legal/etica">Marco ético</a>
        </p>
      </div>
    </LegalShell>
  )
}