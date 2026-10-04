# Variables de entorno de WML

Revisión de `.env.local` del 2 de octubre de 2026: 28 entradas tras retirar la analítica de terceros. Se conservaron los valores restantes, incluido el par de licencias Ed25519. No se incluyen secretos en este documento.

Una variable usada no es necesariamente obligatoria: algunas personalizan un valor predeterminado, habilitan una función concreta o se usan únicamente como alternativa. Esta revisión comprueba los consumidores del código local; no acredita que las credenciales funcionen ni modifica el entorno del despliegue.

## Variables conservadas

| Variable | Uso y necesidad |
| --- | --- |
| `BREVO_API_KEY` | Necesaria para suscripciones, consultas de listas y envío de emails mediante Brevo. |
| `BREVO_LIST_ID_GENERAL` | Lista general para suscripciones y contador; también sirve de alternativa para las invitaciones de FARO. |
| `BREVO_LIST_ID_SOCIAL` | Segmentación y contador de la lista social. |
| `BREVO_LIST_ID_TECH` | Segmentación y contador de la lista de tecnología. |
| `FARO_BREVO_LIST_ID` | Lista específica de FARO y selección de destinatarios de las invitaciones. |
| `FARO_FROM_EMAIL` | Remitente de las invitaciones de FARO; necesario si no se configura el remitente alternativo de Brevo. |
| `FARO_FROM_NAME` | Nombre del remitente de FARO; opcional, con valor predeterminado. |
| `FARO_ADMIN_SECRET` | Autoriza la edición administrativa de FARO. |
| `FARO_CRON_SECRET` | Autoriza las peticiones de envío de invitaciones de FARO. Debe coincidir con el secreto del programador que invoque la ruta. |
| `FARO_PASSWORD_SECRET` | Firma la contraseña diaria y la selección del destinatario. Conservar el secreto configurado para estas operaciones. |
| `MARKETPLACE_SUPABASE_URL` | Dirección de la base de datos del marketplace. |
| `MARKETPLACE_SUPABASE_SERVICE_ROLE_KEY` | Clave que solicitan las consultas actuales del marketplace, realizadas en el servidor. |
| `MARKETPLACE_SUPABASE_ANON_KEY` | Alternativa admitida por el cliente de Supabase si falta la clave de servicio. Con la configuración actual se prioriza la de servicio; el acceso con la anónima depende de las políticas de la base de datos. |
| `MARKETPLACE_ADMIN_TOKEN` | Autoriza la administración y los archivos reservados a revisión. |
| `MARKETPLACE_MAX_IMAGE_BYTES` | Personaliza el límite de tamaño de imágenes; si falta, se admiten hasta 8 MiB. |
| `MARKETPLACE_MAX_ZIP_BYTES` | Personaliza el límite de tamaño de ZIP; si falta, se admiten hasta 80 MiB. |
| `CLOUDFLARE_R2_UPLOAD_WORKER_URL` | Dirección del Worker utilizado actualmente para subir, descargar y borrar archivos del marketplace. |
| `CLOUDFLARE_R2_UPLOAD_WORKER_SECRET` | Secreto compartido con el Worker para autorizar peticiones y firmar subidas. |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Identifica la cuenta en la alternativa de acceso directo a R2 por S3. |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Credencial de la alternativa de acceso directo a R2 por S3. |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Secreto de la alternativa de acceso directo a R2 por S3. |
| `CLOUDFLARE_R2_BUCKET` | Bucket de la alternativa de acceso directo a R2 por S3. |
| `NEXT_PUBLIC_SITE_URL` | URL de la web para los enlaces de invitaciones de FARO; también es alternativa al origen específico de Pro. |
| `STRIPE_SECRET_KEY` | Pagos del marketplace; también es alternativa para Pro si falta su clave específica. |
| `WML_PRO_STRIPE_SECRET_KEY` | Clave específica de Stripe para Pro. Tiene prioridad sobre la general; los dos valores actuales son distintos. |
| `WML_PRO_FROM_EMAIL` | Remitente verificado de Brevo para enviar la nueva licencia tras un pago confirmado. |
| `WML_PRO_SITE_URL` | Origen de Pro, retornos de pago y URL de activación preparada para el widget. Se conserva aunque ahora coincida con la URL general. |
| `WML_PRO_LICENSE_PRIVATE_KEY` | Clave Ed25519 necesaria para firmar licencias en el servidor. |
| `WML_PRO_LICENSE_PUBLIC_KEY` | Comprueba que la firma corresponde al par configurado; se comparte con el widget para verificar licencias. Mantener el mismo par. |

Cuando están configuradas la URL y el secreto del Worker, las operaciones de R2 usan el Worker. Las cuatro variables de acceso S3 conservadas se usan cuando falta esa configuración; no constituyen un reintento automático si el Worker falla.

## Entradas eliminadas

| Variable | Motivo |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_WML_1_0` | Sin consumidores en el código actual; pertenecía al antiguo módulo WML 1.0. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY_WML_1_0` | Sin consumidores en el código actual; pertenecía al antiguo módulo WML 1.0. |
| `WML_PRO_STRIPE_MONTHLY_PRICE_ID` | Estaba vacía. Su ausencia permite crear o reutilizar automáticamente el nuevo precio de 4,99 EUR/mes. |
| `WML_PRO_STRIPE_ANNUAL_PRICE_ID` | Estaba vacía. Su ausencia permite crear o reutilizar automáticamente el nuevo precio de 45,99 EUR/año. |
| `WML_PRO_PORTAL_LOGIN_URL` | Estaba vacía. Su ausencia permite preparar o reutilizar automáticamente el portal de Pro. |
| `WML_PRO_PORTAL_CONFIGURATION_ID` | ID `bpc_...` de una configuración de portal existente; evita crearla mediante la API. |
| `WML_PRO_STRIPE_WEBHOOK_SECRET` | Estaba vacía. El webhook requiere este secreto para enviar por email la nueva licencia en cada pago confirmado; la revalidación del widget consulta Stripe directamente. |

Los IDs de precios y portal pueden configurarse antes de la compra para utilizar una clave de Stripe restringida. El secreto del webhook y el remitente Brevo son necesarios para el correo automático de renovación. Consulta [PRO_STRIPE_SETUP.md](PRO_STRIPE_SETUP.md).

## Formato de las claves de licencia

Conservar el PEM completo: cabecera, contenido, pie y saltos de línea. Ejemplo de estructura en una sola línea de `.env.local` (el contenido se ha sustituido por un marcador):

```dotenv
WML_PRO_LICENSE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nCONTENIDO_DE_LA_CLAVE\n-----END PRIVATE KEY-----\n
WML_PRO_LICENSE_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nCONTENIDO_DE_LA_CLAVE\n-----END PUBLIC KEY-----\n
```

Los `\n` son secuencias literales que el código convierte en saltos de línea. También acepta PEM con saltos reales. En un panel de despliegue, introducir el valor completo sin el nombre de la variable ni el signo `=`. No quitar los delimitadores ni regenerar el par existente: debe coincidir con el utilizado por el widget.

Después de cambiar el entorno del servidor, reiniciar o redesplegar. Los cambios locales en `.env.local` no eliminan variables guardadas en el proveedor de hosting.
