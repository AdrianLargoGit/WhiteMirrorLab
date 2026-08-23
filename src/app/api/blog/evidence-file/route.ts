import { NextRequest, NextResponse } from 'next/server'
import { buildCaseArchive, getEvidenceArchiveStatus } from '@/lib/blogArchiveZip'
import { isPaidEvidenceSession, isStripeCheckoutSessionId, retrieveStripeCheckoutSession } from '@/lib/stripeEvidence'
import { findUnsolvedSerialCase } from '@/lib/unsolvedSerialCases'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('case')
  const sessionId = request.nextUrl.searchParams.get('session_id')
  const caseFile = findUnsolvedSerialCase(slug)

  if (!caseFile) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing Stripe session' }, { status: 400 })
  }

  if (!isStripeCheckoutSessionId(sessionId)) {
    return NextResponse.json({ error: 'Invalid Stripe session' }, { status: 400 })
  }

  const evidenceStatus = getEvidenceArchiveStatus(caseFile)
  if (!evidenceStatus.isMarketable) {
    return NextResponse.json({ error: 'Evidence archive not ready' }, { status: 404 })
  }

  const session = await retrieveStripeCheckoutSession(sessionId)
  if (!isPaidEvidenceSession(session, caseFile.slug)) {
    return NextResponse.json({ error: 'Payment not verified' }, { status: 402 })
  }

  const archive = buildCaseArchive(caseFile)
  const fileName = `${caseFile.dossierCode.toLowerCase()}-${caseFile.slug}-evidence.zip`

  return new NextResponse(archive, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(archive.byteLength),
      'Cache-Control': 'private, no-store',
    },
  })
}
