import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Terms / Terminos - WML X.X.0',
  description: 'Terms for White Mirror Lab, WML X.X.0, downloads and marketplace participation.',
}

export default function TerminosPage() {
  return (
    <LegalShell currentPath="/legal/terminos">
      <LocalizedLegalContent page="terms">
        <h1>Terminos</h1>
        <p className="legal-updated">
          WML X.X.0 y servicios de White Mirror Lab - Version 2.0 - Vigentes desde el 7 de septiembre de 2026.
        </p>

        <p>
          Estos terminos regulan el uso del sitio web, la descarga de WML X.X.0, los envios de
          creadores, el marketplace y la pagina de archivo de resultados de WML 1.0.
        </p>

        <h2>1. WML X.X.0</h2>
        <p>
          WML X.X.0 es software experimental para Windows. Puede reaccionar a senales locales de
          actividad y sugerir acciones basicas de optimizacion, foco, bateria o seguridad. Las
          acciones que puedan afectar al sistema requieren confirmacion. No sustituye herramientas
          profesionales de seguridad, mantenimiento, antivirus o copias de seguridad.
        </p>

        <h2>2. Descargas, comunicaciones y datos</h2>
        <p>
          Debes proporcionar informacion veraz al suscribirte, descargar, contactar con nosotros o
          enviar packs de creador. Puedes retirar el consentimiento de newsletter en cualquier
          momento. El tratamiento de datos se describe en la <a href="/legal/privacidad">Politica de privacidad</a>.
        </p>

        <h2>3. Packs de creadores y marketplace</h2>
        <p>
          Los creadores son responsables de los packs enviados y deben contar con todos los derechos
          necesarios. Queda prohibido enviar contenido ilegal, infractor, abusivo, malicioso o
          enganoso. White Mirror Lab puede rechazar, retirar o suspender productos que incumplan
          estos terminos o generen riesgos de seguridad, calidad o legales.
        </p>

        <h2>4. Pagos, archivos y disponibilidad</h2>
        <p>
          Los pagos y descargas del marketplace pueden depender de proveedores externos. La
          disponibilidad continua no esta garantizada. Reembolsos, impuestos y disputas de pago se
          gestionaran conforme a la ley aplicable y al flujo del proveedor de checkout usado.
        </p>

        <h2>5. Archivo WML 1.0</h2>
        <p>
          WML 1.0 no es el flujo activo de participacion. Su pagina se conserva como archivo de
          resultados futuros. No deben usarse URLs antiguas para crear, manipular o revivir la
          participacion del experimento anterior.
        </p>

        <h2>6. Reportes, suspension y ley aplicable</h2>
        <p>
          Para reportar contenido ilegal o abusivo, escribe a <strong>support@whitemirrorlab.com</strong>.
          White Mirror Lab puede suspender accesos, retirar contenido o adoptar medidas tecnicas y
          legales ante incumplimientos. Estos terminos se rigen por la legislacion espanola y de la
          Union Europea cuando sea aplicable.
        </p>

        <div className="legal-contact-box">
          <p>
            <strong>Contacto:</strong> support@whitemirrorlab.com<br />
            Consulta tambien: <a href="/legal/etica">Marco etico</a> - <a href="/legal/privacidad">Privacidad</a> - <a href="/legal/cookies">Cookies</a> - <a href="/legal/aviso-legal">Aviso legal</a>
          </p>
        </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
