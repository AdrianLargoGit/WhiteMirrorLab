import { LegalShell } from '@/components/legal/LegalShell'

export const metadata = { title: 'Términos de participación — WML 1.0' }

export default function TerminosPage() {
  return (
    <LegalShell currentPath="/legal/terminos">
      <h1>Términos de participación</h1>
      <p className="legal-updated">Experimento WML 1.0 «Karma Score» · Última actualización: 10 de junio de 2026</p>

      <p>
        Los presentes términos regulan la participación voluntaria en el experimento social WML 1.0
        conducido por White Mirror Lab. Al aceptar el consentimiento informado y crear una cuenta,
        confirmas que has leído, comprendido y aceptado estos términos.
      </p>

      <h2>1. Naturaleza del experimento</h2>
      <p>
        WML 1.0 es un experimento social de reputación digital de duración limitada. Los
        participantes pueden votar positiva o negativamente a otros usuarios de forma anónima.
        El objetivo es estudiar el comportamiento humano ante el juicio colectivo digitalizado.
      </p>

      <h2>2. Requisitos de participación</h2>
      <ul>
        <li>Ser mayor de <strong>18 años</strong></li>
        <li>Disponer de capacidad legal para contratar</li>
        <li>Proporcionar información veraz en el registro</li>
        <li>Aceptar el consentimiento informado y estos términos</li>
        <li>No crear cuentas múltiples con el fin de manipular el experimento</li>
      </ul>

      <h2>3. Reglas de conducta</h2>
      <p>Queda prohibido:</p>
      <ul>
        <li>Subir contenido ilegal, violento, sexual explícito, discriminatorio o que vulnere derechos de terceros</li>
        <li>Acosar, amenazar o difamar a otros participantes</li>
        <li>Usar bots, scripts o cuentas falsas para alterar votaciones</li>
        <li>Intentar identificar a los votantes de forma contraria al diseño del experimento</li>
        <li>Extraer datos masivos de la plataforma (scraping)</li>
      </ul>
      <p>
        White Mirror Lab se reserva el derecho de suspender o eliminar cuentas que incumplan estas
        normas sin previo aviso.
      </p>

      <h2>4. Contenido generado por usuarios</h2>
      <ul>
        <li>Puedes subir un máximo de <strong>5 fotografías</strong>; al subir una nueva cuando ya tienes 5, la más antigua se elimina automáticamente</li>
        <li>Las <strong>historias</strong> desaparecen automáticamente a las 24 horas</li>
        <li>Concedes a White Mirror Lab una licencia no exclusiva para mostrar tu contenido dentro del experimento y en análisis agregados publicados</li>
        <li>Eres responsable del contenido que publicas</li>
      </ul>

      <h2>5. Sistema de votación y karma</h2>
      <ul>
        <li>Los votos son <strong>anónimos</strong>: ningún participante puede ver a quién has votado</li>
        <li>Los votos positivos y negativos <strong>recibidos</strong> son visibles públicamente</li>
        <li>El karma (puntuación neta) determina el ranking; el participante con mayor karma al cierre del experimento recibirá el premio comunicado</li>
        <li>Puedes cambiar o retirar tu voto mientras el experimento esté activo</li>
      </ul>

      <h2>6. Premio</h2>
      <p>
        El premio para el participante con mayor karma al finalizar el experimento será comunicado
        en la plataforma y por email. White Mirror Lab se reserva el derecho de verificar la
        identidad del ganador y descalificar participantes que hayan incumplido estos términos.
      </p>

      <h2>7. Retirada y baja</h2>
      <p>
        Puedes retirarte del experimento en cualquier momento cerrando sesión o solicitando la
        eliminación de tu cuenta y datos en whitemirrorlab.info@gmail.com. La retirada no afecta a la
        licitud del tratamiento realizado hasta ese momento.
      </p>

      <h2>8. Publicación de resultados</h2>
      <p>
        Al finalizar el experimento, White Mirror Lab publicará un informe con datos agregados y
        anonimizados. No se publicarán datos personales identificables sin consentimiento expreso
        adicional.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        El experimento puede generar incomodidad emocional derivada de recibir valoraciones
        negativas. Esta incomodidad es parte del diseño experimental. No obstante, White Mirror
        Lab prohíbe el acoso y dispone de canales para reportar abusos. El servicio se presta «tal
        cual» dentro de los límites legales aplicables.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Podemos actualizar estos términos durante el experimento. Los cambios sustanciales serán
        comunicados con antelación razonable. La participación continuada implica aceptación.
      </p>

      <h2>11. Contacto</h2>
      <div className="legal-contact-box">
        <p>whitemirrorlab.info@gmail.com · <a href="/legal/etica">Marco ético</a> · <a href="/legal/privacidad">Privacidad</a></p>
      </div>
    </LegalShell>
  )
}
