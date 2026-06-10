'use client'

import { useState } from 'react'
import type { Story, PublicProfile } from '@/lib/types'
import { uploadStory } from '@/lib/upload'
import { captureEvent } from '@/lib/analytics'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'

interface StoryBarProps {
  stories: (Story & { profile: PublicProfile })[]
  currentUserId: string
  onStoryAdded: () => void
}

export function StoryBar({ stories, currentUserId, onStoryAdded }: StoryBarProps) {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [viewer, setViewer] = useState<(Story & { profile: PublicProfile }) | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadStory(currentUserId, file)
      captureEvent('story_uploaded', { locale })
      onStoryAdded()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.uploadStoryError)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <>
      <div className="wml-section-title">{t.stories}</div>
      <div className="wml-stories">
        <label className="wml-story-item wml-upload-label">
          <div className="wml-story-add">{uploading ? '...' : '+'}</div>
          <span>{t.yourStory}</span>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>

        {stories.map((story) => (
          <button
            key={story.id}
            type="button"
            className="wml-story-item"
            onClick={() => {
              setViewer(story)
              captureEvent('story_viewed', { user_id: story.user_id, locale })
            }}
          >
            <div className="wml-story-ring">
              <img src={story.url} alt="" />
            </div>
            <span>{story.profile?.username ?? '?'}</span>
          </button>
        ))}
      </div>

      {viewer && (
        <div className="wml-modal-overlay" onClick={() => setViewer(null)}>
          <button type="button" className="wml-modal-close" onClick={() => setViewer(null)}>x</button>
          <div className="wml-story-viewer" onClick={(e) => e.stopPropagation()}>
            <img src={viewer.url} alt="" />
            <div className="wml-story-viewer-meta">
              @{viewer.profile?.username}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
