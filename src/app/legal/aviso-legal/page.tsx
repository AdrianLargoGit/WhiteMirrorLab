import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Legal notice / Aviso legal - White Mirror Lab',
  description: 'Legal owner information and website terms for White Mirror Lab.',
}

export default function AvisoLegalPage() {
  return (
    <LegalShell currentPath="/legal/aviso-legal">
      <LocalizedLegalContent page="legalNotice">
        <h1>Aviso legal</h1>
        <p className="legal-updated">
          Ultima actualizacion: 7 de septiembre de 2026 - En cumplimiento del art. 10 LSSI-CE.
        </p>

        <p>
          Este aviso identifica al titular de White Mirror Lab y establece las condiciones basicas
          de uso del sitio, las paginas de descarga de WML X.X.0, el marketplace de creadores y el
          archivo de resultados de WML 1.0.
        </p>

        <h2>1. Datos identificativos</h2>
        <ul>
          <li><strong>Denominacion:</strong> White Mirror Lab</li>
          <li><strong>Actividad:</strong> Laboratorio de producto y experimentacion digital</li>
          <li><strong>Domicilio:</strong> Espana (Union Europea)</li>
          <li><strong>Correo electronico:</strong> support@whitemirrorlab.com</li>
          <li><strong>Sitio web:</strong> whitemirrorlab.com</li>
        </ul>

        <h2>2. Objeto del sitio</h2>
        <p>
          El sitio presenta proyectos de White Mirror Lab, facilita el acceso a WML X.X.0, permite
          enviar o comprar packs de skins compatibles, publica contenido editorial y conserva una
          pagina de archivo para los resultados de WML 1.0.
        </p>
        <p>
          El uso del sitio implica la aceptacion de este Aviso Legal, la <a href="/legal/privacidad">Politica de privacidad</a>,
          la <a href="/legal/cookies">Politica de cookies</a> y, cuando proceda, los <a href="/legal/terminos">Terminos</a>.
        </p>

        <h2>3. Propiedad intelectual y contenido de usuarios</h2>
        <p>
          Textos, diseno, codigo, logotipos, imagenes, bases de datos y elementos interactivos son
          propiedad de White Mirror Lab o de sus licenciantes. Los packs y materiales enviados por
          creadores siguen perteneciendo a sus autores, que conceden a White Mirror Lab los derechos
          necesarios para revisarlos, mostrarlos, distribuirlos o venderlos en el marketplace cuando
          sean aceptados.
        </p>

        <h2>4. Responsabilidad</h2>
        <p>
          White Mirror Lab no garantiza la disponibilidad continua del sitio, descargas, marketplace
          o servicios de terceros. WML X.X.0 es software experimental y no sustituye herramientas
          profesionales de seguridad, mantenimiento, antivirus o copias de seguridad.
        </p>
        <p>
          Para notificar contenido ilegal, abusivo o que infrinja derechos, escribe a
          <strong> support@whitemirrorlab.com</strong> con informacion suficiente para localizarlo.
        </p>

        <h2>5. Legislacion aplicable</h2>
        <p>
          Este sitio se rige por la legislacion espanola y, cuando corresponda, por el Derecho de la
          Union Europea. Los consumidores de la UE pueden utilizar la plataforma ODR de la Comision
          Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
        </p>

        <div className="legal-contact-box">
          <p>
            <strong>Contacto legal:</strong> support@whitemirrorlab.com<br />
            Consulta tambien: <a href="/legal/privacidad">Privacidad</a> - <a href="/legal/cookies">Cookies</a> - <a href="/legal/terminos">Terminos</a> - <a href="/legal/etica">Marco etico</a>
          </p>
        </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
