import { NextResponse } from 'next/server'
import { browserProPurchase, proApiError } from '@/lib/proApi'
import { PRO_PRIVATE_HEADERS, proInstallerUrl } from '@/lib/proConfig'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await browserProPurchase()
    const response = NextResponse.redirect(proInstallerUrl(), 303)
    for (const [key, value] of Object.entries(PRO_PRIVATE_HEADERS)) response.headers.set(key, value)
    return response
  } catch (error) { return proApiError(error) }
}
