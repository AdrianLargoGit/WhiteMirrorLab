import { NextRequest, NextResponse } from 'next/server'
import { getEvidenceArchiveStatus } from '@/lib/blogArchiveZip'
import { createBlogEvidenceCheckout } from '@/lib/stripeEvidence'
import { isLocale } from '@/lib/i18n'
import { findUnsolvedSerialCase } from '@/lib/unsolvedSerialCases'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('case')
  const localeParam = request.nextUrl.searchParams.get('lang')
  const ageConfirmed = request.nextUrl.searchParams.get('age_confirmed')
  const caseFile = findUnsolvedSerialCase(slug)
  const locale = isLocale(localeParam) ? localeParam : 'es'

  if (!caseFile) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  const evidenceStatus = getEvidenceArchiveStatus(caseFile)
  if (!evidenceStatus.isMarketable) {
    return NextResponse.json({ error: 'Evidence archive not ready' }, { status: 404 })
  }

  if (ageConfirmed !== '1') {
    return NextResponse.json({ error: 'Age confirmation required' }, { status: 403 })
  }

  const checkout = await createBlogEvidenceCheckout({
    caseFile,
    locale,
    origin: request.nextUrl.origin,
  })

  if (!checkout.url) {
    return NextResponse.json({ error: 'Stripe checkout URL missing' }, { status: 502 })
  }

  return NextResponse.redirect(checkout.url, 303)
}
