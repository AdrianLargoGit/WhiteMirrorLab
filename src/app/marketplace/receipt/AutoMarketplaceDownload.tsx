'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from '../payment-pages.module.css'

type AutoMarketplaceDownloadProps = {
  productId?: string
  sessionId?: string
  lang: 'es' | 'en'
}

export default function AutoMarketplaceDownload({
  productId,
  sessionId,
  lang,
}: AutoMarketplaceDownloadProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const downloadUrl = useMemo(() => {
    if (!productId || !sessionId) return null

    const params = new URLSearchParams({
      product: productId,
      session_id: sessionId,
    })

    return `/api/marketplace/download?${params.toString()}`
  }, [productId, sessionId])

  useEffect(() => {
    if (!downloadUrl || status !== 'idle') return

    let objectUrl: string | null = null

    const download = async () => {
      setStatus('loading')

      try {
        const response = await fetch(downloadUrl, { cache: 'no-store' })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(
            typeof payload?.error === 'string'
              ? payload.error
              : 'Download could not be prepared',
          )
        }

        const blob = await response.blob()
        const disposition = response.headers.get('content-disposition') ?? ''
        const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ?? 'wml-creator-pack.zip'
        objectUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = objectUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        link.remove()
        setStatus('done')
      } catch (downloadError) {
        setError(downloadError instanceof Error ? downloadError.message : 'Download failed')
        setStatus('error')
      }
    }

    download()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [downloadUrl, status])

  return (
    <p className={styles.downloadStatus}>
      {status === 'done'
        ? lang === 'es'
          ? 'Descarga iniciada.'
          : 'Download started.'
        : status === 'error'
          ? lang === 'es'
            ? `No se pudo iniciar la descarga: ${error}`
            : `Download could not start: ${error}`
          : downloadUrl
            ? lang === 'es'
              ? 'Verificando pago y preparando descarga...'
              : 'Verifying payment and preparing download...'
            : lang === 'es'
              ? 'Abre esta pagina desde el boton del recibo para descargar tu pack.'
              : 'Open this page from the receipt button to download your pack.'}
    </p>
  )
}
