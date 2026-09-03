# White Mirror Lab

Web oficial de White Mirror Lab, un laboratorio de experimentacion social que crea aplicaciones temporales para observar comportamiento colectivo, reputacion digital, identidad online y etica tecnologica.

La web combina la landing publica del laboratorio con el primer experimento activo, WML 1.0 / Karma Score, la pagina de descarga del widget de escritorio WML X.X.0, el marketplace de skins para creadores, paginas legales, contacto, blog y paneles internos de administracion.

## Que incluye

- Landing bilingue en espanol e ingles para presentar el manifiesto, metodologia, areas de investigacion y experimentos.
- WML 1.0 / Karma Score, un experimento social de reputacion digital con perfiles, feed, ranking, historias, fotos y votos anonimos.
- Paginas publicas de perfil para compartir participantes y recibir votos.
- Descarga de WML X.X.0, una mascota flotante para Windows con suscripcion previa y consentimiento informado.
- Marketplace de skins y packs de creadores para WML X.X.0, con subida, revision, pago o descarga.
- Integracion con Supabase, Cloudflare R2, Stripe Connect, Brevo y PostHog.
- Documentacion legal: privacidad, cookies, aviso legal, terminos y marco etico.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Cloudflare R2
- Stripe Marketplace
- Brevo
- PostHog

## Desarrollo local

Instala dependencias:

```bash
npm install
```

Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Rutas principales

- `/` - Landing de White Mirror Lab.
- `/web` - Redireccion al feed de WML 1.0.
- `/web/consent` - Consentimiento informado del experimento.
- `/web/feed` - Feed privado de participantes.
- `/web/ranking` - Ranking de Karma Score.
- `/p/[username]` - Perfil publico compartible.
- `/descargar` - Descarga del widget WML X.X.0.
- `/plantilla-skins` - Kit para creadores de skins.
- `/marketplace` - Marketplace de skins.
- `/marketplace/submit` - Envio de productos para revision.
- `/experimentos` - Archivo de experimentos.
- `/blog` - Blog editorial.
- `/faro` - FARO.
- `/contacto` - Formulario de contacto.

## Variables de entorno

El proyecto usa variables de entorno para Supabase, marketplace, pagos, email, analitica y almacenamiento. Revisa los modulos de `src/lib` y las rutas de `src/app/api` antes de desplegar para configurar las claves necesarias de:

- Supabase
- Marketplace Supabase
- Cloudflare R2
- Stripe
- Brevo
- PostHog
- FARO

No subas secretos reales al repositorio.
