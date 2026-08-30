import { LegalShell } from '@/components/legal/LegalShell'
import { LocalizedLegalContent } from '@/components/legal/LocalizedLegalContent'

export const metadata = {
  title: 'Terms of participation / Terminos - WML 1.0 Karma Score',
  description: 'Terms and conditions for participating in White Mirror Lab WML 1.0.',
}

export default function TerminosPage() {
  return (
    <LegalShell currentPath="/legal/terminos">
      <LocalizedLegalContent page="terms">
      <h1>Términos de participación</h1>
      <p className="legal-updated">
        Experimento WML 1.0 «Karma Score» · Versión 1.0 · Vigentes desde: 10 de junio de 2026
      </p>

      <p>
        Los presentes términos regulan la participación voluntaria en el experimento social
        WML 1.0 («Karma Score») conducido por White Mirror Lab. <strong>Al marcar la casilla de
        aceptación en el formulario de consentimiento y crear una cuenta, confirmas que eres mayor
        de 18 años, que has leído y comprendido íntegramente estos términos y que los aceptas sin
        reservas.</strong> Si no estás de acuerdo, no debes participar.
      </p>

      <h2>1. Naturaleza del experimento y advertencia previa</h2>
      <p>
        WML 1.0 es un experimento social de reputación digital de duración limitada en el que los
        participantes pueden votar positiva o negativamente a otros usuarios de forma anónima. El
        objetivo es estudiar cómo el comportamiento humano cambia cuando cada persona lleva una
        puntuación pública derivada del juicio anónimo colectivo.
      </p>
      <p>
        <strong>Advertencia:</strong> Este experimento está diseñado para generar incomodidad
        emocional como parte de su mecánica. Recibirás votos negativos de otros participantes de
        forma anónima y tu puntuación será visible públicamente dentro de la plataforma. Si
        consideras que este tipo de experiencia puede afectarte de forma significativa, te
        recomendamos no participar.
      </p>

      <h2>2. Requisitos de participación</h2>
      <p>Para participar en WML 1.0 debes cumplir todos los siguientes requisitos:</p>
      <ul>
        <li>Ser <strong>mayor de 18 años</strong> con plena capacidad legal de obrar</li>
        <li>Tener capacidad para otorgar el consentimiento informado exigido</li>
        <li>Proporcionar información veraz y actualizada en el registro (nombre de usuario, correo electrónico, edad y país)</li>
        <li>Haber aceptado el consentimiento informado, estos Términos, el <a href="/legal/etica">Marco ético</a> y la <a href="/legal/privacidad">Política de privacidad</a></li>
        <li>No tener una cuenta existente en el mismo experimento (prohibición de cuentas múltiples)</li>
      </ul>
      <p>
        White Mirror Lab se reserva el derecho de verificar el cumplimiento de estos requisitos y
        de suspender o eliminar cuentas que los incumplan, sin previo aviso ni obligación de
        indemnización.
      </p>

      <h2>3. Normas de conducta</h2>
      <p>
        Los participantes deben hacer un uso lícito, ético y responsable de la plataforma.
        Queda expresamente prohibido:
      </p>
      <ul>
        <li>Publicar contenido ilegal, violento, pornográfico, discriminatorio, difamatorio, que vulnere derechos de terceros o que infrinja la normativa aplicable</li>
        <li>Acosar, amenazar, intimidar o difamar a otros participantes dentro o fuera de la plataforma</li>
        <li>Crear cuentas múltiples o utilizar bots, scripts, automatizaciones o cualquier medio técnico para alterar artificialmente las votaciones o el ranking</li>
        <li>Intentar identificar la identidad de los votantes de forma contraria al diseño técnico del experimento</li>
        <li>Intentar acceder a datos de otros usuarios de forma no autorizada</li>
        <li>Realizar extracción masiva de datos (<em>scraping</em>) de la plataforma</li>
        <li>Publicar datos personales de terceros sin su consentimiento (<em>doxxing</em>)</li>
        <li>Usar la plataforma con fines distintos a la participación en el experimento</li>
      </ul>
      <p>
        White Mirror Lab se reserva el derecho de suspender o eliminar cuentas, moderar o retirar
        contenidos y adoptar las medidas técnicas o legales oportunas ante cualquier incumplimiento,
        sin previo aviso. Las infracciones graves pueden comunicarse a las autoridades competentes.
      </p>

      <h2>4. Contenido generado por usuarios</h2>

      <h3>4.1. Límites y reglas técnicas</h3>
      <ul>
        <li>Máximo de <strong>5 fotografías</strong> por cuenta. Al publicar una nueva cuando ya tienes 5, la más antigua se elimina automáticamente e irrevocablemente (política FIFO)</li>
        <li>Las <strong>historias</strong> son efímeras: se eliminan automáticamente a las 24 horas de su publicación</li>
        <li>Los <strong>pulses</strong> (publicaciones de texto) tienen un límite de 280 caracteres</li>
      </ul>

      <h3>4.2. Responsabilidad sobre el contenido</h3>
      <p>
        Eres el único responsable del contenido que publicas. Declaras y garantizas que:
      </p>
      <ul>
        <li>Eres titular de los derechos necesarios sobre el contenido publicado o cuentas con las autorizaciones pertinentes</li>
        <li>El contenido no infringe derechos de propiedad intelectual, imagen, honor, intimidad ni ningún otro derecho de terceros</li>
        <li>El contenido no es ilegal ni contrario a las normas de conducta indicadas en la cláusula 3</li>
      </ul>
      <p>
        Mantendrás indemne a White Mirror Lab frente a cualquier reclamación de terceros derivada
        del contenido que publiques.
      </p>

      <h3>4.3. Licencia sobre el contenido</h3>
      <p>
        Al publicar contenido en la plataforma, otorgas a White Mirror Lab una licencia no
        exclusiva, gratuita, sublicenciable a encargados del tratamiento, para reproducir,
        distribuir y comunicar públicamente dicho contenido <strong>exclusivamente en el ámbito del
        experimento</strong> (mostrar el contenido a otros participantes) y para incluir datos
        agregados y anonimizados en publicaciones de resultados. Esta licencia se extingue con la
        eliminación del contenido o de la cuenta, salvo para datos ya incorporados a publicaciones
        académicas en formato anonimizado.
      </p>

      <h2>5. Sistema de votación y karma</h2>
      <ul>
        <li>Cada participante puede emitir un único voto (positivo o negativo) por cada perfil, fotografía o pulse</li>
        <li>Los votos son <strong>anónimos por diseño técnico</strong>: ningún otro participante puede conocer tu identidad como votante</li>
        <li>Los votos positivos y negativos <strong>recibidos</strong> por cada usuario son visibles públicamente dentro de la plataforma</li>
        <li>La puntuación de karma (votos positivos menos negativos totales) es pública y determina el ranking</li>
        <li>Puedes cambiar o retirar tu voto en cualquier momento mientras el experimento esté activo</li>
        <li>Está prohibido votarse a uno mismo (imposibilidad técnica implementada)</li>
        <li>White Mirror Lab se reserva el derecho de anular votos que detecte como fraudulentos o generados por bots</li>
      </ul>

      <h2>6. Premio</h2>
      <p>
        El participante con mayor karma al cierre del experimento recibirá un premio cuya
        naturaleza y valor serán comunicados oficialmente en la plataforma y por correo electrónico
        antes del inicio del período de votación. El premio es personal e intransferible.
      </p>
      <p>
        White Mirror Lab se reserva el derecho de:
      </p>
      <ul>
        <li>Verificar la identidad del ganador y exigir documentación acreditativa de mayoría de edad</li>
        <li>Descalificar a participantes que hayan incumplido estos términos o el marco ético, aunque ostenten la mayor puntuación</li>
        <li>Declarar el premio desierto si se detecta manipulación generalizada del ranking que impida determinar un ganador legítimo</li>
        <li>Modificar la naturaleza o valor del premio por causas de fuerza mayor, comunicándolo con antelación razonable</li>
      </ul>
      <p>
        El premio está sujeto a la normativa fiscal española aplicable. El ganador es responsable
        de declarar el premio conforme a sus obligaciones tributarias.
      </p>

      <h2>7. Duración del experimento y cierre</h2>
      <p>
        La fecha de inicio y cierre del experimento se comunicarán en la plataforma. White Mirror
        Lab se reserva el derecho de prorrogar, acortar o finalizar anticipadamente el experimento
        por causas técnicas, legales o de investigación, con notificación previa razonable.
      </p>
      <p>
        Tras el cierre del experimento, la plataforma permanecerá accesible en modo solo lectura
        durante un período máximo de 30 días para que los participantes puedan acceder a sus datos,
        transcurridos los cuales se eliminarán los datos de cuenta conforme a la política de
        privacidad.
      </p>

      <h2>8. Retirada y eliminación de cuenta</h2>
      <p>
        Puedes retirarte del experimento en cualquier momento:
      </p>
      <ul>
        <li>Cerrando sesión y dejando de participar (tus datos permanecerán durante el período de conservación establecido)</li>
        <li>Solicitando la eliminación completa de tu cuenta y datos a support@whitemirrorlab.com (asunto: «Eliminación de cuenta WML 1.0»). Procesaremos la solicitud en un plazo máximo de 30 días.</li>
      </ul>
      <p>
        La retirada no afecta a la licitud del tratamiento realizado hasta ese momento ni a los
        datos ya anonimizados e incorporados a publicaciones de resultados.
      </p>

      <h2>9. Responsabilidad y limitación de responsabilidad</h2>
      <p>
        White Mirror Lab actúa como prestador de servicios de intermediación conforme a la LSSI-CE
        y el Reglamento (UE) 2022/2065 (Ley de Servicios Digitales — DSA). En consecuencia:
      </p>
      <ul>
        <li>No es responsable del contenido publicado por los usuarios, pero dispondrá de mecanismos de notificación y retirada de contenidos ilegales</li>
        <li>No garantiza la disponibilidad continua de la plataforma ni la ausencia de errores técnicos</li>
        <li>No se responsabiliza del impacto emocional derivado de recibir votos negativos, habida cuenta de que este impacto es inherente y conocido al aceptar participar</li>
        <li>Su responsabilidad total, en cualquier caso y por cualquier concepto, queda limitada al máximo que permita la legislación imperativa aplicable</li>
      </ul>

      <h2>10. Mecanismo de reporte y moderación</h2>
      <p>
        Si detectas contenido ilegal, conductas abusivas o infracciones de estos términos, puedes
        notificarlo a <strong>support@whitemirrorlab.com</strong> (asunto: «Reporte de contenido»)
        indicando el nombre de usuario o contenido afectado y una descripción del motivo.
        Atenderemos los reportes en un plazo razonable. Este mecanismo cumple con las obligaciones
        de notificación y acción («notice and action») del DSA para plataformas de tamaño pequeño.
      </p>

      <h2>11. Publicación de resultados</h2>
      <p>
        Al finalizar el experimento, White Mirror Lab publicará un informe con los resultados,
        metodología, datos agregados y conclusiones de forma abierta. Los datos se anonimizarán o
        seudonimizarán antes de su publicación. No se publicarán datos identificativos de
        participantes sin consentimiento expreso adicional.
      </p>

      <h2>12. Modificaciones de los términos</h2>
      <p>
        White Mirror Lab puede modificar estos términos durante el experimento. Los cambios
        sustanciales se notificarán con al menos 15 días de antelación por correo electrónico o
        mediante aviso destacado en la plataforma. La continuación en la participación tras la
        entrada en vigor de los cambios implica su aceptación. Si no aceptas los cambios, puedes
        solicitar la baja en los términos de la cláusula 8.
      </p>

      <h2>13. Legislación aplicable y resolución de conflictos</h2>
      <p>
        Estos términos se rigen por la legislación española y, en lo que resulte aplicable, por el
        Derecho de la Unión Europea. Para la resolución de controversias, y sin perjuicio de la
        normativa imperativa de protección de consumidores:
      </p>
      <ul>
        <li>Los consumidores de la UE pueden utilizar la plataforma ODR de la Comisión Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></li>
        <li>En los demás casos, las partes se someten a los juzgados y tribunales competentes conforme a las normas procesales vigentes</li>
      </ul>

      <div className="legal-contact-box">
        <p>
          <strong>Contacto:</strong> support@whitemirrorlab.com<br />
          Reportes: asunto «Reporte de contenido»<br />
          Baja: asunto «Eliminación de cuenta WML 1.0»<br />
          Consultas legales: asunto «Consulta legal WML»<br /><br />
          <a href="/legal/etica">Marco ético</a> ·{' '}
          <a href="/legal/privacidad">Privacidad</a> ·{' '}
          <a href="/legal/cookies">Cookies</a> ·{' '}
          <a href="/legal/aviso-legal">Aviso legal</a>
        </p>
      </div>
      </LocalizedLegalContent>
    </LegalShell>
  )
}
