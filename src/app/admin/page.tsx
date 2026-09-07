import { headers } from 'next/headers'
import Image from 'next/image'
import CustomCursor from '@/components/CustomCursor'
import Navbar from '@/components/Navbar'
import { approveProduct, rejectProduct, setFeaturedProduct } from './actions'
import { getMarketplaceCurrency, isFreeMarketplacePrice } from '@/lib/marketplacePricing'
import { createMarketplaceSupabaseClient } from '@/lib/marketplaceSupabase'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Marketplace Admin | White Mirror Lab',
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE
  const { token } = await searchParams
  const hasToken = Boolean(process.env.MARKETPLACE_ADMIN_TOKEN)
  const canView = hasToken && token === process.env.MARKETPLACE_ADMIN_TOKEN
  const pendingProducts = canView
    ? await createMarketplaceSupabaseClient({ useServiceRole: true })
        .from('products')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
    : null
  const approvedProducts = canView
    ? await createMarketplaceSupabaseClient({ useServiceRole: true })
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
    : null

  return (
    <div className="landing-page">
      <CustomCursor />
      <Navbar lang={lang} />

      <main className={styles.page}>
        <section className={styles.header}>
          <p className="section-label">Admin</p>
          <h1>Marketplace review</h1>
          <p>Review pending ZIP submissions, download packages, approve products for the marketplace, or reject and remove them.</p>
        </section>

        {!canView ? (
          <form className={styles.authForm} method="get">
            <label>
              <span>Admin token</span>
              <input name="token" type="password" required />
            </label>
            <button type="submit">Enter</button>
          </form>
        ) : null}

        {canView && pendingProducts?.error ? (
          <p className={styles.error}>{pendingProducts.error.message}</p>
        ) : null}

        {canView && approvedProducts?.error ? (
          <p className={styles.error}>{approvedProducts.error.message}</p>
        ) : null}

        {canView && pendingProducts?.data?.length === 0 ? (
          <p className={styles.empty}>No pending products.</p>
        ) : null}

        {canView && pendingProducts?.data?.length ? (
          <div className={styles.list}>
            {pendingProducts.data.map((product, index) => (
              <article className={styles.item} key={product.id}>
                {product.cover_image_url ? (
                  <div className={styles.coverPreview}>
                    <Image
                      src={`/api/marketplace/image?product=${encodeURIComponent(product.id)}&kind=cover&token=${encodeURIComponent(token ?? '')}`}
                      alt=""
                      width={240}
                      height={180}
                      unoptimized
                    />
                  </div>
                ) : null}
                <div className={styles.itemMeta}>
                  <span>{String(index + 1).padStart(2, '0')} / Pending</span>
                  <h2>{product.title}</h2>
                  {product.description ? (
                    <p className={styles.description}>{product.description}</p>
                  ) : null}
                  <p>Creator: {product.creator_name}</p>
                  <p>{isFreeMarketplacePrice(product.price) ? 'Free' : new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
                    style: 'currency',
                    currency: getMarketplaceCurrency(),
                  }).format(product.price)}</p>
                  <p>{product.pet_count} pets / {product.clothes_count} accessories</p>
                  <p>Creator support email: {product.creator_email}</p>
                  <p>Stripe Connect: {product.stripe_account_id ?? 'Missing'}</p>
                  <small>Private ZIP stored temporarily until review is completed</small>
                </div>

                <div className={styles.itemActions}>
                  {product.blob_url ? (
                    <a href={`/api/admin/marketplace/download?product=${encodeURIComponent(product.id)}&token=${encodeURIComponent(token ?? '')}`}>
                      Download ZIP
                    </a>
                  ) : null}

                  <form action={approveProduct}>
                    <input name="productId" type="hidden" value={product.id} />
                    <input name="adminToken" type="hidden" value={token} />
                    <button type="submit">Approve</button>
                  </form>

                  <form action={rejectProduct}>
                    <input name="productId" type="hidden" value={product.id} />
                    <input name="adminToken" type="hidden" value={token} />
                    <button className={styles.rejectButton} type="submit">Reject</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {canView ? (
          <section className={styles.approvedSection}>
            <div className={styles.sectionHeader}>
              <p className="section-label">Featured</p>
              <h2>Approved products</h2>
              <p>Choose up to three products to show first in the marketplace with a fire badge.</p>
            </div>

            {approvedProducts?.data?.length === 0 ? (
              <p className={styles.empty}>No approved products yet.</p>
            ) : null}

            {approvedProducts?.data?.length ? (
              <div className={styles.list}>
                {approvedProducts.data.map((product) => (
                  <article className={styles.item} key={product.id}>
                    {product.cover_image_url ? (
                      <div className={styles.coverPreview}>
                        <Image
                          src={`/api/marketplace/image?product=${encodeURIComponent(product.id)}&kind=cover&token=${encodeURIComponent(token ?? '')}`}
                          alt=""
                          width={240}
                          height={180}
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className={styles.itemMeta}>
                      <span>{product.featured_rank ? `0${product.featured_rank} / Featured` : 'Normal'}</span>
                      <h2>{product.title}</h2>
                      <p>Creator: {product.creator_name}</p>
                      <p>{isFreeMarketplacePrice(product.price) ? 'Free' : new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-US', {
                        style: 'currency',
                        currency: getMarketplaceCurrency(),
                      }).format(product.price)}</p>
                      <p>{product.pet_count} pets / {product.clothes_count} accessories</p>
                    </div>

                    <form className={styles.featureForm} action={setFeaturedProduct}>
                      <input name="productId" type="hidden" value={product.id} />
                      <input name="adminToken" type="hidden" value={token} />
                      <label>
                        <span>Marketplace position</span>
                        <select name="featuredRank" defaultValue={product.featured_rank ?? ''}>
                          <option value="">Normal</option>
                          <option value="1">Featured 1</option>
                          <option value="2">Featured 2</option>
                          <option value="3">Featured 3</option>
                        </select>
                      </label>
                      <button type="submit">Save</button>
                    </form>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  )
}
