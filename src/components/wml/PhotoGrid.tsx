'use client'

import { useState } from 'react'
import type { Photo } from '@/lib/types'
import { uploadPhoto } from '@/lib/upload'
import { captureEvent } from '@/lib/analytics'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'

interface PhotoGridProps {
  photos: Photo[]
  userId: string
  editable?: boolean
  onPhotoAdded?: () => void
}

export function PhotoGrid({ photos, userId, editable, onPhotoAdded }: PhotoGridProps) {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(userId, file)
      captureEvent('photo_uploaded', { locale })
      onPhotoAdded?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.uploadPhotoError)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="wml-section-title">
        {t.photosTitle} {editable && t.photosReplaceHint}
      </div>
      <div className="wml-photos">
        {photos.map((photo) => (
          <div key={photo.id} className="wml-photo">
            <img src={photo.url} alt="" />
          </div>
        ))}
        {editable && photos.length < 5 && (
          <label className="wml-photo wml-upload-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--w-muted)' }}>
            {uploading ? '...' : '+'}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
        {editable && photos.length >= 5 && (
          <label className="wml-photo wml-upload-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--w-muted)', fontSize: 11, textAlign: 'center', padding: 4, whiteSpace: 'pre-line' }}>
            {uploading ? '...' : t.newPhoto}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  )
}
