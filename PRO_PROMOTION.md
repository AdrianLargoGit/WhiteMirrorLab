# WML Pro: promoción de siete días

## Promoción de 7 días — noviembre de 2026

La campaña termina **al finalizar el 18/11/2026 a las 23:59:59, Europe/Madrid**. El límite exclusivo es `2026-11-19T00:00:00+01:00` (`2026-11-18T23:00:00Z`). A partir de ese instante se recuperan automáticamente los precios y textos normales en el inicio, la descarga y el popup, tanto en español como en inglés. No hace falta cron, nueva publicación ni intervención esa noche. Una página abierta actualiza el contador con la hora del servidor y retira la oferta al llegar a cero.

Se aplica a nuevas altas de Pro, una vez por correo (normalizado), tanto mensual como anual. No modifica las suscripciones existentes. Es una protección por correo e historial de Stripe, no una verificación de identidad: crear otro correo puede eludir ese límite.

### Lo que debes configurar antes de publicarla

1. **Publicar estos cambios de la web** en el alojamiento habitual. No hay que recompilar el widget: se utiliza su formato de licencia y el par de firma existentes.
2. En la misma cuenta y modo de Stripe de la clave Pro, abrir **Workbench / Developers → Webhooks → Añadir destino**, o editar el destino existente. Usar `https://whitemirrorlab.com/api/pro/webhook`, eventos **snapshot**, versión **2025-02-24.acacia**, y la lista de eventos de la sección «Webhook» de este documento. `checkout.session.completed` es imprescindible para activar la prueba. `invoice.paid` entrega el email con la licencia; los eventos de suscripción y pagos mantienen la sincronización.
3. Copiar el secreto de firma de ese destino, `whsec_…`, a **`WML_PRO_STRIPE_WEBHOOK_SECRET` en el entorno del servidor publicado**. Para las pruebas locales usar el secreto correspondiente al destino/Stripe CLI de pruebas, no el de producción. Reiniciar o redesplegar después de cambiar variables.
4. La clave Pro local es **restringida y de modo real**. Confirmar en Stripe sus permisos: **Checkout Sessions: escritura; Customers: escritura; Subscriptions: escritura; SetupIntents: lectura**. Conservar los permisos anteriores de lectura de Prices, Invoices, Charges y Disputes, y los de Billing Portal. Si se utiliza la creación automática existente de producto/precios/portal, también se necesita escritura en Products, Prices y configuraciones de Billing Portal. No cambiar la clave de firma de licencias.
5. En **Billing → Customer portal**, comprobar que el portal de WML permite cancelar **al final del periodo**, consultar facturas y actualizar tarjeta. La configuración automática del código ya incluye esas opciones; una configuración existente no se sobrescribe. Durante la prueba, el final del periodo es el final de los siete días.
6. En **Billing → Subscriptions and emails**, habilitar el recordatorio de fin de prueba y los avisos de pago fallido/autenticación. Revisar también las reglas de reintentos de pagos fallidos. El primer email de prueba indica el precio posterior y la fecha exacta de finalización.

**No crear un producto gratuito, cupón ni Payment Link promocional.** Se reutilizan el producto `wml_pro_v1` y los precios actuales de **2,99 €/mes** y **29,99 €/año**. La promoción no está configurada globalmente en el producto.

La campaña se habilita por defecto durante sus fechas cuando existe `WML_PRO_STRIPE_WEBHOOK_SECRET`. Sin ese secreto se muestra la web normal y se rechazan las solicitudes de prueba. Comprobar tras el despliegue `/api/pro/checkout`: `promotion.active` debe ser `true` durante la campaña. No introducir una clave ficticia para activarla: la firma del webhook debe verificarse realmente.

### Cierre y desactivación manual

- **El 18 por la noche no tienes que hacer nada.** El servidor bloquea las altas promocionales desde las 00:00:00 del 19, hora de Madrid. Los checkouts normales cobran desde el inicio.
- Para retirarla antes: establecer **`WML_PRO_TRIAL_ENABLED=false`** en el alojamiento y reiniciar/redesplegar. El servidor rechaza nuevas confirmaciones de prueba y las páginas abiertas refrescan el estado como máximo cada minuto. Para volver a habilitarla antes del límite, quitar esa variable o poner `true`; nunca reabre después de la fecha límite.
- Mantener el webhook y las claves después del cierre: sirven para las pruebas ya concedidas y los cobros posteriores. No cancelar ni modificar masivamente las suscripciones en prueba.
- Ejemplo: alta completada el 18/11 a las 23:59:59 → prueba hasta el 25/11 a las 23:59:59, hora de Madrid; entonces empieza la facturación automática, salvo cancelación. El momento efectivo del cargo depende de Stripe y del banco.

### Por qué un enlace abierto no reserva la oferta

La promoción usa Checkout en modo `setup` para guardar una tarjeta sin cobrar. Solo el webhook firmado de finalización crea la suscripción con `charge_automatically`, tarjeta predeterminada y final de prueba siete días después de la confirmación. El tiempo utilizado es `event.created` de Stripe, no el reloj del navegador ni la recepción del webhook.

Stripe exige una duración mínima de 30 minutos para Checkout. Por eso una página de Stripe abierta en los últimos minutos puede seguir visible después del cierre, pero **no puede conceder una prueba ni cobrar**: una confirmación fuera de plazo se rechaza y el recibo invita a contratar de nuevo al precio normal. Los enlaces de recuperación están deshabilitados. Un evento retrasado de un alta completada antes del cierre conserva la fecha original; los reintentos no reinician la prueba.

Las licencias durante `trialing` vencen al finalizar la prueba y el servidor sigue validándolas aunque la campaña haya cerrado. Cancelar al final del periodo conserva ese acceso. Si falla el primer cobro, la factura gratuita anterior no amplía la licencia al mes/año sin pagar. Los usuarios en prueba no se añaden a la lista Brevo de clientes de pago hasta confirmar un periodo pagado.

### Verificación de la promoción

`node --test scripts/pro-promotion.test.mjs scripts/pro-billing.test.mjs scripts/pro-flow.test.mjs` prueba con Stripe simulado el cierre exacto, formularios antiguos, webhooks retrasados/repetidos, tarjeta fallida, recuperación tras interrupción, historial de pruebas, cancelación y primer pago fallido. Antes del lanzamiento comprobar también en modo de prueba de Stripe el recorrido completo con el webhook real. No usar tarjetas reales para esa comprobación.

La revisión local del 10/11/2026 encontró la clave Pro real restringida y la configuración de Brevo, pero **no `WML_PRO_STRIPE_WEBHOOK_SECRET`**. No se ha modificado la cuenta Stripe ni desplegado la web; los permisos y ajustes del Dashboard no se han podido verificar desde este entorno.


## Presentación de la campaña

Inicio: franja bajo la navegación con «Plan PRO gratis hasta el GTA VI» / «PRO plan free until GTA VI». Descarga: contador propio integrado junto al formulario. Popup: precios tachados, «Gratis ahora» y condiciones de siete días, sin contador. El eslogan no cambia la fecha fija del cierre ni la duración individual de la prueba.

## Eventos del webhook

### Confirmación inmediata al regresar de Stripe

La clave restringida necesita también **Events / Eventos: Lectura**. Si el webhook se retrasa, el recibo autenticado consulta el evento `checkout.session.completed` directamente en Stripe y utiliza el mismo proceso de activación. Se conserva la hora original de confirmación y la protección contra duplicados; volver a comprobar no inicia otros siete días ni crea otra suscripción.

Esto permite confirmar el alta desde localhost sin esperar una entrega al dominio público. El webhook sigue siendo necesario para quienes no vuelven al recibo, los correos de licencia y los cambios posteriores de la suscripción. En producción hay que publicar estos cambios y mantener operativo el destino del webhook.

El recibo deja de consultar automáticamente tras un minuto y muestra que la confirmación está tardando. Cada petición tiene un tiempo máximo de espera de 15 segundos. «Volver a comprobar» inicia un nuevo intento sin repetir el pago.

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

Referencias: [Checkout](https://docs.stripe.com/api/checkout/sessions/create?api-version=2024-06-20), [suscripciones](https://docs.stripe.com/api/subscriptions/create?api-version=2024-06-20), [portal](https://docs.stripe.com/api/customer_portal/configurations/create).

