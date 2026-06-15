import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthProvider } from '@/lib/authcontext'
import { PostHogProvider } from '@/lib/posthog'
import AppShell from '@/components/wml/AppShell'
import '@/app/web/navbarwml.css'

export const metadata: Metadata = {
  title: 'WML 1.0 — Karma Score',
  description: 'Experimento social. ¿Qué ocurre cuando todos tienen una nota pública?',
}

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/*
        PostHogProvider uses useSearchParams internally — Suspense boundary required
        so Next.js doesn't bail out of static rendering for the whole route tree.
      */}
      <Suspense fallback={null}>
        <PostHogProvider>
          <AppShell>{children}</AppShell>
        </PostHogProvider>
      </Suspense>
    </AuthProvider>
  )
}