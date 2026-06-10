'use client'

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.capture(event, properties)
  })
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
