# Revisión — 28/09/2026

Se conserva el trabajo previo y no se atribuyen como nuevos los cambios del informe del 27/09. Se ha analizado la sintaxis y el grafo de imports de todo el código propio de la web y del widget, con revisión manual de los flujos críticos, TypeScript y suites de regresión. No se han modificado CSS, imágenes ni la estructura de las pantallas.

Se excluyen dependencias, ejecutables y carpetas generadas del inventario de código propio. La comprobación de hashes de 62 archivos visuales de código confirma que conservan su contenido durante esta revisión.

## Correcciones de esta revisión

- Stripe Pro: precios/portal automáticos cuando faltan IDs/enlace; validación de firma/URL antes de cobrar; detección de suscriptores existentes mediante el portal con email verificado; bloqueo del doble clic.
- Retorno: conserva el origen entre dominios con/sin `www` para no perder cookies HttpOnly. Localhost solo se admite en desarrollo; se rechazan orígenes ajenos.
- Entrega: descarga gratuita y recibo Pro comparten el enlace de GitHub en `src/lib/widgetDownload.ts`. El instalador normal admite Pro mediante `pro-license.json`, entregado por la web tras verificar Stripe. Retirada la copia local y la integración R2 añadidas para Pro al confirmar el flujo de publicación existente en GitHub.
- Webhooks: estructura de eventos firmados malformados validada y entrega independiente de su recepción.
- Widget: timeout/backoff de revalidación, actualización de estado al renovar, recuperación de archivos caducados si la suscripción sigue pagada y protección frente a reloj adelantado/respuestas antiguas durante una importación.
- Licencias: archivos sin dispositivo no desbloquean Pro cuando está configurada la activación remota; una firma heredada no permite añadir vinculación sin firmar; el servidor no puede cambiar el sujeto de una licencia al devolverla.
- Persistencia: historial/memoria toleran datos dañados y conservan entradas válidas; no se restauran acciones ejecutables desde mensajes persistidos.
- IA híbrida: fallos al cambiar la conectividad tratados sin rechazos de promesas sin controlar.
- Brevo: límites de tiempo en las peticiones del módulo compartido.

## Limpieza

- Unificados formato de precios, escape HTML/XML, escucha de anuncios y normalización de mascota, conservando sus resultados.
- Eliminada la duplicación del payload heredado de licencia y del parser `.env.pro`, y las banderas Pro sin consumidores.
- El parser del widget admite valores entre comillas y respeta las variables del proceso.
- El comando habitual del widget `npm run build:win` prepara firma/activación y genera y verifica el instalador normal con Pro integrado. Se publica en GitHub como hasta ahora. Los alias Pro utilizan el mismo comando.
- ESLint/TypeScript de la web excluyen otros checkouts de `.kilo`.
- Sin imports rotos ni archivos de `src` inalcanzables desde sus entradas. TS/JS del worker se mantienen como entradas de despliegue alternativas; las migraciones históricas no se eliminan.

## Verificación

- Web: 68 pruebas aprobadas, ESLint sin errores y compilación de producción correcta con 46 rutas/páginas.
- Comprobación HTTP de producción local: páginas de compra/recibo/marketplace, rechazo de descargas sin cookie y cabeceras de seguridad. Las pruebas de ambos planes verifican ahora la redirección del instalador al enlace GitHub compartido.
- Widget: diez suites locales, incluyendo firma, activación, renovación, revocación y carreras de importación; TypeScript de main/preload/shared/renderer y compilación Electron/Vite.
- Comprobación adicional de `noUnusedLocals` y `noUnusedParameters` en ambos proyectos.
- `npm run build:win` ejecutado completo y aprobado: instalador normal, entradas presentes, clave pública/activación coincidentes y ningún PEM privado ni `.env` incluido. Retirado el paso de copia a WML para conservar la publicación en GitHub.
- Los avisos Prettier preexistentes del widget no se corrigen con un formateo masivo; no son errores de ejecución.

## Límites

No se han probado pagos contra Stripe real porque faltan sus credenciales. No se ha cambiado el despliegue de la web, aplicado migraciones remotas, enviado correos a usuarios ni instalado el ejecutable sobre el perfil del usuario. Los pagos se verifican con Stripe simulado; la licencia se comprueba con el código real del widget extraído para la prueba.

No hay subida R2 pendiente para Pro: esa vía se ha retirado y se conserva GitHub para descargar el widget. La configuración R2 preexistente del marketplace se conserva.

Se mantienen los límites de arquitectura previos: estado en memoria de FARO/marcador/rate limits entre instancias, moderación destacada sin transacción compartida, recuperación sin autoservicio de transferencias y periodo offline ya firmado. Resolverlos completamente requiere persistencia o cambios de producto/despliegue adicionales. Las correcciones y defensas no garantizan la ausencia de cualquier error futuro.
