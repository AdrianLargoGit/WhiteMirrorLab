'use client'

import { useState } from 'react'
import { castVote } from '@/lib/votes'
import { useLocale } from '@/hooks/useLocale'
import { wmlCopy } from '@/lib/copy'

interface VoteButtonsProps {
  voterId: string
  targetId: string
  initialVote: boolean | null
  onVoted?: () => void
}

export function VoteButtons({ voterId, targetId, initialVote, onVoted }: VoteButtonsProps) {
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [myVote, setMyVote] = useState<boolean | null>(initialVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (isPositive: boolean) => {
    if (voterId === targetId) return
    setLoading(true)
    const result = await castVote(voterId, targetId, isPositive)
    setLoading(false)
    if (result.success) {
      setMyVote(myVote === isPositive ? null : isPositive)
      onVoted?.()
    }
  }

  if (voterId === targetId) return null

  return (
    <div className="wml-vote-btns wml-vote-btns-compact">
      <button
        type="button"
        className={`wml-vote-btn wml-vote-btn-pos${myVote === true ? ' active-pos' : ''}`}
        onClick={() => handleVote(true)}
        disabled={loading}
      >
        <span className="wml-vote-btn-icon">+</span> {t.positive}
      </button>
      <button
        type="button"
        className={`wml-vote-btn wml-vote-btn-neg${myVote === false ? ' active-neg' : ''}`}
        onClick={() => handleVote(false)}
        disabled={loading}
      >
        <span className="wml-vote-btn-icon">-</span> {t.negative}
      </button>
    </div>
  )
}
