'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/authcontext'

// Función interna rápida para comprobar si el usuario dio permiso de analíticas
const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false
  const consentRaw = localStorage.getItem('wml_cookie_consent')
  if (!consentRaw) return true // Si aún no ha contestado el banner, permitimos el tracking inicial (o pon false si quieres ser estricto GDPR)
  try {
    const consent = JSON.parse(consentRaw)
    return consent.analytics !== false
  } catch {
    return true
  }
}

// ── Initialise PostHog once ───────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY_WML_1_0
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST_WML_1_0

  if (key && host) {
    posthog.init(key, {
      api_host: '/ingest',
      ui_host: host,
      capture_pageview: false, // Controlado manualmente abajo
      respect_dnt: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
      persistence: 'localStorage+cookie',
    })
  }
}

// ── Pageview tracker ─────────────────────────────────────────────────────────
function PageviewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (!ph) return
    
    // CANDADO: Si no hay consentimiento de analíticas, bloqueamos el tracking de páginas
    if (!hasAnalyticsConsent()) return

    ph.capture('$pageview', {
      $current_url: window.location.href,
    })
  }, [pathname, searchParams, ph])

  return null
}

// ── Identity linker (Supabase UUID ↔ PostHog Anonymous ID) ───────────────────
function IdentityLinker() {
  const { profile } = useAuth()
  const ph = usePostHog()

  useEffect(() => {
    if (!ph) return
    
    // CANDADO: Si no hay consentimiento, no vinculamos identidades
    if (!hasAnalyticsConsent()) return

    if (profile) {
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

// ── Tipos de Eventos de la App ───────────────────────────────────────────────
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
  | 'auth_signup_pending_confirm'
  | 'experiment_consent_given'
  | 'vote_changed'
  | 'experiment_started'
  | 'vote_removed'
  | 'quiz_completed'

// ── AYUDANTE 1: Captura de eventos tipados en cualquier parte ─────────────────
export function captureEvent(
  event: WMLEvent,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === 'undefined') return
  
  // CANDADO: Si rechazó las cookies analíticas, salimos en seco sin enviar nada
  if (!hasAnalyticsConsent()) return

  posthog.capture(event, properties)
}

// ── AYUDANTE 2: Identificación manual (Por si acaso la necesitas fuera del Provider) ──
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return

  posthog.identify(userId, properties)
}