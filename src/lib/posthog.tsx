'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/authcontext'

// ── Initialise PostHog once ───────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY_WML_1_0
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST_WML_1_0

  if (key && host) {
    posthog.init(key, {
      // Route through Next.js rewrites (/ingest → posthog host) to avoid adblockers
      api_host: '/ingest',
      ui_host: host,
      // Capture pageviews manually so we get the right Next.js route
      capture_pageview: false,
      // Respect Do Not Track
      respect_dnt: true,
      // Session recording — useful for UX research
      session_recording: {
        maskAllInputs: true,          // never record passwords / emails
        maskTextSelector: '[data-ph-mask]', // opt-in mask for sensitive UI text
      },
      // Persistence: use localStorage so anonymous IDs survive refreshes
      persistence: 'localStorage+cookie',
    })
  }
}

// ── Pageview tracker (inside PHProvider so usePostHog works) ─────────────────
function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (!ph) return
    ph.capture('$pageview', {
      $current_url: window.location.href,
    })
  }, [pathname, searchParams, ph])

  return null
}

// ── Identity linker — ties PostHog anonymous ID to Supabase user once logged in
function IdentityLinker() {
  const { profile } = useAuth()
  const ph = usePostHog()

  useEffect(() => {
    if (!ph) return
    if (profile) {
      // Identify by a non-PII stable ID (Supabase UUID)
      ph.identify(profile.id, {
        username: profile.username,
        country: profile.country ?? undefined,
        preferred_language: profile.preferred_language ?? undefined,
        created_at: profile.created_at,
      })
    } else {
      ph.reset()
    }
  }, [profile, ph])

  return null
}

// ── Public provider ───────────────────────────────────────────────────────────
export function PostHogProvider({ children }: { children: ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PageviewTracker />
      <IdentityLinker />
      {children}
    </PHProvider>
  )
}

// ── Typed event helper — import and call anywhere in the app ─────────────────
export type WMLEvent =
  | 'post_upload'
  | 'story_upload'
  | 'vote_cast'
  | 'vote_flipped'
  | 'profile_view'
  | 'story_view'
  | 'story_completed'
  | 'search_query'
  | 'ranking_view'
  | 'feed_scroll_depth'
  | 'post_tap'
  | 'auth_signup'
  | 'auth_login'
  | 'terms_accepted'
  | 'post_deleted'


export function captureEvent(
  event: WMLEvent,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  posthog.capture(event, properties)
}