import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import './globals.css'
import { PHProvider } from './providers'
import { PostHogPageView } from './PostHogPageView'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'White Mirror Lab',
  description:
    'Social experimentation lab. We design applications that explore the limits of collective behavior.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080808',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerLocale = (await headers()).get('x-wml-locale')
  const lang: Locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE

  return (
    <html lang={lang}>
      <body>
        <PHProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
          <CookieBanner />
        </PHProvider>
      </body>
    </html>
  )
}
