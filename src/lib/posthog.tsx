'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, type ReactNode } from 'react'
import { getLocaleFromPathname } from './i18n'

export const ANALYTICS_CONSENT_KEY = 'wml_cookie_consent'
export const ANALYTICS_CONSENT_EVENT = 'wml:analytics-consent'

type ConsentRecord = {
  essential: true
  analytics: boolean
  timestamp: string
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(ANALYTICS_CONSENT_KEY)
    if (!raw) return false
    return (JSON.parse(raw) as Partial<ConsentRecord>).analytics === true
  } catch {
    return false
  }
}

function initializePostHog() {
  if (typeof window === 'undefined' || posthog.__loaded) return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY_WML_1_0
  if (!key) return

  // 🛠️ SOLUCIÓN TOOLBAR: Convertimos el proxy relativo en una URL absoluta dinámicamente
  const absoluteApiHost = `${window.location.origin}/ingest`

  posthog.init(key, {
    api_host: absoluteApiHost,
    // 🛠️ SOLUCIÓN 401 EUROPA: Forzamos el host de la interfaz a los servidores de la UE por defecto
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST_WML_1_0 || 'https://eu.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    respect_dnt: true,
    persistence: 'localStorage+cookie',
    disable_session_recording: true,
  })

  if (hasAnalyticsConsent()) posthog.opt_in_capturing()
  else posthog.opt_out_capturing()
}

function analyticsContext() {
  const path = window.location.pathname
  return {
    locale: getLocaleFromPathname(path),
    path,
    route_area: path.includes('/wml-1-0') || path.startsWith('/web') ? 'wml_1_0' : 'landing',
    viewport: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1120 ? 'tablet' : 'desktop',
  }
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializePostHog()

    const handleConsent = (event: Event) => {
      const accepted = (event as CustomEvent<{ analytics: boolean }>).detail.analytics
      if (accepted) {
        posthog.opt_in_capturing()
        posthog.capture('analytics_consent_updated', { analytics: true, ...analyticsContext() })
      } else {
        posthog.opt_out_capturing()
        posthog.reset()
      }
    }

    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent)
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent)
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}

export type WMLEvent =
  | '$pageview'
  | 'analytics_consent_updated'
  | 'post_upload'
  | 'post_deleted'
  | 'post_tap'
  | 'pulse_upload'
  | 'pulse_reply'
  | 'pulse_deleted'
  | 'story_upload'
  | 'story_view'
  | 'story_completed'
  | 'vote_cast'
  | 'vote_flipped'
  | 'vote_changed'
  | 'vote_removed'
  | 'profile_view'
  | 'profile_edit'
  | 'profile_shared'
  | 'search_query'
  | 'ranking_view'
  | 'feed_scroll_depth'
  | 'auth_signup'
  | 'auth_signup_pending_confirm'
  | 'auth_login'
  | 'auth_logout'
  | 'auth_forgot_password'
  | 'auth_password_reset_success'
  | 'terms_accepted'
  | 'experiment_consent_given'
  | 'experiment_started'
  | 'quiz_completed'

export function captureEvent(
  event: WMLEvent,
  properties?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return
  initializePostHog()
  posthog.capture(event, { ...analyticsContext(), ...properties })
}

export function capturePageView() {
  captureEvent('$pageview', {
    $current_url: `${window.location.origin}${window.location.pathname}`,
  })
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return
  initializePostHog()
  posthog.identify(userId, properties)
}

export function resetAnalyticsIdentity() {
  if (typeof window === 'undefined') return
  posthog.reset()
}