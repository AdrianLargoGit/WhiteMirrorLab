import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { DEFAULT_LOCALE, isLocale, marketplacePath, type Locale } from '@/lib/i18n'
import { MARKETPLACE_IS_AVAILABLE, marketplaceAvailabilityCopy } from '@/lib/marketplaceAvailability'
import { getMarketplaceCurrency, isFreeMarketplacePrice } from '@/lib/marketplacePricing'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamic = 'force-dynamic'

const copy = {
  es: {
    back: 'Volver al marketplace',
    creator: 'Creador',
    price: 'Precio',
    pets: 'Mascotas',
    accessories: 'Accesorios',
    buy: 'Comprar pack',
    download: 'Descargar pack',
    free: 'Gratis',
    email: 'Email de soporte',
    gallery: 'Galeria',
    galleryText: 'Imagenes de preview protegidas con marca de agua.',
    emptyGallery: 'Este pack solo tiene imagen de portada.',
    description: 'Descripcion',
    unavailable: 'Pronto disponible',
  },
  en: {
    back: 'Back to marketplace',
    creator: 'Creator',
    price: 'Price',
    pets: 'Pets',
    accessories: 'Accessories',
    buy: 'Buy pack',
    download: 'Download pack',
    free: 'Free',
    email: 'Support email',
    gallery: 'Gallery',
    galleryText: 'Preview images protected with watermark.',
    emptyGallery: 'This pack only has a cover image.',
    description: 'Description',
    unavailable: 'Available soon',
  },
} satisfies Record<Locale, Record<string, string>>

function formatPrice(price: number, currency: string, lang: Locale, freeLabel: string) {
  if (isFreeMarketplacePrice(price)) return freeLabel

  return new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

export default async function MarketplacePackPage({ params }: PageProps) {
  const { id } = await params
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const t = copy[lang]
  const availability = marketplaceAvailabilityCopy[lang]
  const currency = getMarketplaceCurrency()
  const supabase = createMarketplaceSupabaseClient({ useServiceRole: true })
  const { data: product, error } = await supabase
    .from('products')
    .select('id,title,description,creator_name,creator_email,price,status,cover_image_url,preview_image_urls,pet_count,clothes_count,download_blob_url,stripe_account_id')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (error || !product) notFound()

  const previewUrls = product.preview_image_urls ?? []
  const isFree = isFreeMarketplacePrice(product.price)
  const buyHref = isFree
    ? `/api/marketplace/download?product=${encodeURIComponent(product.id)}`
    : `/api/marketplace/checkout?product=${encodeURIComponent(product.id)}`

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <Link className={styles.backLink} href={marketplacePath(lang)}>{t.back}</Link>

        <section className={styles.hero}>
          <div className={styles.cover}>
            {product.cover_image_url ? (
              <Image
                src={`/api/marketplace/image?product=${encodeURIComponent(product.id)}&kind=cover`}
                alt=""
                width={960}
                height={720}
                priority
                unoptimized
              />
            ) : null}
          </div>

          <div className={styles.info}>
            <span>{t.creator}: {product.creator_name}</span>
            <h1>{product.title}</h1>
            {product.description ? (
              <section className={styles.descriptionBlock}>
                <h2>{t.description}</h2>
                <p>{product.description}</p>
              </section>
            ) : null}
            <p className={styles.creatorEmail}>{t.email}: {product.creator_email}</p>
            <dl>
              <div>
                <dt>{t.price}</dt>
                <dd>{formatPrice(product.price, currency, lang, t.free)}</dd>
              </div>
              <div>
                <dt>{t.pets}</dt>
                <dd>{product.pet_count}</dd>
              </div>
              <div>
                <dt>{t.accessories}</dt>
                <dd>{product.clothes_count}</dd>
              </div>
            </dl>
            {!MARKETPLACE_IS_AVAILABLE ? (
              <p className={styles.closedNotice}>{availability.body}</p>
            ) : product.download_blob_url && (isFree || product.stripe_account_id) ? (
              <a className={styles.buyButton} href={buyHref}>{isFree ? t.download : t.buy}</a>
            ) : null}
          </div>
        </section>

        <section className={styles.gallery}>
          <div className={styles.galleryHeader}>
            <span>{t.gallery}</span>
            <p>{previewUrls.length > 0 ? t.galleryText : t.emptyGallery}</p>
          </div>

          {previewUrls.length > 0 ? (
            <div className={styles.galleryGrid}>
              {previewUrls.map((_, index) => (
                <Image
                  key={index}
                  src={`/api/marketplace/image?product=${encodeURIComponent(product.id)}&kind=preview&index=${index}`}
                  alt=""
                  width={620}
                  height={465}
                  unoptimized
                />
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}
