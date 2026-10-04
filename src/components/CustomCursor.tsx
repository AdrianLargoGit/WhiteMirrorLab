'use client'

import { useEffect, useRef } from 'react'
import { CURSOR_HOTSPOTS } from '@/lib/cursor'
import styles from './CustomCursor.module.css'

declare global {
  interface Window {
    __wmlCustomCursorMounted?: boolean
  }
}

type CustomCursorProps = {
  priority?: boolean
}

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, summary, label, [role="button"], [role="link"], [contenteditable="true"], [onclick], [tabindex]:not([tabindex="-1"])'

export default function CustomCursor({ priority = false }: CustomCursorProps) {
  if (!priority) return null

  return <ActiveCursor />
}

function ActiveCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.__wmlCustomCursorMounted) return

    window.__wmlCustomCursorMounted = true
    document.documentElement.classList.add('custom-cursor-active')

    let isVisible = false
    let cursorMode: keyof typeof CURSOR_HOTSPOTS = 'normal'
    let frameId = 0
    let pointerX = 0
    let pointerY = 0
    let lastTarget: Element | null = null
    let needsHitTest = false
    let renderedX = NaN
    let renderedY = NaN
    let renderedMode: keyof typeof CURSOR_HOTSPOTS = 'normal'

    const updateMode = (target: Element | null, force = false) => {
      if (!force && target === lastTarget) return
      lastTarget = target
      cursorMode = target?.closest('[data-cursor="brush"]')
        ? 'brush'
        : target?.closest(INTERACTIVE_SELECTOR) ? 'hover' : 'normal'
    }

    const renderCursor = () => {
      frameId = 0
      const cursor = cursorRef.current
      if (!cursor) return

      // Pointer capture redirects events to the canvas even outside its bounds.
      // Scroll also changes the element under a stationary pointer.
      if (needsHitTest) {
        updateMode(document.elementFromPoint(pointerX, pointerY), true)
        needsHitTest = false
      }
      if (renderedMode !== cursorMode) {
        cursor.classList.toggle(styles.hover, cursorMode === 'hover')
        cursor.classList.toggle(styles.brush, cursorMode === 'brush')
      }
      if (pointerX !== renderedX || pointerY !== renderedY || cursorMode !== renderedMode) {
        const hotspot = CURSOR_HOTSPOTS[cursorMode]
        cursor.style.transform = `translate3d(${pointerX - hotspot.x}px, ${pointerY - hotspot.y}px, 0) scaleX(${cursorMode === 'normal' ? -1 : 1})`
        renderedX = pointerX
        renderedY = pointerY
        renderedMode = cursorMode
      }

      if (!isVisible) {
        cursor.classList.add(styles.visible)
        isVisible = true
      }
    }

    const moveCursor = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      const target = event.target instanceof Element ? event.target : null
      if (target?.hasPointerCapture(event.pointerId)) {
        needsHitTest = true
      } else {
        updateMode(target)
      }
      if (!frameId) frameId = window.requestAnimationFrame(renderCursor)
    }

    const refreshTarget = () => {
      if (!isVisible) return
      needsHitTest = true
      if (!frameId) frameId = window.requestAnimationFrame(renderCursor)
    }

    const hideCursor = () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      frameId = 0
      isVisible = false
      lastTarget = null
      cursorRef.current?.classList.remove(styles.visible)
    }

    window.addEventListener('pointermove', moveCursor, { passive: true })
    document.addEventListener('pointerover', moveCursor, { passive: true })
    document.addEventListener('pointerleave', hideCursor)
    document.addEventListener('scroll', refreshTarget, { passive: true, capture: true })
    window.addEventListener('blur', hideCursor)

    return () => {
      window.removeEventListener('pointermove', moveCursor)
      document.removeEventListener('pointerover', moveCursor)
      document.removeEventListener('pointerleave', hideCursor)
      document.removeEventListener('scroll', refreshTarget, true)
      window.removeEventListener('blur', hideCursor)
      if (frameId) window.cancelAnimationFrame(frameId)
      document.documentElement.classList.remove('custom-cursor-active')
      window.__wmlCustomCursorMounted = false
    }
  }, [])

  return <div ref={cursorRef} className={styles.cursor} aria-hidden="true" />
}
