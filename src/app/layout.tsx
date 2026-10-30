import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n'
import { LocaleProvider } from '@/lib/localeContext'
import CustomCursor from '@/components/CustomCursor'

export const metadata: Metadata = {
  title: 'White Mirror Lab',
  description:
    'Digital product lab behind WML X.X.0, a local Windows desktop pet with clear privacy limits.',
  other: {
    'google-adsense-account': 'ca-pub-1100562858393483',
  },
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Shared by every route in the App Router; retain the existing font CSS unchanged. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap"
        />
      </head>
      <body>
        <LocaleProvider locale={lang}>
          {children}
          <CustomCursor priority />
        </LocaleProvider>
      </body>
    </html>
  )
}
