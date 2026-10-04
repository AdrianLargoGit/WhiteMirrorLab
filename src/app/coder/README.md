# Coder: repositorios dinámicos de GitHub

La biblioteca está en `/coder` y `/en/coder`, en **TOOLS → Herramientas → Coder**.

## Añadir un repositorio: solo necesitas la URL

Edita **`src/data/coder-repositories.ts`**, dentro del array **`coderRepositories`**, y añade:

```ts
  { url: 'https://github.com/propietario/repositorio' },
```

El nombre, descripción, avatar del propietario, estrellas, forks, seguidores (watchers reales, no estrellas), lenguaje, licencia, temas, web, fechas, rama principal, estado archivado y condición de fork se obtienen automáticamente desde la API de GitHub. El contador de incidencias incluye issues y pull requests abiertos, como en la API, y está etiquetado así. La descripción se muestra en el idioma original del repositorio; no se traduce automáticamente.

## Marcar como recomendado 🔥

```ts
  { url: 'https://github.com/propietario/repositorio', recommended: true },
```

Los recomendados aparecen primero en **Todos** y en cualquier filtro en el que coincidan, con un fueguito. Dentro de cada grupo se conserva el orden del array. El botón «Recomendados» permite ver solo esos proyectos. Para quitar la recomendación, elimina `recommended` o usa `false`.

La categoría se detecta automáticamente a partir del nombre, los temas y la descripción de GitHub. Las señales específicas, como seguridad, multimedia o logística, tienen prioridad sobre menciones genéricas a IA o tecnología. El lenguaje por sí solo no determina la categoría. Si quieres fijarla manualmente, puedes añadir una propiedad opcional:

```ts
  { url: 'https://github.com/propietario/repositorio', category: 'development' },
```

Categorías: `development`, `web`, `data`, `automation`, `ai`, `learning`, `infrastructure`, `security`, `media`, `business`.

Usa URLs HTTPS de repositorios públicos (`https://github.com/owner/repo`), también se acepta `.git` y barra final. No añadas rutas a archivos, `/tree`, perfiles ni URLs de otras webs. Las URLs repetidas se unifican. No necesitas editar las tarjetas ni introducir cifras o imágenes.

## Actualización y disponibilidad

- Las peticiones se hacen en el servidor. Next.js conserva los datos durante una hora; se revalidan cuando vuelve a consultarse la biblioteca. No es un contador de estrellas en tiempo real ni requiere un despliegue para actualizar las cifras.
- Se consultan hasta cuatro repositorios a la vez, con un timeout de ocho segundos por petición.
- Si hay un error, las cifras desconocidas aparecen como `—`, nunca como ceros inventados. Se mantiene la última información buena si existe en la memoria de esa instancia y se indica que está desactualizada. Si un repositorio devuelve 404 o es privado, no se muestran sus datos.
- Los errores tienen una pausa mínima de un minuto antes de volver a consultar. Se respetan los límites y el tiempo de espera de GitHub. El botón de volver a comprobar vuelve a consultar respetando esa pausa.
- Si falla el avatar, se muestran las iniciales como alternativa.

Funciona sin token para repositorios públicos. GitHub limita las peticiones sin autenticación a 60 por hora por IP. Para una web con más tráfico o un catálogo mayor, configura **`CODER_GITHUB_TOKEN`** en `.env.local` y en las variables del servidor de producción. Basta acceso de lectura de metadatos de repositorios públicos. Nunca uses un prefijo `NEXT_PUBLIC_`: el token no se envía al navegador. Reinicia el servidor al cambiar esta variable.

Fuentes: [API de repositorios](https://docs.github.com/en/rest/repos/repos#get-a-repository) y [límites de GitHub](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

Guardar el catálogo actualiza el desarrollo local. Para añadir enlaces o cambiar recomendaciones en la web publicada, despliega los cambios. Los datos de GitHub se actualizan después por sí mismos.

Validación del cargador: `node --test scripts/coder-repositories.test.mjs`.
