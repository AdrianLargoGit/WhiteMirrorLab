import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Ethical framework / Marco etico - White Mirror Lab',
  description: 'Ethical framework for the White Mirror Lab WML 1.0 Karma Score experiment.',
}

export default function EticaPage() {
  return (
    <LegalShell currentPath="/legal/etica">
      <LocalizedLegalContent page="ethics">
      <h1>Marco ético del experimento</h1>
      <p className="legal-updated">
        WML 1.0 «Karma Score» · Versión 1.0 · Última actualización: 10 de junio de 2026
      </p>

      <p>
        White Mirror Lab opera bajo el principio de que la incomodidad experimental es legítima
        cuando sirve para generar conocimiento verificable y de interés público, pero el daño
        real y previsible a las personas nunca lo es. Este documento describe los compromisos
        éticos del experimento WML 1.0 y las medidas adoptadas para cumplirlos.
      </p>
      <p>
        Este marco está inspirado en la <strong>Declaración de Helsinki</strong> (investigación
        con seres humanos), los principios del <strong>Informe Belmont</strong> (respeto a las
        personas, beneficencia, justicia) y la normativa europea de protección de datos (RGPD,
        art. 25 — privacidad desde el diseño).
      </p>

      <h2>1. Principios fundamentales</h2>
      <ul>
        <li>
          <strong>Consentimiento informado y por capas:</strong> Nadie participa sin haber leído,
          comprendido y aceptado explícitamente las condiciones del experimento, incluyendo la
          advertencia expresa sobre el impacto emocional potencial y la confirmación de ser mayor
          de 18 años. El consentimiento es granular: separamos el consentimiento para el experimento,
          la política de privacidad y las cookies de analítica.
        </li>
        <li>
          <strong>Voluntariedad y libertad de retirada:</strong> La participación es enteramente
          voluntaria y la retirada puede realizarse en cualquier momento sin penalización, sin
          necesidad de justificación y con la posibilidad de solicitar la eliminación completa de
          los datos.
        </li>
        <li>
          <strong>Minimización del daño:</strong> El diseño del experimento incorpora salvaguardas
          técnicas, normativas y de procedimiento para prevenir el acoso, el doxxing, la
          manipulación y el daño emocional desproporcionado.
        </li>
        <li>
          <strong>Transparencia radical:</strong> Publicaremos la metodología completa, los datos
          agregados, el código de análisis y las conclusiones al finalizar el experimento, conforme
          a los principios de ciencia abierta.
        </li>
        <li>
          <strong>Proporcionalidad y minimización de datos:</strong> Solo recopilamos los datos
          estrictamente necesarios para los fines declarados del experimento. Los datos de votos
          emitidos nunca son accesibles a otros participantes.
        </li>
        <li>
          <strong>No discriminación:</strong> El sistema no está diseñado para favorecer ni
          perjudicar a ningún grupo en función de características protegidas (género, etnia,
          orientación sexual, religión, etc.).
        </li>
      </ul>

      <h2>2. Diseño del experimento WML 1.0</h2>

      <h3>2.1. Hipótesis de investigación</h3>
      <p>
        Investigamos cómo el comportamiento humano —en términos de contenido publicado, patrones
        de interacción y estrategias de presentación— cambia cuando cada persona lleva una
        puntuación de reputación pública derivada del juicio anónimo colectivo de otros
        participantes.
      </p>

      <h3>2.2. Variables y medidas</h3>
      <ul>
        <li>Karma score (votos positivos menos negativos recibidos, por contenido y por perfil)</li>
        <li>Patrones de votación emitida (agregados y anonimizados; nunca atribuidos públicamente a individuos)</li>
        <li>Actividad de contenido: frecuencia y tipo de publicaciones (fotos, historias, pulses)</li>
        <li>Métricas de engagement: tiempo en la plataforma, interacciones (analítica agregada de PostHog)</li>
        <li>Variación de comportamiento a lo largo del tiempo en función de la puntuación recibida</li>
      </ul>

      <h3>2.3. Evaluación de impacto sobre la privacidad (DPIA)</h3>
      <p>
        Conforme al art. 35 RGPD, hemos realizado una evaluación de impacto relativa a la
        protección de datos (DPIA) antes del inicio del experimento, dado que el tratamiento
        implica:
      </p>
      <ul>
        <li>Evaluación sistemática de conducta de personas físicas (puntuación de karma)</li>
        <li>Tratamiento a gran escala de datos de comportamiento</li>
        <li>Datos especialmente sensibles en el contexto del experimento (reputación digital)</li>
      </ul>
      <p>
        La DPIA concluye que los riesgos identificados son mitigables mediante las salvaguardas
        descritas en la sección 2.4 y que el interés legítimo de la investigación es proporcional
        al riesgo residual, dado el carácter voluntario e informado de la participación.
      </p>

      <h3>2.4. Salvaguardas técnicas y organizativas implementadas</h3>
      <ul>
        <li>
          <strong>Anonimato del votante por diseño técnico (privacy by design):</strong> Las
          políticas de seguridad a nivel de fila (RLS) de la base de datos garantizan que solo el
          propio usuario puede consultar sus votos emitidos. Esta restricción es técnicamente
          irrenunciable y no puede ser anulada por ningún participante.
        </li>
        <li>
          <strong>Imposibilidad técnica de votarse a uno mismo:</strong> Implementada a nivel de
          base de datos mediante una restricción CHECK, no solo a nivel de interfaz.
        </li>
        <li>
          <strong>Restricción de edad (+18) con declaración expresa:</strong> Los participantes
          deben confirmar su mayoría de edad con una acción afirmativa y declaración consciente.
        </li>
        <li>
          <strong>Historias efímeras (24 h):</strong> Limitan la exposición permanente de
          contenido personal y reducen el riesgo de acoso basado en contenido antiguo.
        </li>
        <li>
          <strong>Límite de 5 fotos con rotación FIFO:</strong> Minimiza la acumulación de
          contenido personal en la plataforma.
        </li>
        <li>
          <strong>Moderación activa:</strong> Canal de reporte de contenidos abusivos con
          compromiso de respuesta en plazo razonable y capacidad de suspensión de cuentas.
        </li>
        <li>
          <strong>Prohibición técnica y normativa de bots:</strong> Restricciones en los términos,
          mecanismos de detección de comportamiento automatizado y posibilidad de descalificación.
        </li>
        <li>
          <strong>No hay decisiones automatizadas con efectos jurídicos:</strong> El karma es un
          marcador de juego experimental sin consecuencias legales o contractuales fuera del
          premio comunicado.
        </li>
      </ul>

      <h2>3. Riesgos identificados y medidas de mitigación</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Riesgo</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Probabilidad</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Medidas de mitigación</th>
          </tr>
        </thead>
        <tbody style={{ color: '#c8c4be' }}>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Daño emocional por votos negativos reiterados</td>
            <td style={{ padding: '10px 8px' }}>Media</td>
            <td style={{ padding: '10px 8px' }}>Consentimiento informado con advertencia expresa; retirada libre y sin penalización; canal de soporte emocional por email</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Acoso coordinado o contenido dañino</td>
            <td style={{ padding: '10px 8px' }}>Media-baja</td>
            <td style={{ padding: '10px 8px' }}>Normas de conducta estrictas; canal de reporte; moderación activa; suspensión y eliminación de cuentas abusivas; colaboración con autoridades cuando proceda</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Re-identificación de votantes</td>
            <td style={{ padding: '10px 8px' }}>Baja</td>
            <td style={{ padding: '10px 8px' }}>RLS en BD: imposibilidad técnica; solo el propio usuario ve sus votos emitidos; prohibición normativa de intentar identificar votantes</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Manipulación del ranking con bots o cuentas múltiples</td>
            <td style={{ padding: '10px 8px' }}>Media</td>
            <td style={{ padding: '10px 8px' }}>Prohibición normativa; detección técnica de patrones anómalos; descalificación; auditoría del ranking antes de entregar el premio</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Brecha de seguridad en la base de datos</td>
            <td style={{ padding: '10px 8px' }}>Muy baja</td>
            <td style={{ padding: '10px 8px' }}>RLS, cifrado TLS, contraseñas con hash, copias de seguridad cifradas, acceso restringido a producción; plan de respuesta a incidentes conforme al art. 33 RGPD (notificación a AEPD en 72 h)</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 8px' }}>Participación de menores de edad</td>
            <td style={{ padding: '10px 8px' }}>Baja</td>
            <td style={{ padding: '10px 8px' }}>Declaración expresa de mayoría de edad en el consentimiento; eliminación inmediata de cuentas de menores detectadas; no recabamos datos de menores conscientemente</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Supervisión ética</h2>
      <p>
        El diseño y la conducción del experimento son revisados internamente por el equipo de
        White Mirror Lab antes de su lanzamiento. Para experimentos que superen un determinado
        umbral de participantes o impacto, White Mirror Lab someterá el protocolo a evaluación
        por un comité de ética en investigación independiente, conforme a las directrices europeas
        aplicables a la investigación con seres humanos.
      </p>
      <p>
        Si detectas un problema ético en el diseño o la conducción del experimento que no quede
        cubierto por los canales habituales, puedes contactar directamente con el equipo en
        support@whitemirrorlab.com (asunto: «Consulta ética»).
      </p>

      <h2>4 bis. Criterios para dossiers de crimen real</h2>
      <p>
        Los dossiers documentales del blog se publican bajo una regla de proporcionalidad: solo se
        ofrece descarga de pago cuando existe un volumen suficiente de fuentes publicas reales,
        trazables y relevantes. Si el material disponible no aporta valor documental suficiente, el
        articulo no muestra ZIP de pago.
      </p>
      <p>
        El tratamiento editorial debe preservar la dignidad de victimas y familias, separar hechos
        de teorias, explicar por que un sospechoso fue descartado, no acusado o no probado, y evitar
        convertir imagenes de violencia real en reclamo visual. Las imagenes sensibles pueden
        mostrarse veladas por defecto y deben conservar contexto de fuente.
      </p>

      <h2>5. Compromiso de transparencia y ciencia abierta</h2>
      <p>
        Al finalizar el experimento, publicaremos:
      </p>
      <ul>
        <li>Metodología completa del experimento</li>
        <li>Datos estadísticos agregados y anonimizados</li>
        <li>Código de análisis utilizado (repositorio público)</li>
        <li>Conclusiones y aprendizajes, incluyendo los resultados negativos o no esperados</li>
        <li>Esta DPIA y el informe de supervisión ética (en versión pública)</li>
      </ul>
      <p>
        El objetivo es contribuir al debate público sobre reputación digital, juicio colectivo,
        diseño de plataformas sociales y sus efectos en el comportamiento humano.
      </p>

      <h2>6. Derecho a retirarse y a recibir apoyo</h2>
      <p>
        Puedes abandonar el experimento en cualquier momento y solicitar la eliminación de todos
        tus datos en support@whitemirrorlab.com. Procesaremos las solicitudes en un plazo
        máximo de 30 días.
      </p>
      <p>
        Si el experimento te ha generado malestar emocional y deseas hablar con alguien, te
        recomendamos contactar con servicios de apoyo psicológico disponibles en tu país. En
        España: <a href="https://www.teleasistencia.imserso.es" target="_blank" rel="noopener noreferrer">Teleasistencia IMSERSO</a>{' '}
        o el <strong>Teléfono de la Esperanza: 717 003 717</strong>.
      </p>

      <div className="legal-contact-box">
        <p>
          <strong>Contacto ético:</strong> support@whitemirrorlab.com<br />
          Asunto sugerido: «Consulta ética WML 1.0»<br /><br />
          <a href="/legal/terminos">Términos de participación</a> ·{' '}
          <a href="/legal/privacidad">Privacidad</a> ·{' '}
          <a href="/legal/aviso-legal">Aviso legal</a>
        </p>
      </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
