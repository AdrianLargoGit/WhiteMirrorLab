import { NextResponse } from 'next/server'
import { BREVO_COUNT_FALLBACK } from '@/lib/brevo-count'
import { getBrevoListCount, type SubscribeSource } from '@/lib/brevo-subscribe'

const toSource = (value: string | null): SubscribeSource => (
  value === 'tech' || value === 'social' ? value : 'general'
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const source = toSource(searchParams.get('source'))

  try {
    const result = await getBrevoListCount(source)
    if (!result.ok) {
      return NextResponse.json({ count: result.count }, { status: result.status })
    }

    return NextResponse.json({ count: result.count })
  } catch (err) {
    console.error('Brevo count fetch error:', err)
    return NextResponse.json({ count: BREVO_COUNT_FALLBACK }, { status: 500 })
  }
}
