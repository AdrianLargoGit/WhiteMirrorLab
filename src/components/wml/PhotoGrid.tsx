'use client'

import { useState } from 'react'
import type { Photo } from '@/lib/types'
import { uploadPhoto } from '@/lib/upload'
import { captureEvent } from '@/lib/analytics'

interface PhotoGridProps {
  photos: Photo[]
  userId: string
  editable?: boolean
  onPhotoAdded?: () => void
}

export function PhotoGrid({ photos, userId, editable, onPhotoAdded }: PhotoGridProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(userId, file)
      captureEvent('photo_uploaded')
      onPhotoAdded?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir foto')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="wml-section-title">
        Fotos · máx. 5 {editable && '(la más antigua se borra al subir una nueva)'}
      </div>
      <div className="wml-photos">
        {photos.map((photo) => (
          <div key={photo.id} className="wml-photo">
            <img src={photo.url} alt="" />
          </div>
        ))}
        {editable && photos.length < 5 && (
          <label className="wml-photo wml-upload-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--w-muted)' }}>
            {uploading ? '…' : '+'}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
        {editable && photos.length >= 5 && (
          <label className="wml-photo wml-upload-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--w-muted)', fontSize: 11, textAlign: 'center', padding: 4 }}>
            {uploading ? '…' : 'Nueva\n(reemplaza)'}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>
    </div>
  )
}
