'use client'

import { useEffect, useRef, useState } from 'react'
import type { Story, Profile } from '@/lib/database.types'
import { AvatarMini } from './AppShell'

type StoryWithProfile = Story & {
  profile: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'display_name'>
}

const DURATION_MS = 5000

interface Props {
  story: StoryWithProfile
  onClose: () => void
  onCompleted?: () => void
}

export default function StoryViewer({ story, onClose, onCompleted }: Props) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef<number>(Date.now())
  const rafRef   = useRef<number>(0)

  useEffect(() => {
    startRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const pct     = Math.min((elapsed / DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onCompleted?.()
        onClose()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onClose, onCompleted])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="wml-story-viewer" onClick={onClose}>
      <div className="wml-story-viewer-inner" onClick={(e) => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="wml-story-progress">
          <div className="wml-story-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Close */}
        <button className="wml-story-close" onClick={onClose} aria-label="Cerrar historia">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6"  y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Media */}
        <img src={story.media_url} alt="Historia" className="wml-story-media" />

        {/* Author overlay */}
        <div className="wml-story-viewer-info">
          <AvatarMini profile={story.profile} size={32} />
          <div>
            <div style={{ fontFamily: 'var(--w-font-display)', fontWeight: 700, fontSize: 13, color: 'var(--w-white)' }}>
              {story.profile.display_name}
            </div>
            <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, color: 'rgba(240,237,232,0.5)', letterSpacing: '0.06em' }}>
              @{story.profile.username}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}