'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { contactPath, downloadPath } from '@/lib/i18n'
import { proCopy } from '@/lib/proCopy'
import styles from './receipt.module.css'

type Purchase = { ok: boolean; plan?: 'monthly' | 'annual'; paidUntil?: string; amountPaid?: number; invoiceId?: string; invoiceUrl?: string | null; error?: string }

export default function ProReceipt({ lang }: { lang: 'es' | 'en' }) {
  const p = proCopy[lang]
  const [state, setState] = useState<'checking' | 'ready' | 'pending' | 'error'>('checking')
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [attempt, setAttempt] = useState(0)
  const autoDownloadStarted = useRef(false)
  useEffect(() => {
    const controller = new AbortController()

    async function prepare() {
      try {
        const response = await fetch('/api/pro/fulfill', { cache: 'no-store', signal: controller.signal })
        const result = await response.json() as Purchase
        if (controller.signal.aborted) return
        setPurchase(result)
        if (!response.ok || !result.ok) {
          setState(result.error === 'payment_pending' ? 'pending' : 'error')
          return
        }
        setState('ready')
      } catch {
        if (!controller.signal.aborted) setState('error')
      }
    }
    void prepare()
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    if (state !== 'ready' || !purchase?.invoiceId || autoDownloadStarted.current) return
    const key = `wml-pro-download-${purchase.invoiceId}`
    try { if (window.sessionStorage.getItem(key)) return } catch { /* Downloads still work without session storage. */ }
    autoDownloadStarted.current = true
    void (async () => {
      try {
        const response = await fetch('/api/pro/license', { cache: 'no-store' })
        if (!response.ok) throw new Error('license_download_failed')
        const license = URL.createObjectURL(await response.blob())
        const link = document.createElement('a')
        link.href = license
        link.download = 'pro-license.json'
        document.body.append(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(license), 60_000)
        try { window.sessionStorage.setItem(key, '1') } catch { /* Optional duplicate guard. */ }
        const installer = document.createElement('iframe')
        installer.hidden = true
        installer.src = '/api/pro/installer'
        document.body.append(installer)
        window.setTimeout(() => installer.remove(), 60_000)
      } catch {
        autoDownloadStarted.current = false
      }
    })()
  }, [state, purchase?.invoiceId])

  const errorText = purchase?.error === 'checkout_not_owned' ? p.receiptAuth
    : purchase?.error === 'license_inactive' || purchase?.error === 'license_revoked' ? p.receiptInactive : p.receiptError

  return (
    <main className={styles.page}>
      <div className="section-label">WML X.X.0 · Pro</div>
      <div className={styles.hero}>
        {state === 'ready' && <span className={styles.confirmation} aria-hidden="true">✓</span>}
        <div>
          {state === 'ready' && <span className={styles.eyebrow}>{lang === 'es' ? 'COMPRA CONFIRMADA' : 'PURCHASE CONFIRMED'}</span>}
          <h1>{state === 'ready' ? p.receiptTitle : lang === 'es' ? 'Tu compra de Pro' : 'Your Pro purchase'}</h1>
          <p className={styles.pitch}>{state === 'ready' ? p.receiptReady : p.receiptIntro}</p>
        </div>
      </div>
      <section className={styles.card} aria-live="polite" aria-busy={state === 'checking'}>
        <h2>{state === 'ready' ? lang === 'es' ? 'Empieza con Pro' : 'Get started with Pro' : state === 'checking' ? p.receiptChecking : state === 'pending' ? p.receiptPending : errorText}</h2>
        {state === 'ready' && (
          <>
            <div className={styles.next}>
              <p>{lang === 'es' ? 'La descarga del widget y la licencia comienza automáticamente. Si tu navegador la bloquea, usa estos botones. Después, importa la licencia desde los ajustes de la app.' : 'Your widget and license downloads start automatically. If your browser blocks them, use these buttons. Then import the license from the app settings.'}</p>
              <div className={styles.actions}>
                <a className="btn-primary" href="/api/pro/installer">{p.installer}</a>
                <a className="btn-ghost" href="/api/pro/license" download="pro-license.json">{p.license}</a>
              </div>
              <p className={styles.instruction}>{p.importLicense}</p>
            </div>
            <h3 className={styles.summaryTitle}>{lang === 'es' ? 'Resumen de tu suscripción' : 'Your subscription'}</h3>
            <dl className={styles.summary}>
              <div><dt>Plan</dt><dd>WML X.X.0 Pro · {purchase?.plan === 'annual' ? lang === 'es' ? 'anual' : 'annual' : lang === 'es' ? 'mensual' : 'monthly'}</dd></div>
              <div><dt>{lang === 'es' ? 'Importe pagado' : 'Amount paid'}</dt><dd>{typeof purchase?.amountPaid === 'number' ? new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(purchase.amountPaid / 100) : '—'}</dd></div>
              <div><dt>{p.paidUntil}</dt><dd>{purchase?.paidUntil ? new Date(purchase.paidUntil).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</dd></div>
              <div><dt>{lang === 'es' ? 'Referencia Stripe' : 'Stripe reference'}</dt><dd className={styles.reference}>{purchase?.invoiceId || '—'}</dd></div>
            </dl>
            {purchase?.invoiceUrl && <a className={styles.invoiceLink} href={purchase.invoiceUrl} target="_blank" rel="noopener noreferrer">{lang === 'es' ? 'Ver factura de Stripe ↗' : 'View Stripe invoice ↗'}</a>}
          </>
        )}
        {(state === 'pending' || state === 'error') && <button type="button" className="btn-primary" onClick={() => { setState('checking'); setAttempt(value => value + 1) }}>{p.retry}</button>}
      </section>
      <p className={styles.renewal}>{p.renewal} {p.licenseConnection}</p>
      <div className={styles.actions}>
        <a className="btn-ghost" href="/api/pro/portal">{p.manage}</a>
        <Link className="btn-ghost" href={downloadPath(lang)}>{p.back}</Link>
        <Link className="btn-ghost" href={contactPath(lang)}>{lang === 'es' ? 'Ayuda con tu compra' : 'Purchase support'}</Link>
      </div>
    </main>
  )
}
