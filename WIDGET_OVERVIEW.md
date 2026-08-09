# WML X.X.0 - Explicacion del widget

## Que es

WML X.X.0 es un widget de escritorio hecho con Electron, React y TypeScript. Su funcion principal es acompanar al usuario con una mascota flotante que vive encima del escritorio, muestra estado basico, gana puntos con la actividad y ofrece ayuda practica cuando detecta situaciones concretas.

El widget esta pensado para ser discreto: no debe saturar al usuario con recomendaciones constantes, no ejecuta acciones sin permiso y mantiene el analisis principal en local.

## Elementos principales

- Mascota flotante: aparece en una ventana transparente y siempre visible.
- Panel de ajustes: permite cambiar idioma, apariencia, mascota, colores, accesorios, IA local y sugerencias.
- Asistente de chat: permite hablar con la IA local para pedir acciones practicas o recomendaciones cuando la instalacion ha terminado.
- Sistema de sugerencias: muestra una unica recomendacion cuando hay una accion util que proponer.
- Tienda visual: el usuario gana puntos usando el ordenador y puede comprar especies, colores y accesorios.

## Comportamiento de la mascota

La mascota puede estar en varios estados:

- Activa: estado normal.
- Sentada: reduce la frecuencia de sugerencias.
- Dormida: aparece tras inactividad prolongada.
- Bateria baja o critica: depende del estado real de bateria cuando el sistema lo permite.
- Apagada por bateria: visualmente mantiene la animacion de dormida hasta que el usuario la revive.

La mascota reacciona a actividad local como clics y escritura. Esa actividad se usa como senal simple, no como contenido: el widget no lee lo que el usuario escribe.

La mascota no puede ocultarse desde el widget ni desde el menu contextual. Si se apaga por bateria, no recoge puntos mientras esta apagada.

## IA local

La IA local se prepara en el propio ordenador y no necesita que el usuario elija proveedor, modelo ni clave externa.

La IA local puede:

- Detectar ritmo de actividad.
- Observar nivel de bateria.
- Ver si la mascota esta sentada, dormida, activa u oculta.
- Detectar aplicaciones habituales por procesos conocidos.
- Detectar algunas senales de seguridad, como procesos con nombres sospechosos o proteccion en tiempo real de Microsoft Defender desactivada en Windows.
- Generar sugerencias practicas y accionables.
- Activar el asistente de chat cuando termina su instalacion.

La IA local no es un antivirus completo. Solo anade una capa de aviso y respuesta prudente dentro del widget.

## Instalacion de IA local

En Windows, el instalador generado con `npm run build:win` instala la aplicacion y abre WML. El usuario puede ver todo el widget desde el primer inicio excepto las funciones que dependen de la IA local completa.

La pantalla de ajustes muestra cuanto queda aproximadamente para que la IA local termine de instalarse. El nombre del motor interno no aparece en la interfaz.

## Requisitos de IA local

La IA local usa un runtime local compatible con Ollama y descarga un unico modelo local: `qwen3.5:4b`. No necesita clave API ni proveedor externo para chatear cuando el modelo ya esta instalado.

Requisitos recomendados:

- RAM recomendada: 8-16 GB.
- Disco recomendado: 15-30 GB libres para runtime, modelo, caches y trazas.
- Internet: necesario para descargar o reparar la IA local; no necesario para chatear una vez instalada.
- CPU/GPU: funciona en CPU, pero una GPU compatible mejora la latencia.

La pantalla de configuracion ya no pide elegir nivel de ordenador ni muestra el listado de capacidades. Muestra una unica IA Local, requisitos recomendados, estado de instalacion y modelo actual.

La IA Local puede:

- Hablar con el usuario y recordar nombre, especie, color y accesorio actual de la mascota.
- Analizar CPU, RAM, disco, bateria y apps/procesos seguros.
- Liberar RAM cerrando procesos seguros solo con confirmacion.
- Limpiar cache y archivos temporales antiguos.
- Revisar archivos sospechosos sin ejecutarlos, calcular senales basicas y proponer borrado seguro con confirmacion.
- Abrir o enfocar apps habituales detectadas localmente.
- Usar memoria local, trazas y herramientas observacionales para responder con mas contexto.

Durante la instalacion:

- La mascota, ajustes, apariencia, tienda y sugerencias basicas siguen visibles.
- El boton del asistente queda desactivado.
- La ventana de instalacion de WML muestra progreso y tiempo aproximado.
- El runtime de IA se prepara en segundo plano sin abrir ventanas propias.
- Si el ordenador esta sin internet, la preparacion queda pausada dentro de WML y se puede reintentar cuando vuelva la conexion.
- Si se cierran las ventanas de WML y queda solo la mascota, la descarga continua en segundo plano.
- Si se cierra la mascota, WML cierra sus ventanas y pausa la descarga hasta que el usuario vuelva a abrir WML.

Antes de marcar la IA como lista, WML arranca el servidor local, comprueba que el modelo existe, hace warmup y envia un mensaje real de prueba. Solo si recibe una respuesta valida desbloquea el asistente.

Al abrir el asistente tambien se revalida el estado real de la IA. Si la app se ha cerrado, el ordenador se ha suspendido o el modelo necesita recalentarse, el campo de escritura permanece bloqueado hasta que la IA vuelva a estar lista.

Cuando la instalacion termina, el asistente y la IA local completa se pueden usar con normalidad. Tras marcarla como lista, WML mantiene el modelo caliente de forma periodica para reducir esperas en los primeros mensajes.

En temas publicos sensibles como politica, religion, ideologias y asuntos sociales delicados, la IA responde de forma neutral, factual y breve. Si el usuario pide una opinion personal, redirige a resumir perspectivas o comparar fuentes, sin adoptar una postura propia. Esta regla no afecta a gustos inocuos de la mascota, como si le gusta su color, ropa o accesorio actual.

## Rendimiento de IA

La IA conserva una arquitectura de agente local: servidor en localhost, modelo local, memoria breve, herramientas observacionales y acciones cerradas con confirmacion.

Para que el widget responda rapido, no todas las preguntas pasan por el modelo:

- Saludos, identidad de la mascota y preguntas de capacidades se responden con rutas locales inmediatas.
- Limpiar temporales/cache, liberar RAM, analizar estado del PC y revision rapida de seguridad usan datos locales deterministas y muestran la tarjeta de accion sin esperar al modelo.
- Las preguntas complejas siguen usando el modelo y, si hace falta, una herramienta observacional antes de responder.
- Las respuestas del modelo usan contexto y salida acotados para evitar esperas largas.
- Si una respuesta generativa no termina correctamente, no se muestra texto cortado como respuesta valida.

## Privacidad

El widget evita enviar datos innecesarios fuera del dispositivo.

El estado enviado a la IA local se reduce a datos como:

- Chat normal: idioma, nombre del usuario si se conoce, identidad/aspecto de la mascota y los dos ultimos turnos.
- Mascota/apariencia: identidad/aspecto minimo.
- Sistema/optimizacion: observacion concreta del sistema, bateria basica y permiso de acciones.
- Seguridad/archivos: observacion concreta de seguridad o archivo, modo privado, permiso de acciones y ultima senal relevante.
- Workspace/apps: observacion concreta de workspace y permiso de acciones.

No envia el texto que el usuario escribe en otras aplicaciones, archivos personales ni contenido de ventanas.

El modo privado pausa el seguimiento local de actividad para sugerencias normales.

## Sugerencias

El widget esta disenado para no abrumar.

Reglas de frecuencia:

- Solo muestra una sugerencia a la vez.
- Como maximo una sugerencia normal cada 5 minutos.
- Si la mascota esta sentada, como maximo una sugerencia normal cada 10 minutos.
- Si la mascota esta dormida o apagada por bateria, no genera sugerencias nuevas, salvo alertas criticas de seguridad o si ya habia una sugerencia abierta.
- Las alertas criticas de seguridad pueden aparecer inmediatamente, aunque hubiera aparecido otra sugerencia hace poco.
- Una alerta critica puede reemplazar una sugerencia anterior.

Las sugerencias normales respetan los ajustes de IA local, sugerencias y modo privado. Las alertas criticas de seguridad pueden mostrarse aunque las sugerencias normales esten pausadas.

## Acciones que puede sugerir

El widget solo puede sugerir acciones que sabe ejecutar. Al aceptar, no se queda en texto: ejecuta la accion asociada.

Acciones disponibles:

- Abrir o enfocar aplicaciones habituales detectadas localmente.
- Cerrar aplicaciones o procesos seguros no criticos en segundo plano para ahorrar bateria o liberar RAM.
- Limpiar archivos temporales antiguos.
- Analizar CPU, RAM, disco, bateria y procesos seguros sin cambiar nada.
- Abrir la herramienta oficial de seguridad del sistema cuando esta disponible.
- Revisar archivos sospechosos con analisis estatico basico sin ejecutarlos.

Cuando una accion puede afectar al usuario, la sugerencia lo advierte antes. Por ejemplo, al cerrar apps en segundo plano indica que podria perderse trabajo no guardado.

## Acciones que no hace automaticamente

El widget no debe:

- Cambiar sus propios ajustes de configuracion desde una sugerencia o desde el asistente.
- Activar o desactivar por si mismo la IA local, las sugerencias o el modo privado.
- Cerrar WML X.X.0 o recomendar cerrar su propia ventana.
- Ejecutar texto libre generado por el modelo como comando.
- Borrar documentos personales.
- Tomar decisiones sensibles sin confirmacion.

Si el usuario pide cambiar configuracion del propio widget, el asistente puede recomendar que lo haga desde ajustes, pero no aplica ese cambio automaticamente.

## Seguridad

El widget incluye comprobaciones locales simples:

- Busca senales locales simples de riesgo y archivos con nombres sospechosos en zonas de usuario/temporales.
- En Windows, puede comprobar si Microsoft Defender tiene la proteccion en tiempo real desactivada.
- Ante una senal critica, prioriza una alerta y propone abrir la herramienta oficial de seguridad del sistema.
- Puede calcular hashes y revisar extensiones/patrones de un archivo indicado por el usuario sin ejecutarlo.

Limitacion importante: esto no sustituye a Microsoft Defender, un EDR o un antivirus profesional. Sirve como aviso adicional y como acceso rapido a una accion segura.

## Empaquetado

El proyecto tiene scripts de empaquetado por plataforma:

- `npm run build:win`: genera instalador Windows `.exe` con NSIS.
- `npm run build:linux`: genera `zip`, `AppImage` y `.deb` en un entorno Linux con herramientas de empaquetado disponibles. Desde Windows se puede generar el `zip` Linux; `AppImage` puede requerir soporte de symlinks y `.deb` requiere `fpm`.
- `npm run build:mac`: genera `.dmg` y `.zip`.

Antes de empaquetar, cada script limpia los artefactos previos de su plataforma para evitar errores como carpetas temporales bloqueadas.

El empaquetado Windows usa explicitamente `electron-builder --win nsis --x64 --publish never`. Si se queda en `packaging`, normalmente hay una instancia de WMLXX0/Electron o una carpeta antigua en `dist/win-unpacked*` bloqueada por Windows. Cierra la app, termina procesos Electron/WMLXX0 si siguen abiertos, y vuelve a ejecutar `npm run package:win`. El artefacto esperado es `dist/wml-xx0-1.0.1-setup.exe`.

## Instalacion en Linux

El artefacto Linux generado desde Windows es `dist/wml-xx0-1.0.1-linux-x64.zip`.

Para instalarlo/ejecutarlo en Linux:

```bash
unzip wml-xx0-1.0.1-linux-x64.zip
cd linux-unpacked
chmod +x WMLXX0
./WMLXX0
```

En el primer arranque necesita internet para descargar o reparar la IA local. Cuando Ajustes muestre la IA local lista, el asistente funciona localmente contra localhost.

Nota: el build de macOS debe ejecutarse en macOS para generar correctamente los artefactos de Mac. Linux puede requerir herramientas del sistema segun el entorno.

## Tecnologias usadas

- Electron para la aplicacion de escritorio.
- React para la interfaz.
- TypeScript para tipado.
- electron-store para persistencia local.
- systeminformation para bateria y datos del sistema.
- ps-list para detectar procesos.
- electron-builder para generar instaladores.

## Resumen rapido

WML X.X.0 es una mascota de escritorio con IA local y asistente integrado. Observa senales basicas del dispositivo, protege la privacidad por defecto, sugiere pocas acciones y siempre pide confirmacion antes de actuar. Su objetivo es ahorrar tiempo, cuidar la bateria, ayudar con pequenas optimizaciones y alertar ante posibles riesgos de seguridad sin convertirse en una herramienta invasiva.
