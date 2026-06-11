// src/lib/analytics.ts
import posthog from 'posthog-js'

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
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.identify(userId, properties)
  })
}
