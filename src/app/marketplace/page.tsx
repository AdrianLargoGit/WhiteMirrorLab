import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { DEFAULT_LOCALE, downloadPath, isLocale, marketplaceSubmitPath, type Locale } from '@/lib/i18n'
import { MARKETPLACE_IS_AVAILABLE, marketplaceAvailabilityCopy } from '@/lib/marketplaceAvailability'
import { getMarketplaceCurrency } from '@/lib/marketplacePricing'
import { createMarketplaceSupabaseClient, type MarketplaceProduct } from '@/lib/marketplaceSupabase'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Marketplace | White Mirror Lab',
  description: 'Skins and creator packs for WML X.X.0.',
}

type PublicMarketplaceProduct = Pick<
  MarketplaceProduct,
  | 'id'
  | 'title'
  | 'description'
  | 'creator_name'
  | 'creator_email'
  | 'price'
  | 'created_at'
  | 'cover_image_url'
  | 'pet_count'
  | 'clothes_count'
  | 'download_blob_url'
  | 'stripe_account_id'
>

const copy = {
  es: {
    title: 'Marketplace',
    subtitle: 'Skins aprobadas para WML X.X.0',
    description: 'Compra packs de creadores revisados por White Mirror Lab e importalos en tu mascota de escritorio.',
    upload: 'Subir tu skin',
    install: 'Descargar WML X.X.0',
    approved: 'Aprobadas',
    empty: 'Sin skins publicadas todavia',
    emptyText: 'Muy pronto apareceran aqui los primeros packs de creadores para WML X.X.0.',
    buy: 'Comprar',
    unavailable: 'No disponible',
    creator: 'Creador',
    email: 'Email de soporte',
    price: 'Precio',
    pets: 'Mascotas',
    accessories: 'Accesorios',
    details: 'Ver pack',
    review: 'Revision manual',
    payment: 'Pago seguro',
    import: 'Importable en WML',
    comingSoon: 'Apertura muy pronto',
  },
  en: {
    title: 'Marketplace',
    subtitle: 'Approved skins for WML X.X.0',
    description: 'Buy creator packs reviewed by White Mirror Lab and import them into your desktop pet.',
    upload: 'Submit your skin',
    install: 'Download WML X.X.0',
    approved: 'Approved',
    empty: 'No skins published yet',
    emptyText: 'The first creator packs for WML X.X.0 will appear here soon.',
    buy: 'Buy',
    unavailable: 'Unavailable',
    creator: 'Creator',
    email: 'Support email',
    price: 'Price',
    pets: 'Pets',
    accessories: 'Accessories',
    details: 'View pack',
    review: 'Manual review',
    payment: 'Secure payment',
    import: 'Importable in WML',
    comingSoon: 'Opening very soon',
  },
} satisfies Record<Locale, Record<string, string>>

function formatPrice(price: number, currency: string, lang: Locale) {
  return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

function getTone(index: number) {
  return styles[`tone${(index % 4) + 1}` as keyof typeof styles]
}

async function getApprovedProducts() {
  try {
    const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
    const { data, error } = await supabase
      .from('products')
      .select('id,title,description,creator_name,creator_email,price,created_at,cover_image_url,pet_count,clothes_count,download_blob_url,stripe_account_id')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      return { products: [] as PublicMarketplaceProduct[], error: error.message }
    }

    return { products: data ?? [] as PublicMarketplaceProduct[], error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load marketplace'
    return { products: [] as PublicMarketplaceProduct[], error: message }
  }
}

export default async function MarketplacePage() {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const t = copy[lang]
  const availability = marketplaceAvailabilityCopy[lang]
  const currency = getMarketplaceCurrency()
  const { products, error } = MARKETPLACE_IS_AVAILABLE
    ? await getApprovedProducts()
    : { products: [] as PublicMarketplaceProduct[], error: null }

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.shopBar}>
          <div>
            <span>{t.subtitle}</span>
            <h1>{t.title}</h1>
            <p>{MARKETPLACE_IS_AVAILABLE ? t.description : availability.body}</p>
          </div>
          <div className={styles.shopActions}>
            <Link className={styles.uploadButton} href={marketplaceSubmitPath(lang)}>
              {t.upload}
            </Link>
            <Link className={styles.installButton} href={downloadPath(lang)}>
              {t.install}
            </Link>
          </div>
        </section>

        <section className={styles.statusRail} aria-label="Marketplace status">
          <span>{products.length} / {t.approved}</span>
          <span>{t.review}</span>
          <span>{MARKETPLACE_IS_AVAILABLE ? t.payment : t.comingSoon}</span>
          <span>{t.import}</span>
        </section>

        {!MARKETPLACE_IS_AVAILABLE ? (
          <section className={styles.notice}>
            <h2>{availability.title}</h2>
            <p>{availability.body}</p>
          </section>
        ) : null}

        {error ? (
          <section className={styles.notice}>
            <h2>{lang === 'es' ? 'No podemos cargar la tienda ahora' : 'We cannot load the shop right now'}</h2>
            <p>
              {lang === 'es'
                ? 'Vuelve a intentarlo en unos minutos.'
                : 'Please try again in a few minutes.'}
            </p>
          </section>
        ) : null}

        {!error && products.length === 0 ? (
          <section className={styles.empty}>
            <Image
              src="/skins/pixel-dog.png"
              alt=""
              width={220}
              height={220}
              className={styles.emptyImage}
            />
            <div>
              <span>00 / DROP</span>
              <h2>{MARKETPLACE_IS_AVAILABLE ? t.empty : availability.short}</h2>
              <p>{MARKETPLACE_IS_AVAILABLE ? t.emptyText : availability.body}</p>
              <Link href={marketplaceSubmitPath(lang)}>{availability.prepareCta}</Link>
            </div>
          </section>
        ) : null}

        {products.length > 0 ? (
          <section className={styles.grid} aria-label={t.title}>
            {products.map((product, index) => {
              const isAvailable = MARKETPLACE_IS_AVAILABLE && Boolean(product.download_blob_url && product.stripe_account_id)
              const buyHref = `/api/marketplace/checkout?product=${encodeURIComponent(product.id)}`
              const productHref = `${lang === 'en' ? '/en' : ''}/marketplace/${product.id}`

              return (
                <article className={styles.card} key={product.id}>
                  <div className={`${styles.art} ${getTone(index)}`}>
                    {product.cover_image_url ? (
                      <Image
                        src={`/api/marketplace/image?product=${encodeURIComponent(product.id)}&kind=cover`}
                        alt=""
                        width={520}
                        height={390}
                        className={styles.coverImage}
                        unoptimized
                      />
                    ) : null}
                    <span>{t.approved}</span>
                  </div>
                  <div className={styles.body}>
                    <div className={styles.meta}>
                      <span>{t.creator}: {product.creator_name}</span>
                      <span>{new Date(product.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}</span>
                    </div>
                    <p className={styles.emailLine}>{t.email}: {product.creator_email}</p>
                    <h2>{product.title}</h2>
                    {product.description ? (
                      <p className={styles.description}>{product.description}</p>
                    ) : null}
                    <div className={styles.counts}>
                      <span>{product.pet_count} {t.pets}</span>
                      <span>{product.clothes_count} {t.accessories}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>{t.price}</span>
                      <strong>{formatPrice(product.price, currency, lang)}</strong>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <Link className={styles.detailButton} href={productHref}>
                      {t.details}
                    </Link>
                    {isAvailable ? (
                      <a className={styles.buyButton} href={buyHref}>
                        {t.buy}
                      </a>
                    ) : (
                      <span className={styles.disabledButton}>{t.unavailable}</span>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        ) : null}
      </main>
    </div>
  )
}
