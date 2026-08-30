import type { Locale } from './i18n'

export const MARKETPLACE_IS_AVAILABLE = true
export const MARKETPLACE_SUBMISSIONS_ARE_OPEN = true

export const marketplaceAvailabilityCopy = {
  es: {
    title: 'Marketplace abierto',
    body:
      'Ya puedes enviar skins para revision y comprar packs aprobados por White Mirror Lab.',
    short: 'Abierto',
    submitTitle: 'Envia tu skin',
    submitBody:
      'Sube tu ZIP, portada y previews. Revisaremos el pack antes de publicarlo en el marketplace.',
    prepareCta: 'Subir mi skin',
  },
  en: {
    title: 'Marketplace is open',
    body:
      'You can now submit skins for review and buy creator packs approved by White Mirror Lab.',
    short: 'Open',
    submitTitle: 'Submit your skin',
    submitBody:
      'Upload your ZIP, cover, and previews. We will review the pack before publishing it in the marketplace.',
    prepareCta: 'Submit my skin',
  },
} satisfies Record<Locale, Record<string, string>>
