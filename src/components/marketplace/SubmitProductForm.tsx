'use client'

import { FormEvent, useMemo, useState } from 'react'
import { getMinimumMarketplacePrice } from '@/lib/marketplacePricing'
import { summarizeMarketplaceZip, type MarketplaceZipSummary } from '@/lib/marketplaceZipSummary'
import type { Locale } from '@/lib/i18n'
import styles from './SubmitProductForm.module.css'

type SubmitProductFormProps = {
  lang: Locale
}

type UploadResponse = {
  uploadUrl?: string
  fileUrl?: string
  error?: string
}

type SubmitState = 'idle' | 'uploading' | 'submitting' | 'success' | 'error'

const copy = {
  es: {
    badge: 'Formulario abierto',
    title: 'Enviar pack al marketplace',
    body: 'El ZIP queda privado hasta que aprobemos el pack. La portada y las previews se sirven protegidas desde WML.',
    titleLabel: 'Nombre del pack',
    titlePlaceholder: 'Ej. Pixel Ghost Pack',
    creatorLabel: 'Nombre de creador',
    creatorPlaceholder: 'Tu nombre publico',
    emailLabel: 'Email de soporte',
    emailPlaceholder: 'tu@email.com',
    stripeLabel: 'Stripe Connect account ID',
    stripePlaceholder: 'acct_...',
    priceLabel: 'Precio',
    freeLabel: 'Gratis para quien lo quiera',
    freeHint: 'No pediremos Stripe y cualquiera podra descargarlo cuando se apruebe.',
    priceChangeHint: 'Si luego quieres cambiar el precio, escribenos desde el correo de soporte que has puesto en este formulario.',
    descriptionLabel: 'Descripcion',
    descriptionPlaceholder: 'Cuenta que incluye el pack, estilo visual, variantes y requisitos de uso.',
    zipLabel: 'ZIP del pack',
    coverLabel: 'Portada',
    previewsLabel: 'Previews',
    chooseFile: 'Seleccionar archivo',
    chooseFiles: 'Seleccionar archivos',
    noFile: 'Ningun archivo seleccionado',
    zipSummaryTitle: 'Resumen detectado',
    zipSummaryEmpty: 'Selecciona un ZIP para detectar mascotas y accesorios automaticamente.',
    petCountLabel: 'Mascotas detectadas',
    clothesCountLabel: 'Accesorios detectados',
    submit: 'Enviar para revision',
    uploading: 'Subiendo archivos...',
    submitting: 'Enviando...',
    success: 'Skin enviada. La revisaremos antes de publicarla.',
    error: 'No hemos podido enviar la skin. Revisa los campos e intentalo de nuevo.',
    minHint: 'Precio minimo',
    previewHint: 'Hasta 6 imagenes PNG, JPG, WEBP o GIF.',
    required: 'Completa los campos obligatorios y adjunta ZIP y portada.',
    stripeHint: 'Debe empezar por acct_. Solo hace falta si el pack es de pago.',
  },
  en: {
    badge: 'Form open',
    title: 'Submit pack to marketplace',
    body: 'The ZIP stays private until the pack is approved. Cover and preview images are served protected from WML.',
    titleLabel: 'Pack name',
    titlePlaceholder: 'Example: Pixel Ghost Pack',
    creatorLabel: 'Creator name',
    creatorPlaceholder: 'Your public name',
    emailLabel: 'Support email',
    emailPlaceholder: 'you@email.com',
    stripeLabel: 'Stripe Connect account ID',
    stripePlaceholder: 'acct_...',
    priceLabel: 'Price',
    freeLabel: 'Free for anyone',
    freeHint: 'We will not ask for Stripe and anyone can download it once approved.',
    priceChangeHint: 'If you want to change the price later, email us from the support email you entered in this form.',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe what is included, visual style, variants, and usage requirements.',
    zipLabel: 'Pack ZIP',
    coverLabel: 'Cover image',
    previewsLabel: 'Previews',
    chooseFile: 'Choose file',
    chooseFiles: 'Choose files',
    noFile: 'No file selected',
    zipSummaryTitle: 'Detected summary',
    zipSummaryEmpty: 'Select a ZIP to detect pets and accessories automatically.',
    petCountLabel: 'Detected pets',
    clothesCountLabel: 'Detected accessories',
    submit: 'Send for review',
    uploading: 'Uploading files...',
    submitting: 'Submitting...',
    success: 'Skin submitted. We will review it before publishing.',
    error: 'We could not submit the skin. Check the fields and try again.',
    minHint: 'Minimum price',
    previewHint: 'Up to 6 PNG, JPG, WEBP, or GIF images.',
    required: 'Complete the required fields and attach a ZIP and cover image.',
    stripeHint: 'Must start with acct_. Only required for paid packs.',
  },
} satisfies Record<Locale, Record<string, string>>

function contentTypeFor(file: File) {
  if (file.type) return file.type

  const name = file.name.toLowerCase()
  if (name.endsWith('.zip')) return 'application/zip'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.gif')) return 'image/gif'

  return 'application/octet-stream'
}

function safeFileName(fileName: string) {
  const cleaned = fileName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return cleaned || 'upload'
}

function uploadPath(kind: 'zip' | 'cover' | 'preview', file: File) {
  const folder = kind === 'zip'
    ? 'marketplace-submissions'
    : kind === 'cover'
      ? 'marketplace-covers'
      : 'marketplace-previews'

  return `${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`
}

async function uploadFile(file: File, kind: 'zip' | 'cover' | 'preview') {
  const pathname = uploadPath(kind, file)
  const contentType = contentTypeFor(file)
  const metadataResponse = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pathname,
      contentType,
      size: file.size,
    }),
  })
  const metadata = await metadataResponse.json().catch(() => ({})) as UploadResponse

  if (!metadataResponse.ok || !metadata.uploadUrl || !metadata.fileUrl) {
    throw new Error(metadata.error || 'Unable to create upload URL')
  }

  try {
    const uploadResponse = await fetch(metadata.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    })

    if (uploadResponse.ok) {
      return metadata.fileUrl
    }
  } catch {
    // Fall back to the internal relay below.
  }

  const relayParams = new URLSearchParams({
    pathname,
    contentType,
    size: String(file.size),
  })
  const relayResponse = await fetch(`/api/upload/relay?${relayParams.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  const relayData = await relayResponse.json().catch(() => ({})) as { fileUrl?: string; error?: string }

  if (!relayResponse.ok || !relayData.fileUrl) {
    throw new Error(relayData.error || 'Upload failed')
  }

  return relayData.fileUrl
}

export function SubmitProductForm({ lang }: SubmitProductFormProps) {
  const t = copy[lang]
  const minimumPrice = useMemo(() => getMinimumMarketplacePrice(), [])
  const [formStartedAt] = useState(() => Date.now())
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [zipSummary, setZipSummary] = useState<MarketplaceZipSummary | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [isFree, setIsFree] = useState(false)
  const [priceInput, setPriceInput] = useState(() => minimumPrice.toFixed(2))

  const isBusy = state === 'uploading' || state === 'submitting'
  const zipFileName = zipFile?.name ?? t.noFile
  const coverFileName = coverFile?.name ?? t.noFile
  const previewFileName = previewFiles.length > 0
    ? previewFiles.map((file) => file.name).join(', ')
    : t.noFile

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    const form = event.currentTarget
    const data = new FormData(form)
    const title = String(data.get('title') ?? '').trim()
    const description = String(data.get('description') ?? '').trim()
    const creatorName = String(data.get('creator_name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const stripeAccountId = String(data.get('stripe_account_id') ?? '').trim()
    const price = isFree ? 0 : Number(priceInput)
    const website = String(data.get('website') ?? '').trim()

    if (!title || !description || !creatorName || !email || (!isFree && !stripeAccountId) || !zipFile || !coverFile || !zipSummary) {
      setState('error')
      setMessage(t.required)
      return
    }

    try {
      setState('uploading')
      const [blobUrl, coverImageUrl] = await Promise.all([
        uploadFile(zipFile, 'zip'),
        uploadFile(coverFile, 'cover'),
      ])
      const previewImageUrls = await Promise.all(
        previewFiles.slice(0, 6).map((file) => uploadFile(file, 'preview')),
      )

      setState('submitting')
      const submitResponse = await fetch('/api/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          creator_name: creatorName,
          email,
          stripe_account_id: isFree ? null : stripeAccountId,
          price,
          blob_url: blobUrl,
          cover_image_url: coverImageUrl,
          preview_image_urls: previewImageUrls,
          website,
          form_started_at: formStartedAt,
        }),
      })
      const submitData = await submitResponse.json().catch(() => ({})) as { error?: string }

      if (!submitResponse.ok) {
        throw new Error(submitData.error || 'Unable to submit product')
      }

      form.reset()
      setZipFile(null)
      setZipSummary(null)
      setCoverFile(null)
      setPreviewFiles([])
      setIsFree(false)
      setPriceInput(minimumPrice.toFixed(2))
      setState('success')
      setMessage(t.success)
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error && error.message ? error.message : t.error)
    }
  }

  async function handleZipChange(file: File | null) {
    setZipFile(file)
    setZipSummary(null)
    setMessage('')

    if (!file) return

    try {
      setZipSummary(summarizeMarketplaceZip(await file.arrayBuffer()))
      setState((current) => current === 'error' ? 'idle' : current)
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error && error.message ? error.message : 'Invalid ZIP file')
    }
  }

  function handleFreeChange(checked: boolean) {
    setIsFree(checked)
    setPriceInput(checked ? '0.00' : minimumPrice.toFixed(2))
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <span>{t.badge}</span>
        <h2>{t.title}</h2>
        <p>{t.body}</p>
      </div>

      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span>{t.titleLabel}</span>
          <input name="title" type="text" maxLength={140} placeholder={t.titlePlaceholder} required disabled={isBusy} />
        </label>

        <label className={styles.field}>
          <span>{t.creatorLabel}</span>
          <input name="creator_name" type="text" maxLength={80} placeholder={t.creatorPlaceholder} required disabled={isBusy} />
        </label>

        <label className={styles.field}>
          <span>{t.emailLabel}</span>
          <input name="email" type="email" maxLength={254} placeholder={t.emailPlaceholder} required disabled={isBusy} />
        </label>

        <label className={styles.field}>
          <span>{t.stripeLabel}</span>
          <input name="stripe_account_id" type="text" pattern="acct_[A-Za-z0-9]+" placeholder={t.stripePlaceholder} required={!isFree} disabled={isBusy || isFree} />
          <small>{t.stripeHint}</small>
        </label>

        <label className={styles.field}>
          <span>{t.priceLabel}</span>
          <input
            name="price"
            type="number"
            min={isFree ? 0 : minimumPrice}
            step="0.01"
            value={priceInput}
            required
            disabled={isBusy || isFree}
            onChange={(event) => setPriceInput(event.target.value)}
          />
          <small>{isFree ? t.freeHint : `${t.minHint}: ${minimumPrice.toFixed(2)}`}</small>
          <small>{t.priceChangeHint}</small>
        </label>

        <label className={styles.freeField}>
          <input
            type="checkbox"
            checked={isFree}
            disabled={isBusy}
            onChange={(event) => handleFreeChange(event.target.checked)}
          />
          <span>
            <strong>{t.freeLabel}</strong>
            <small>{t.freeHint}</small>
          </span>
        </label>

        <label className={`${styles.field} ${styles.descriptionField}`}>
          <span>{t.descriptionLabel}</span>
          <textarea name="description" minLength={40} maxLength={1600} rows={7} placeholder={t.descriptionPlaceholder} required disabled={isBusy} />
        </label>
      </div>

      <div className={styles.uploadGrid}>
        <label className={styles.fileField}>
          <span className={styles.fileLabel}>{t.zipLabel}</span>
          <input
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            required
            disabled={isBusy}
            onChange={(event) => handleZipChange(event.target.files?.[0] ?? null)}
          />
          <span className={styles.fileBox}>
            <strong>{t.chooseFile}</strong>
            <em>{zipFileName}</em>
          </span>
        </label>

        <div className={styles.zipSummary}>
          <span>{t.zipSummaryTitle}</span>
          {zipSummary ? (
            <dl>
              <div>
                <dt>{t.petCountLabel}</dt>
                <dd>{zipSummary.petCount}</dd>
              </div>
              <div>
                <dt>{t.clothesCountLabel}</dt>
                <dd>{zipSummary.clothesCount}</dd>
              </div>
            </dl>
          ) : (
            <p>{t.zipSummaryEmpty}</p>
          )}
        </div>

        <label className={styles.fileField}>
          <span className={styles.fileLabel}>{t.coverLabel}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            required
            disabled={isBusy}
            onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
          />
          <span className={styles.fileBox}>
            <strong>{t.chooseFile}</strong>
            <em>{coverFileName}</em>
          </span>
        </label>

        <label className={styles.fileField}>
          <span className={styles.fileLabel}>{t.previewsLabel}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            disabled={isBusy}
            onChange={(event) => setPreviewFiles(Array.from(event.target.files ?? []).slice(0, 6))}
          />
          <span className={styles.fileBox}>
            <strong>{t.chooseFiles}</strong>
            <em>{previewFileName}</em>
          </span>
          <small>{t.previewHint}</small>
        </label>
      </div>

      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>

      <div className={styles.footer}>
        <button type="submit" disabled={isBusy}>
          {state === 'uploading' ? t.uploading : state === 'submitting' ? t.submitting : t.submit}
        </button>
        {message ? (
          <p className={state === 'success' ? styles.success : styles.error}>{message}</p>
        ) : null}
      </div>
    </form>
  )
}
