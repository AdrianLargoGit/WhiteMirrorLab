import { NextResponse } from 'next/server'

type LeaderboardEntry = { id: string; name: string; points: number; floor: number; at: number }
type LeaderboardState = { leaderboard: LeaderboardEntry[] }

declare global {
  var wmlRoguelikeScoreState: LeaderboardState | undefined
}

function room() {
  globalThis.wmlRoguelikeScoreState ??= { leaderboard: [] }
  globalThis.wmlRoguelikeScoreState.leaderboard ??= []
  return globalThis.wmlRoguelikeScoreState
}

function snapshot() {
  const state = room()
  return NextResponse.json({ leaderboard: state.leaderboard.slice(0, 10) })
}

export async function GET() {
  return snapshot()
}

export async function POST(request: Request) {
  const state = room()
  const body = await request.json().catch(() => null) as {
    type?: string
    score?: LeaderboardEntry
  } | null

  if (body?.type === 'score' && body.score) {
    const safeScore = {
      id: String(body.score.id ?? 'unknown').slice(0, 24),
      name: String(body.score.name ?? 'Runner').slice(0, 20),
      points: Math.max(0, Math.floor(body.score.points)),
      floor: Math.max(1, Math.floor(body.score.floor)),
      at: Date.now(),
    }
    const previous = state.leaderboard.find((entry) => entry.id === safeScore.id)
    state.leaderboard = [
      ...state.leaderboard.filter((entry) => entry.id !== safeScore.id),
      previous && previous.points > safeScore.points ? previous : safeScore,
    ].sort((a, b) => b.points - a.points || b.floor - a.floor).slice(0, 10)
    return snapshot()
  }

  return snapshot()
}
