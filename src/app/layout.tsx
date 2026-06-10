import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { PHProvider } from './providers'
import { PostHogPageView } from './PostHogPageView'

export const metadata: Metadata = {
  title: 'White Mirror Lab',
  description:
    'Laboratorio de experimentación social. Diseñamos aplicaciones que empujan los límites del comportamiento colectivo.',
  themeColor: '#080808',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <PHProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PHProvider>
      </body>
    </html>
  )
}