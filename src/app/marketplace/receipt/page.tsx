import Link from 'next/link'
import { headers } from 'next/headers'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { DEFAULT_LOCALE, downloadPath, isLocale, marketplacePath, type Locale } from '@/lib/i18n'
import AutoMarketplaceDownload from './AutoMarketplaceDownload'
import styles from '../payment-pages.module.css'

export const metadata = {
  title: 'Marketplace Receipt | White Mirror Lab',
}

type MarketplaceReceiptPageProps = {
  searchParams?: Promise<{
    product?: string
    session_id?: string
  }>
}

export default async function MarketplaceReceiptPage({ searchParams }: MarketplaceReceiptPageProps) {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const params = await searchParams
  const productId = params?.product
  const sessionId = params?.session_id

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.copy}>
            <div className={styles.kicker}>WML Creator Pack</div>
            <h1>{lang === 'es' ? 'Recibo listo.' : 'Receipt ready.'}</h1>
            <p>
              {lang === 'es'
                ? 'Estamos comprobando el pago con Stripe. Si la sesion esta pagada, la descarga del ZIP empezara automaticamente.'
                : 'We are checking the Stripe payment. If the session is paid, the ZIP download will start automatically.'}
            </p>
            <AutoMarketplaceDownload productId={productId} sessionId={sessionId} lang={lang} />
            <div className={styles.actions}>
              <Link className={styles.primaryButton} href={downloadPath(lang)}>
                WML X.X.0
              </Link>
              <Link className={styles.secondaryButton} href={marketplacePath(lang)}>
                {lang === 'es' ? 'Explorar skins' : 'Explore skins'}
              </Link>
            </div>
          </div>

          <aside className={styles.aside}>
            <span className={styles.status}>03 / Support</span>
            <h2>{lang === 'es' ? 'Siguiente paso.' : 'Next step.'}</h2>
            <p>
              {lang === 'es'
                ? 'Importa el ZIP descargado en WML X.X.0 y conserva el recibo de compra para soporte.'
                : 'Import the downloaded ZIP into WML X.X.0 and keep your purchase receipt for support.'}
            </p>
            <ul>
              <li>{lang === 'es' ? 'Instala WML X.X.0 antes de importar skins.' : 'Install WML X.X.0 before importing skins.'}</li>
              <li>{lang === 'es' ? 'Manten el ZIP original sin renombrar si necesitas soporte.' : 'Keep the original ZIP name if you need support.'}</li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  )
}
