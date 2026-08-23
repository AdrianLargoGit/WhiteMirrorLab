'use client'

import { useEffect } from 'react'

type AutoEvidenceDownloadProps = {
  href: string
  enabled: boolean
}

export function AutoEvidenceDownload({ href, enabled }: AutoEvidenceDownloadProps) {
  useEffect(() => {
    if (!enabled) return

    const timeoutId = window.setTimeout(() => {
      window.location.href = href
    }, 450)

    return () => window.clearTimeout(timeoutId)
  }, [enabled, href])

  return null
}
