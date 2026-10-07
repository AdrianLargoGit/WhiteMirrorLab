# WML Pro — configuración de Stripe

La web y el widget están conectados mediante licencias Ed25519 y Stripe. Pro no necesita Supabase. Los precios son **2,99 €/mes** y **29,99 €/año**.

Rellena la clave Stripe en `wml/.env.local` y, desde `wml-xx0`, ejecuta **`npm run build:win`**. La preparación de licencia, compilación y verificación del widget se realizan automáticamente. Publica el instalador en GitHub Releases y actualiza su enlace como hasta ahora.

La descarga gratuita y el recibo Pro utilizan el mismo enlace de GitHub, definido una sola vez en **`src/lib/widgetDownload.ts`**. La compra genera y entrega **`pro-license.json`** desde la web; el usuario lo importa en el widget para desbloquear Pro. Este flujo no necesita R2 ni alojar otro instalador. Al desplegar WML, lleva las variables ya preparadas de `.env.local` al entorno del servidor, como con las demás claves privadas.

## Configuración sencilla: una clave secreta estándar

Sí puedes usar la clave secreta estándar de Stripe. En `wml/.env.local`, pon `sk_test_...` para las pruebas y, cuando publiques cobros reales, configura `sk_live_...` **solo en el entorno del servidor**:

```dotenv
WML_PRO_STRIPE_SECRET_KEY=sk_test_TU_CLAVE
```

Deja sin configurar `WML_PRO_STRIPE_MONTHLY_PRICE_ID`, `WML_PRO_STRIPE_ANNUAL_PRICE_ID`, `WML_PRO_PORTAL_CONFIGURATION_ID` y `WML_PRO_PORTAL_LOGIN_URL`. En la primera compra, el servidor crea o reutiliza el producto, los precios recurrentes de **2,99 €/mes** y **29,99 €/año**, y la configuración del portal. No tienes que crearlos a mano en Stripe. Si configuras IDs de precio, WML rechazará cualquiera cuyo importe no coincida. La clave activa pertenece a un entorno separado del de prueba.

También puedes usar `STRIPE_SECRET_KEY`; la clave específica de Pro tiene prioridad. `.env.local` es el archivo de entorno de Next.js que ya utiliza el proyecto. Reinicia el servidor después de editarlo y lleva las mismas variables al entorno del despliegue. Una `sk_...` tiene acceso amplio a la cuenta: mantenla únicamente en el servidor, fuera del instalador, del repositorio y de cualquier variable `NEXT_PUBLIC_`. La clave de firma Ed25519 y el secreto `whsec_...` son diferentes de la clave API de Stripe.

No necesitas una clave publicable `pk_...`: el servidor crea la sesión y el navegador abre Checkout alojado por Stripe.

**Sin webhook**, el widget consulta Stripe a través de la web al conectarse y revalida la licencia periódicamente mientras está abierto. Si Stripe ha confirmado la renovación, recibe una licencia firmada con la nueva fecha de vencimiento sin que el comprador importe otro archivo. La licencia anterior vence en la fecha firmada y no se amplía por un intento de cobro fallido. **Esto no envía un correo nuevo al pagar**; para entregarlo de inmediato por email, configura el webhook de `invoice.paid` y Brevo como se indica más abajo. En cualquier caso, debes desplegar las rutas Pro de la web: la ruta pública `/api/pro/activate` aún devuelve 404, así que la clave Stripe por sí sola no arregla la importación de la licencia de prueba.

### Alternativa: clave restringida

Si más adelante quieres reducir los permisos de la clave, usa `rk_test_...` o `rk_live_...` y los pasos siguientes. No son necesarios para arrancar con la clave estándar.

### Crear la clave restringida sin configurar precios a mano

1. En Stripe Dashboard, entra en **modo de prueba → Desarrolladores → Claves API → Crear clave restringida**. Ponle nombre `WML Pro test` y deja los demás recursos en **Ninguno**.
2. En la pantalla actual de Stripe, marca **Escritura** en **Core → Products**, **Billing → Prices, Subscriptions y Customer Portal**, y **Checkout Sessions → Checkout Sessions**. Marca **Lectura** en **Core → Customers, Charges and Refunds y Payment Disputes**, y **Billing → Invoices**. Deja los demás recursos en **Ninguno**. El permiso Customer Portal cubre las sesiones y configuraciones que utiliza WML; Escritura también permite Lectura.
3. Guarda la `rk_test_...` como `WML_PRO_STRIPE_SECRET_KEY` en el entorno privado de la web y despliega la web. Deja sin configurar los IDs de producto/precio y portal indicados arriba: el código los crea o reutiliza automáticamente. No pongas la clave en el widget ni en variables `NEXT_PUBLIC_`.
4. Prueba el pago mensual y anual, la importación y una renovación en modo de prueba. Si Stripe rechaza una llamada por permisos, revisa el registro de peticiones de esa clave y habilita el recurso que indique. Después crea una `rk_live_...` con los mismos permisos para el entorno de producción; las claves y objetos de prueba no sirven para cobros reales.

Para la renovación automática **dentro del widget** no necesitas configurar un webhook. Si también quieres mandar el archivo renovado por email justo al confirmarse el pago, añade el webhook y Brevo como se explica abajo. Como alternativa para reducir todavía más los permisos, puedes crear manualmente precios y portal y configurar sus IDs; entonces Products y Prices solo necesitan Lectura y Portal Configurations puede omitirse. Stripe documenta la [creación y prueba de claves restringidas](https://docs.stripe.com/keys/restricted-api-keys).

Si los IDs de precio están vacíos, la primera compra crea o reutiliza el producto `wml_pro_v1` y sus precios recurrentes mediante claves de búsqueda estables. Si el enlace del portal está vacío, se crea o reutiliza una configuración propia de Pro con verificación de email, actualización de tarjeta, facturas y cancelación al final del periodo pagado. Estas operaciones no cambian la configuración del marketplace.

Estos campos son opcionales para reutilizar una configuración de Stripe existente. Si no los utilizas, puedes omitir sus líneas de `.env.local`; no hace falta conservar entradas vacías:

```dotenv
WML_PRO_STRIPE_MONTHLY_PRICE_ID=
WML_PRO_STRIPE_ANNUAL_PRICE_ID=
WML_PRO_PORTAL_CONFIGURATION_ID=
WML_PRO_PORTAL_LOGIN_URL=
WML_PRO_STRIPE_WEBHOOK_SECRET=
```

Los precios deben ser recurrentes en EUR, con cantidad uno e importes de 299 y 2999 céntimos respectivamente. No se añaden pruebas gratuitas ni descuentos. Cada entrega y revalidación comprueba el estado real de Stripe; no depende de recibir previamente un webhook.

## Configuración ya preparada

- `WML_PRO_SITE_URL`: origen HTTPS de la web. Se acepta la variante con/sin `www`, pero el pago vuelve al origen donde se inició para conservar sus cookies. En desarrollo se acepta localhost.
- `WML_PRO_LICENSE_PRIVATE_KEY` y `WML_PRO_LICENSE_PUBLIC_KEY`: par existente reutilizado y comprobado, guardado en el archivo de entorno ignorado por Git.
- `wml-xx0/.env.pro`: clave pública y `WML_PRO_LICENSE_ACTIVATION_URL` correspondiente a `/api/pro/activate`; sin clave Supabase para este flujo.
- Instalador: el archivo generado por `npm run build:win` en `wml-xx0/dist`. Incluye la activación Pro y conserva el nombre y aspecto del widget. El comando comprueba la clave pública, activación, main/preload/renderer y exclusión de claves privadas. **Publica ese instalador antes de cambiar `widgetDownload.ts`**; el enlace público actual apunta a 1.0.6.
- Enlace del widget: `src/lib/widgetDownload.ts`, compartido entre descarga gratuita y recibo Pro. Se conserva tu URL actual de GitHub; al publicar una versión nueva la cambias únicamente ahí.

Las claves de licencia deben conservar el PEM completo, incluidos `-----BEGIN PRIVATE KEY-----`, `-----END PRIVATE KEY-----` (o `PUBLIC KEY`) y los saltos de línea. En `.env.local` pueden escribirse en una sola línea usando `\n`, que el código convierte en saltos reales. No recortes ni regeneres el par existente. Consulta [ENVIRONMENT.md](ENVIRONMENT.md) para el inventario completo de variables y la limpieza realizada.

La compra comprueba la configuración de firma, la URL de descarga y la gestión de suscripción. La descarga del widget se sirve desde GitHub; no se contacta con GitHub para crear una sesión de pago. Las peticiones de licencia siempre verifican el pago y la suscripción en Stripe antes de entregar el JSON firmado.

## Regenerar el instalador después de cambios

No cambies el par de firma si hay licencias o instaladores que lo utilizan. Para una nueva copia de los proyectos:

```powershell
# Desde wml-xx0
npm run build:win
```

Este único comando reutiliza y comprueba el par de firma de WML, prepara `.env.pro`, compila el runtime/widget y genera y verifica el instalador normal en `dist`. No requiere claves Stripe en el widget. Los alias `build:winpro`, `package:win` y `package:winpro` ejecutan el mismo proceso. Los instaladores anteriores de `dist/pro` se conservan; el archivo que publicas en GitHub es el normal de `dist`.

## Compra, activación y renovación

1. El usuario elige mensual/anual y acepta los términos. Se rechazan entradas inválidas y orígenes ajenos; se evita el doble envío.
2. Una suscripción Pro existente con el mismo email dirige al portal con verificación de email. El email por sí solo no autoriza una licencia ni una sesión privada del portal.
3. Stripe cobra mediante Checkout. La compra se vincula a una cookie HttpOnly cuyo secreto se guarda en Stripe únicamente como hash.
4. El retorno intercambia el ID de sesión por una cookie y lo retira de la URL. El recibo comprueba el pago y ofrece el instalador y `pro-license.json`, con enlaces manuales además del intento de descarga automática.
5. Al importar el JSON en Ajustes, el servidor comprueba firma/pago y lo vincula a un ordenador. Un segundo ordenador se rechaza.
6. El widget revalida cada seis horas, cada cinco minutos durante el último día pagado y, al vencer, en el siguiente sondeo de un minuto; usa timeout de 15 segundos y reintenta tras errores de conexión. Una respuesta antigua no puede sustituir ni revocar una licencia recién importada.
7. El archivo firmado contiene `plan: "monthly"` o `plan: "annual"` y vence exactamente al final del periodo pagado por Stripe. El widget revalida mientras está abierto y actualiza la licencia si se confirma una renovación. Cambiar la fecha o el plan en el JSON invalida la firma.
8. Cancelar al final del periodo mantiene el tiempo pagado. Un periodo nuevo sin cobrar, reembolso completo o disputa vigente no concede nuevas licencias. Sin conexión, una revocación se aplica al caducar el periodo firmado.
9. Con el webhook y Brevo configurados, `invoice.paid` envía por email una licencia nueva tras cada cobro. Brevo admite `.txt` como adjunto: `pro-license.txt` contiene el mismo JSON firmado y se importa directamente en la versión nueva del widget. La descarga inicial del recibo sigue siendo `pro-license.json`.

El recibo se puede reabrir durante 30 días en el navegador de compra. La licencia importada no depende de esas cookies. La antigua ruta de recuperación por email no entrega licencias sin acreditar la compra. Perder cookies o cambiar de ordenador requiere recuperación verificada por soporte; no hay transferencia automática de dispositivo.

## Webhook necesario para el email de renovación

Registra `https://TU_DOMINIO/api/pro/webhook` como destino de eventos snapshot, versión 2024-06-20, y guarda su secreto `whsec_...` en `WML_PRO_STRIPE_WEBHOOK_SECRET`. Para enviar el correo también necesitas `BREVO_API_KEY` y un remitente verificado en Brevo (`WML_PRO_FROM_EMAIL`; si se omite, se usa la configuración de contacto o `Sender@whitemirrorlab.com`):

```text
checkout.session.completed
checkout.session.async_payment_succeeded
invoice.paid
invoice.payment_failed
invoice.payment_action_required
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
charge.refunded
charge.dispute.created
charge.dispute.closed
```

Se verifica la firma sobre el cuerpo original, la fecha y la estructura. Los eventos repetidos/desordenados consultan el estado actual. Si Brevo falla, el endpoint devuelve error para que Stripe reintente. Sin el secreto del webhook, el widget puede renovar la licencia al conectarse, pero **no se enviará un archivo nuevo por email**.

## Verificación

Las pruebas locales cubren ambos planes, configuración automática con Stripe simulado, recibo, firma, activación, segundo dispositivo, renovación, cancelación, reembolso, disputa, cookies ajenas, dominios y revocación del widget. Ambos proyectos compilan y el instalador final está comprobado.

El instalador 1.0.6 se compiló y se verificó con el mismo par de claves. El sitio público aún responde 404 en `/api/pro/activate`: hay que desplegar la web nueva antes de que el widget pueda vincular un ordenador. El enlace de descarga en el código apunta ahora a 1.0.6. Falta probar la importación en un ordenador real. Tampoco se ha configurado el secreto del webhook, por lo que el correo de renovación aún no puede funcionar en el despliegue. No se han cobrado tarjetas reales ni cambiado el despliegue de la web.

Referencias oficiales: [Checkout](https://docs.stripe.com/api/checkout/sessions/create), [precios](https://docs.stripe.com/api/prices/create), [portal](https://docs.stripe.com/api/customer_portal/configurations/create), [idempotencia](https://docs.stripe.com/api/idempotent_requests), [webhooks](https://docs.stripe.com/billing/subscriptions/webhooks).
