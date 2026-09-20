'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

declare global {
  interface Window {
    __wmlCustomCursorMounted?: boolean
  }
}

type CustomCursorProps = {
  priority?: boolean
}

const HOTSPOT_X = 13
const HOTSPOT_Y = 0

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

    const moveCursor = (event: Event) => {
      if (!(event instanceof PointerEvent)) return

      const cursor = cursorRef.current
      if (!cursor) return

      cursor.style.transform = `translate3d(${event.clientX - HOTSPOT_X}px, ${event.clientY - HOTSPOT_Y}px, 0)`

      if (!isVisible) {
        cursor.classList.add(styles.visible)
        isVisible = true
      }
    }

    const hideCursor = () => {
      isVisible = false
      cursorRef.current?.classList.remove(styles.visible)
    }

    const moveEvent = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove'

    window.addEventListener(moveEvent, moveCursor, { passive: true })
    document.addEventListener('pointerleave', hideCursor)
    window.addEventListener('blur', hideCursor)

    return () => {
      window.removeEventListener(moveEvent, moveCursor)
      document.removeEventListener('pointerleave', hideCursor)
      window.removeEventListener('blur', hideCursor)
      document.documentElement.classList.remove('custom-cursor-active')
      window.__wmlCustomCursorMounted = false
    }
  }, [])

  return <div ref={cursorRef} className={styles.cursor} aria-hidden="true" />
}
