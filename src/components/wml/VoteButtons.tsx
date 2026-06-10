'use client'

import { useState } from 'react'
import { castVote } from '@/lib/votes'

interface VoteButtonsProps {
  voterId: string
  targetId: string
  initialVote: boolean | null
  onVoted?: () => void
}

export function VoteButtons({ voterId, targetId, initialVote, onVoted }: VoteButtonsProps) {
  const [myVote, setMyVote] = useState<boolean | null>(initialVote)
  const [loading, setLoading] = useState(false)

  const handleVote = async (isPositive: boolean) => {
    if (voterId === targetId) return
    setLoading(true)
    const result = await castVote(voterId, targetId, isPositive)
    setLoading(false)
    if (result.success) {
      if (myVote === isPositive) {
        setMyVote(null)
      } else {
        setMyVote(isPositive)
      }
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
        <span className="wml-vote-btn-icon">+</span> Positivo
      </button>
      <button
        type="button"
        className={`wml-vote-btn wml-vote-btn-neg${myVote === false ? ' active-neg' : ''}`}
        onClick={() => handleVote(false)}
        disabled={loading}
      >
        <span className="wml-vote-btn-icon">−</span> Negativo
      </button>
    </div>
  )
}
