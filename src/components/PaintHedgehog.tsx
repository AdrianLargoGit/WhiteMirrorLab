'use client'

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/hooks/useLocale'
import { skinTemplatePath } from '@/lib/i18n'
import styles from './PaintHedgehog.module.css'

const DRAW_READY_MS = 3400

const palette = [
  '#5e0501',
  '#696c00',
  '#10690b',
  '#106869',
  '#010161',
  '#63006c',
  '#6b6b23',
  '#0a2c2b',
  '#0a62ff',
  '#002870',
  '#2a02f8',
  '#6c2900',
  '#fa0010',
  '#ffff08',
  '#22fd0d',
  '#1fffff',
  '#0700fe',
  '#ff00ff',
  '#fffe65',
  '#1fff64',
  '#71fdfe',
  '#6560ff',
  '#ff0075',
  '#fb6721',
] as const

export default function PaintHedgehog() {
  const locale = useLocale()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const hasDrawnRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState<(typeof palette)[number]>('#2a02f8')
  const [isReady, setIsReady] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const readyId = window.setTimeout(() => setIsReady(true), DRAW_READY_MS)
    return () => {
      window.clearTimeout(readyId)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const previous = document.createElement('canvas')
      previous.width = canvas.width
      previous.height = canvas.height
      previous.getContext('2d')?.drawImage(canvas, 0, 0)

      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      if (previous.width && previous.height) {
        ctx.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, rect.width, rect.height)
      }
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const drawTo = (point: { x: number; y: number }) => {
    const canvas = canvasRef.current
    const last = lastPointRef.current
    if (!canvas || !last) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    lastPointRef.current = point
    if (!hasDrawnRef.current) {
      hasDrawnRef.current = true
      setHasDrawn(true)
    }
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isReady) return
    const point = pointFromEvent(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastPointRef.current = point
  }

  const keepDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isReady || !drawingRef.current) return
    const point = pointFromEvent(event)
    if (point) drawTo(point)
  }

  const stopDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    drawingRef.current = false
    lastPointRef.current = null
  }

  return (
    <div className={`${styles.paintToy} ${isReady ? styles.ready : ''}`}>
      <Image
        src="/wmlxx0/paint-base.png"
        alt=""
        width={512}
        height={512}
        priority
        sizes="(max-width: 900px) 34vw, 330px"
        className={styles.baseImage}
      />
      <svg className={styles.traceSvg} viewBox="0 0 500 500" aria-hidden="true">
        <defs>
          <mask id="hedgehogPaintMask" maskUnits="userSpaceOnUse">
            <rect width="500" height="500" fill="black" />
            <path className={styles.maskStroke1} pathLength="1" d="M214 160 C240 128 287 133 320 160 C355 188 363 246 337 280 C310 316 239 322 199 292 C166 267 168 194 214 160" />
            <path className={styles.maskStroke2} pathLength="1" d="M215 159 L235 146 L246 158 L263 137 L276 158 L299 139 L304 163 L331 154 L326 180 L351 184 L335 205 L356 221 L334 232 L351 253 L326 255 L333 283 L307 271 L291 298 L275 273 L254 305 L244 278 L215 292 L219 262 L193 262 L210 239 L184 226 L210 212 L192 190 L219 190 Z" />
            <path className={styles.maskStroke3} pathLength="1" d="M196 208 C220 198 242 207 253 226 C268 204 299 202 314 221 C331 243 319 272 292 285 C255 306 194 286 185 250 C181 232 184 217 196 208" />
            <path className={styles.maskStroke4} pathLength="1" d="M204 184 C187 162 211 147 226 168 M251 180 C271 162 295 161 310 178 M208 223 C215 225 220 226 227 223 M252 219 C258 224 267 224 273 219 M225 244 C239 256 254 256 268 244 M202 266 C195 279 211 290 225 281 M303 260 C325 260 326 285 307 282" />
          </mask>
        </defs>
        <image href="/wmlxx0/hedgehog-strokes.png" width="500" height="500" mask="url(#hedgehogPaintMask)" preserveAspectRatio="none" />
      </svg>
      <canvas
        ref={canvasRef}
        className={styles.drawCanvas}
        aria-label="Paint canvas"
        onPointerDown={startDrawing}
        onPointerMove={keepDrawing}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      <div className={styles.drawHint} aria-live="polite">
        {hasDrawn ? (
          <Link className={styles.creatorLink} href={skinTemplatePath(locale)}>
            {locale === 'en' ? 'Got an idea?' : '¿Tienes una idea?'}
          </Link>
        ) : (
          <span>{locale === 'en' ? 'Try the canvas' : 'Prueba el lienzo'}</span>
        )}
      </div>
      <div className={styles.palette} aria-label="Paint colors">
        {palette.map((item) => (
          <button
            key={item}
            type="button"
            className={item === color ? styles.selectedColor : undefined}
            style={{ backgroundColor: item }}
            aria-label={`Color ${item}`}
            onClick={() => setColor(item)}
          />
        ))}
      </div>
      <span className={styles.colorHint}>
        <Image
          src="/wmlxx0/pointing-hand.png"
          alt=""
          width={181}
          height={107}
          sizes="64px"
          className={styles.colorPointer}
        />
      </span>
    </div>
  )
}
