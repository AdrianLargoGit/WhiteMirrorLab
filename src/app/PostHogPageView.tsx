'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { capturePageView } from '@/lib/posthog'

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
    if (pathname) capturePageView()
  }, [pathname, searchParams])

  return null
}
