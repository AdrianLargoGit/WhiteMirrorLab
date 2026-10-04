'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './safefile.module.css'

const advertisement = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#151515;color:#eee}div{min-height:190px}</style></head><body><script async data-cfasync="false" src="https://pl31053382.profitableratecpmnetwork.com/54237a243e6e5ead86fd96dfae1f4fe7/invoke.js"></script><div id="container-54237a243e6e5ead86fd96dfae1f4fe7"></div></body></html>`

export default function DownloadGate({ lang, ready, onComplete }: { lang: 'es' | 'en'; ready: boolean; onComplete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const completed = useRef(false)
  const [elapsed, setElapsed] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let total = 0
    let previous = performance.now()
    const visibility = () => { previous = performance.now(); setVisible(!document.hidden) }
    visibility()
    document.addEventListener('visibilitychange', visibility)
    const timer = window.setInterval(() => {
      const now = performance.now()
      if (!document.hidden) total = Math.min(5000, total + now - previous)
      previous = now
      setElapsed(total)
    }, 100)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', visibility)
      document.body.style.overflow = overflow
      element.close()
    }
  }, [])
  useEffect(() => {
    if (elapsed < 5000 || !ready || !visible || document.hidden || completed.current) return
    completed.current = true
    onComplete()
  }, [elapsed, ready, visible, onComplete])
  return <dialog ref={dialog} className={styles.downloadDialog} onCancel={event => event.preventDefault()} aria-labelledby="download-title" aria-describedby="download-explanation">
    <span className={styles.eyebrow}>SAFEFILE / {lang === 'es' ? 'PREPARANDO DESCARGA' : 'PREPARING DOWNLOAD'}</span>
    <h2 id="download-title">{lang === 'es' ? 'Espera mientras se crea tu archivo' : 'Please wait while your file is created'}</h2>
    <p id="download-explanation">{lang === 'es' ? 'La descarga comenzará automáticamente tras 5 segundos en esta pestaña, cuando el archivo esté listo. Esta espera incluye publicidad.' : 'Your download starts automatically after 5 seconds in this tab, once your file is ready. This wait includes advertising.'}</p>
    <div className={styles.adSlot}><span>{lang === 'es' ? 'Anuncio' : 'Advertisement'}</span><iframe title={lang === 'es' ? 'Anuncio de Adsterra' : 'Adsterra advertisement'} srcDoc={advertisement} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" /></div>
    <progress max={5000} value={elapsed} aria-label={lang === 'es' ? 'Progreso de la espera' : 'Waiting progress'} />
    <p role="status" aria-live="polite">{elapsed < 5000 ? `${Math.ceil((5000 - elapsed) / 1000)} s` : lang === 'es' ? 'Terminando de preparar el archivo…' : 'Finishing your file…'}</p>
  </dialog>
}
