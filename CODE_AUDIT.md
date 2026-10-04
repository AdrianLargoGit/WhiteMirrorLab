# Revisión de código — 27/09/2026

Se han conservado los cambios previos y concurrentes del espacio de trabajo. Esta revisión no rediseña las pantallas ni añade flujos de producto. No se han desplegado servicios ni ejecutado migraciones remotas.

## Correcciones realizadas

- Navbar: la zona invisible bajo un grupo cerrado ya no captura el puntero; la apertura por ratón comienza en el botón. Archivo y TOOLS comparten un único estado y en móvil solo se monta el panel seleccionado. Se mantiene la navegación por teclado y Escape.
- API: validación de objetos JSON, tipos, tamaños y puntuaciones antes de acceder a servicios; respuestas controladas ante datos incorrectos y fallos de red.
- Marketplace: un único analizador ZIP para cliente y servidor, controles de estructura, rutas, enlaces simbólicos y límites declarados de expansión. El relay verifica los bytes recibidos y las claves de subida incluyen un identificador generado por el servidor.
- Envíos y moderación: bloqueo de envíos duplicados y selección asíncrona de archivos; transiciones de aprobación condicionadas al estado vigente; rechazo antes de borrar recursos, conservando referencias si falla la limpieza.
- Descargas: corrección de la cancelación prematura del efecto y liberación de recursos; limpieza de PDF incluso ante errores o cancelación.
- Juego: validación de partidas guardadas, almacenamiento que tolera restricciones del navegador, limpieza de controles al perder foco y reducción de envíos redundantes del marcador.
- Idiomas: contexto inicial coherente entre servidor y navegador, rutas anidadas del archivo y simplificación de redirecciones.
- Consentimiento: inicialización de analítica solo con consentimiento y sincronización de revocación entre pestañas; banner tolerante a almacenamiento bloqueado.
- Licencias: fechas mensuales sin desbordar al mes siguiente, tratamiento de licencias caducadas y errores externos.
- FARO: cálculo de las 20:00 de Madrid teniendo en cuenta el horario de verano.
- Mantenimiento: extracción de código repetido de anuncios y detección de dispositivo; limpieza de observadores, componentes sin efecto, módulos sin referencias y la dependencia no utilizada @supabase/ssr.

## Verificación completada

- `npm test`: 38 pruebas aprobadas, ninguna fallida; 23 pruebas nuevas de fiabilidad y ZIP junto con las 15 existentes.
- `npm run lint`: correcto, sin advertencias.
- TypeScript del proyecto y comprobación separada de las tres funciones de licencias: correctos.
- `npm run build`: compilación de producción correcta, 37 páginas generadas.
- `git diff --check`: correcto.
- Grafo de referencias: los 13 archivos eliminados no eran alcanzables desde las entradas activas de la aplicación.
- Navegador: exclusión mutua Archivo/TOOLS en móvil en ambos sentidos; controles de escritorio y zona inferior; página inglesa sin errores de consola observados. No se ha realizado una comparación automática de píxeles de todas las pantallas.

## Cambios de base de datos preparados, no aplicados

- `supabase/migrations/014_marketplace_access.sql`: restringe el acceso REST directo a products. Aplicar al proyecto que contiene el marketplace y comprobar antes que el servidor dispone de MARKETPLACE_SUPABASE_SERVICE_ROLE_KEY; las operaciones actuales solicitan esa clave, pero el cliente admite una clave anónima como alternativa.
- `supabase/migrations/015_license_device_limit.sql`: añade un control de concurrencia para las activaciones. Aplicar al proyecto que contiene pro_licenses y pro_license_activations, después de su esquema existente.

Se separan porque el marketplace y las licencias pueden apuntar a proyectos distintos. Estas migraciones necesitan validación en una base de datos de pruebas antes de producción. Los cambios de las funciones Supabase y del worker Cloudflare también requieren su despliegue correspondiente.

## Límites y asuntos pendientes de arquitectura

No se han ejecutado pagos reales, enviado correos de prueba a terceros ni probado activaciones contra producción. Las pruebas de las API aíslan las dependencias externas.

FARO, el marcador y algunos límites de peticiones mantienen estado en memoria: un reinicio o varias instancias pueden perderlo o divergir. Resolverlo requiere elegir y configurar persistencia compartida.

La recuperación de licencias por dirección de correo no acredita por sí sola la propiedad del buzón. Requiere un flujo de verificación específico, que cambiaría el funcionamiento actual.

La asignación de puestos destacados del marketplace sigue usando varias operaciones y puede competir entre administradores simultáneos. Debe trasladarse a una transacción de base de datos.

El límite de bytes del relay se comprueba; no equivale a imponer ese límite en todas las subidas directas firmadas al almacenamiento. Los controles ZIP verifican metadatos y estructura, no la extracción completa ni el contenido de cada paquete.

Las comprobaciones realizadas reducen errores concretos; no garantizan la ausencia de cualquier error futuro.

## Archivos eliminados

1. src/app/p/[username]/PublicProfile.module.css
2. src/app/p/[username]/PublicProfileActions.module.css
3. src/app/p/[username]/PublicProfileActions.tsx
4. src/app/p/[username]/PublicProfileIdentity.tsx
5. src/components/wml/SpainWorldCupBadge.tsx
6. src/hooks/useCurrentUser.ts
7. src/lib/auth-errors.ts
8. src/lib/authcontext.tsx
9. src/lib/database.types.ts
10. src/lib/queries.ts
11. src/lib/supabase.ts
12. src/lib/votes.ts
13. src/lib/zipSafety.ts

Son archivos versionados que han quedado marcados como eliminados en Git. Los scripts temporales usados para editar y analizar también se han retirado; se conservan los tests de regresión.
