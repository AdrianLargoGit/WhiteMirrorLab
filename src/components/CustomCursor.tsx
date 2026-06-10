'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches
    if (!isFine) return

    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = mx + 'px'
        dotRef.current.style.top = my + 'px'
      }
    }

    const animRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px'
        ringRef.current.style.top = ry + 'px'
      }
      rafId = requestAnimationFrame(animRing)
    }

    document.addEventListener('mousemove', onMove)
    rafId = requestAnimationFrame(animRing)

    const interactables = document.querySelectorAll(
      'a, button, .experiment-row, .app-card, .principle-card'
    )
    const addActive = () => ringRef.current?.classList.add(styles.active)
    const removeActive = () => ringRef.current?.classList.remove(styles.active)

    interactables.forEach((el) => {
      el.addEventListener('mouseenter', addActive)
      el.addEventListener('mouseleave', removeActive)
    })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', addActive)
        el.removeEventListener('mouseleave', removeActive)
      })
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className={styles.cursor} id="cursor" />
      <div ref={ringRef} className={styles.cursorRing} id="cursorRing" />
    </>
  )
}