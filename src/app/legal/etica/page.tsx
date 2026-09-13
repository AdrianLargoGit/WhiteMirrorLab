import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Ethical framework / Marco etico - White Mirror Lab',
  description: 'Ethical framework for White Mirror Lab and WML X.X.0.',
}

export default function EticaPage() {
  return (
    <LegalShell currentPath="/legal/etica">
      <LocalizedLegalContent page="ethics">
        <h1>Marco etico</h1>
        <p className="legal-updated">
          WML X.X.0 - Version 2.0 - Ultima actualizacion: 7 de septiembre de 2026.
        </p>

        <p>
          White Mirror Lab centra ahora su trabajo publico en WML X.X.0: una mascota local de
          escritorio que puede parecer inquietante, pero debe seguir siendo comprensible, limitada y
          controlada por el usuario.
        </p>

        <h2>1. Principios</h2>
        <ul>
          <li><strong>Local primero:</strong> priorizar procesamiento en el dispositivo y senales locales minimas.</li>
          <li><strong>Sin lectura de contenido:</strong> no leer ni transmitir archivos personales, texto escrito en otras apps o contenido de ventanas a la IA local.</li>
          <li><strong>Descarga informada:</strong> explicar que puede hacer el widget antes de instalarlo.</li>
          <li><strong>Accion confirmada:</strong> pedir permiso antes de ejecutar acciones que puedan afectar al equipo.</li>
          <li><strong>Separacion entre archivo y producto:</strong> WML 1.0 queda como archivo de resultados, no como relato activo.</li>
        </ul>

        <h2>2. Riesgos y salvaguardas</h2>
        <p>
          Los riesgos identificados incluyen confundir senales locales con acceso invasivo, confiar en
          exceso en sugerencias de optimizacion, instalar archivos de creador sin revision o
          interpretar el archivo WML 1.0 como participacion activa. Las salvaguardas incluyen copy
          claro, consentimiento antes de descargar, revision del marketplace, afirmaciones limitadas
          y confirmacion del usuario.
        </p>

        <h2>3. Transparencia</h2>
        <p>
          Nos comprometemos a mantener afirmaciones especificas: que puede usar el widget, que no
          puede acceder, cuando necesita internet y cuando una accion requiere confirmacion.
        </p>

        <div className="legal-contact-box">
          <p>
            <strong>Contacto etico:</strong> support@whitemirrorlab.com<br />
            Consulta tambien: <a href="/legal/terminos">Terminos</a> - <a href="/legal/privacidad">Privacidad</a> - <a href="/legal/aviso-legal">Aviso legal</a>
          </p>
        </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
