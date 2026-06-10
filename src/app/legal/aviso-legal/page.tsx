import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = { title: 'Aviso legal — White Mirror Lab' }

export default function AvisoLegalPage() {
  return (
    <LegalShell currentPath="/legal/aviso-legal">
      <h1>Aviso legal</h1>
      <p className="legal-updated">Última actualización: 10 de junio de 2026</p>

      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
        Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios
        de los datos identificativos del titular de este sitio web.
      </p>

      <h2>1. Titular del sitio web</h2>
      <ul>
        <li><strong>Denominación:</strong> White Mirror Lab</li>
        <li><strong>Actividad:</strong> Laboratorio de experimentación social digital</li>
        <li><strong>Domicilio:</strong> Unión Europea (España)</li>
        <li><strong>Correo electrónico:</strong> legal@whitemirror.lab</li>
        <li><strong>Sitio web:</strong> whitemirror.lab</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El presente sitio web tiene por objeto informar sobre los experimentos sociales conducidos
        por White Mirror Lab, permitir la suscripción a comunicaciones informativas y facilitar la
        participación voluntaria en el experimento WML 1.0 («Karma Score»), dirigido exclusivamente
        a personas mayores de 18 años.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y uso de este sitio implica la aceptación de las presentes condiciones, de la{' '}
        <a href="/legal/privacidad">Política de privacidad</a>, de la{' '}
        <a href="/legal/cookies">Política de cookies</a> y, en su caso, de los{' '}
        <a href="/legal/terminos">Términos de participación</a> del experimento activo.
      </p>

      <h2>4. Propiedad intelectual</h2>
      <p>
        Los contenidos de este sitio (textos, diseño, código, logotipos y elementos gráficos) son
        propiedad de White Mirror Lab o de sus licenciantes y están protegidos por la legislación
        vigente en materia de propiedad intelectual e industrial. Queda prohibida su reproducción,
        distribución o transformación sin autorización expresa.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        White Mirror Lab no se hace responsable de los daños derivados del uso indebido del sitio
        web ni de interrupciones técnicas ajenas a su control razonable. Los experimentos sociales
        se conducen conforme al <a href="/legal/etica">Marco ético</a> publicado en este sitio.
      </p>

      <h2>6. Legislación aplicable y jurisdicción</h2>
      <p>
        Las relaciones derivadas del uso de este sitio se regirán por la legislación española y
        europea aplicable. Para la resolución de controversias, las partes se someten a los
        juzgados y tribunales del domicilio del consumidor cuando la normativa de protección de
        consumidores y usuarios así lo establezca; en caso contrario, a los de España.
      </p>

      <div className="legal-contact-box">
        <p>
          <strong>Contacto legal:</strong> legal@whitemirror.lab
        </p>
      </div>
    </LegalShell>
  )
}
