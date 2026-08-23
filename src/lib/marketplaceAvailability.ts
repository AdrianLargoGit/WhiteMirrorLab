import type { Locale } from './i18n'

export const MARKETPLACE_IS_AVAILABLE = false
export const MARKETPLACE_SUBMISSIONS_ARE_OPEN = false

export const marketplaceAvailabilityCopy = {
  es: {
    title: 'Marketplace no disponible todavia',
    body:
      'Estamos preparando la apertura. Puedes descargar la plantilla y dejar tus skins listas; el envio y la compra se abriran muy pronto.',
    short: 'Pronto disponible',
    submitTitle: 'El formulario abrira muy pronto',
    submitBody:
      'Aun no aceptamos envios desde la web. Prepara tu ZIP con la plantilla oficial y vuelve cuando activemos la subida.',
    prepareCta: 'Preparar mi skin',
  },
  en: {
    title: 'Marketplace is not available yet',
    body:
      'We are preparing the launch. You can download the template and get your skins ready; submissions and purchases will open very soon.',
    short: 'Available soon',
    submitTitle: 'The form will open very soon',
    submitBody:
      'We are not accepting web submissions yet. Prepare your ZIP with the official template and come back when uploads are enabled.',
    prepareCta: 'Prepare my skin',
  },
} satisfies Record<Locale, Record<string, string>>

