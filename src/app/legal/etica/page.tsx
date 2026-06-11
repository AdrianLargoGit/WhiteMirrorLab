import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = { title: 'Marco ético — White Mirror Lab' }

export default function EticaPage() {
  return (
    <LegalShell currentPath="/legal/etica">
      <h1>Marco ético del experimento</h1>
      <p className="legal-updated">WML 1.0 «Karma Score» · Última actualización: 10 de junio de 2026</p>

      <p>
        White Mirror Lab opera bajo el principio de que la incomodidad experimental es legítima
        cuando sirve para generar conocimiento, pero el daño a las personas nunca lo es. Este
        documento describe los compromisos éticos del experimento WML 1.0.
      </p>

      <h2>1. Principios fundamentales</h2>
      <ul>
        <li><strong>Consentimiento informado:</strong> Nadie participa sin haber leído y aceptado explícitamente las condiciones, incluida la confirmación de ser mayor de 18 años</li>
        <li><strong>Voluntariedad:</strong> La participación es libre y la retirada, sin penalización</li>
        <li><strong>Minimización de daño:</strong> Diseñamos mecanismos para evitar acoso, doxxing y exposición de identidad de votantes</li>
        <li><strong>Transparencia:</strong> Publicaremos metodología, datos agregados y conclusiones al finalizar</li>
        <li><strong>Proporcionalidad:</strong> Solo recopilamos los datos necesarios para el experimento</li>
      </ul>

      <h2>2. Diseño del experimento WML 1.0</h2>
      <h3>2.1. Hipótesis</h3>
      <p>
        Investigamos cómo el comportamiento humano cambia cuando cada persona lleva una puntuación
        pública derivada del juicio anónimo de otros participantes.
      </p>

      <h3>2.2. Variables y medidas</h3>
      <ul>
        <li>Karma score (votos positivos menos negativos recibidos)</li>
        <li>Patrones de votación emitida (agregados, nunca atribuidos públicamente)</li>
        <li>Actividad de contenido (fotos, historias)</li>
        <li>Métricas de engagement (analítica agregada)</li>
      </ul>

      <h3>2.3. Salvaguardas implementadas</h3>
      <ul>
        <li>Anonimato del votante garantizado por diseño técnico (RLS en base de datos)</li>
        <li>Imposibilidad de votarse a uno mismo</li>
        <li>Restricción de edad (+18)</li>
        <li>Historias efímeras (24 h) para limitar exposición permanente</li>
        <li>Límite de 5 fotos con rotación FIFO</li>
        <li>Capacidad de moderación y suspensión de cuentas abusivas</li>
      </ul>

      <h2>3. Riesgos identificados y mitigación</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Riesgo</th>
            <th style={{ textAlign: 'left', padding: '10px 8px', color: '#f5f2ee' }}>Mitigación</th>
          </tr>
        </thead>
        <tbody style={{ color: '#c8c4be' }}>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Daño emocional por votos negativos</td>
            <td style={{ padding: '10px 8px' }}>Consentimiento explícito; retirada libre; canal de reporte</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Acoso o contenido dañino</td>
            <td style={{ padding: '10px 8px' }}>Normas de conducta; moderación; eliminación de cuentas</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <td style={{ padding: '10px 8px' }}>Re-identificación de votantes</td>
            <td style={{ padding: '10px 8px' }}>Políticas de acceso; solo el propio usuario ve sus votos emitidos</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 8px' }}>Manipulación del ranking</td>
            <td style={{ padding: '10px 8px' }}>Prohibición de bots; detección de cuentas múltiples</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Comité de supervisión</h2>
      <p>
        White Mirror Lab somete sus experimentos a revisión ética interna y, cuando el alcance lo
        requiere, a evaluación por comités de ética en investigación independientes conforme a la
        normativa europea aplicable a investigación con seres humanos.
      </p>

      <h2>5. Derecho a retirarse</h2>
      <p>
        Puedes abandonar el experimento en cualquier momento. Para solicitar la eliminación completa
        de tus datos: whitemirrorlab.info@gmail.com. Procesaremos las solicitudes en un plazo máximo de
        30 días.
      </p>

      <h2>6. Publicación de resultados</h2>
      <p>
        Los resultados se publicarán de forma abierta, con datos agregados y técnicas de
        anonimización. El objetivo es contribuir al debate público sobre reputación digital,
        juicio colectivo y diseño de plataformas sociales.
      </p>

      <div className="legal-contact-box">
        <p>
          <strong>Consultas éticas:</strong> whitemirrorlab.info@gmail.com
        </p>
      </div>
    </LegalShell>
  )
}
