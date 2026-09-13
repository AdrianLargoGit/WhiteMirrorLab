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
        <h1>Politica de privacidad</h1>
        <p className="legal-updated">
          Ultima actualizacion: 7 de septiembre de 2026 - RGPD (UE) 2016/679 - LOPDGDD 3/2018.
        </p>

        <p>
          White Mirror Lab trata datos personales conforme al RGPD y la normativa espanola de
          proteccion de datos. El foco activo del proyecto es WML X.X.0, una mascota de escritorio
          para Windows disenada alrededor del procesamiento local, datos minimos y control del
          usuario.
        </p>

        <h2>1. Responsable</h2>
        <ul>
          <li><strong>Responsable:</strong> White Mirror Lab</li>
          <li><strong>Email:</strong> support@whitemirrorlab.com</li>
          <li><strong>Ubicacion:</strong> Espana, Union Europea</li>
          <li><strong>Sitio web:</strong> whitemirrorlab.com</li>
        </ul>

        <h2>2. Finalidades, bases legales y conservacion</h2>
        <h3>2.1. Newsletter y acceso a descarga</h3>
        <ul>
          <li><strong>Datos:</strong> email, fecha de suscripcion y fuente del registro.</li>
          <li><strong>Finalidad:</strong> enviar informacion de descarga de WML X.X.0, novedades del producto, skins y avisos importantes.</li>
          <li><strong>Base legal:</strong> consentimiento. Puedes retirarlo en cualquier momento.</li>
          <li><strong>Encargado:</strong> Brevo.</li>
        </ul>

        <h3>2.2. Marketplace y envios de creadores</h3>
        <ul>
          <li><strong>Datos:</strong> contacto del creador, archivos enviados, descripciones, precios, estado de revision y referencias de pago cuando proceda.</li>
          <li><strong>Finalidad:</strong> revisar packs, publicar productos aprobados, procesar descargas o compras, prevenir abuso y prestar soporte.</li>
          <li><strong>Bases legales:</strong> ejecucion contractual, consentimiento cuando sea necesario, interes legitimo en seguridad y cumplimiento legal.</li>
        </ul>

        <h3>2.3. Widget WML X.X.0</h3>
        <p>
          La web explica el funcionamiento del widget antes de la descarga. El widget esta disenado
          para trabajar localmente con senales del dispositivo como actividad, bateria, puntos, apps
          habituales e informacion basica de procesos seguros. No envia archivos personales, texto
          escrito en otras apps ni contenido de ventanas a la IA local.
        </p>

        <h3>2.4. Analitica y logs tecnicos</h3>
        <p>
          PostHog puede tratar paginas vistas y eventos de interaccion solo segun el consentimiento
          de analitica. Los logs tecnicos y de seguridad pueden incluir IP, navegador, sistema
          operativo y metadatos de solicitud para mantenimiento, prevencion de fraude y seguridad.
        </p>

        <h2>3. Destinatarios y transferencias</h2>
        <p>
          Usamos encargados como Supabase, PostHog, Brevo, Vercel, Cloudflare/R2 y proveedores de
          pago o checkout cuando proceda. Si hay transferencias fuera del Espacio Economico Europeo,
          se aplican garantias adecuadas.
        </p>

        <h2>4. Tus derechos</h2>
        <p>
          Puedes ejercer acceso, rectificacion, supresion, limitacion, portabilidad, oposicion y
          retirada del consentimiento escribiendo a <strong>support@whitemirrorlab.com</strong>.
          Tambien puedes reclamar ante la Agencia Espanola de Proteccion de Datos:
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer"> www.aepd.es</a>.
        </p>

        <h2>5. Menores y seguridad</h2>
        <p>
          El sitio, marketplace y descarga de WML X.X.0 estan dirigidos a personas mayores de 18
          anos. Aplicamos medidas tecnicas y organizativas como TLS, acceso restringido a produccion
          y controles de los proveedores usados.
        </p>

        <h2>6. Archivo WML 1.0</h2>
        <p>
          WML 1.0 ya no se presenta como experimento activo. Su pagina queda reservada para futuros
          resultados y contexto. Cualquier resultado publicado debera ser agregado o anonimizado.
        </p>

        <div className="legal-contact-box">
          <p>
            <strong>Contacto privacidad:</strong> support@whitemirrorlab.com<br />
            Asunto sugerido: Ejercicio de derechos RGPD o Consulta privacidad
          </p>
        </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
