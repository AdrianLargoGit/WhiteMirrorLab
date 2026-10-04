'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import styles from './safefile.module.css'
import { encryptFile, passwordIssue, SafeFileError } from './crypto'
import DownloadGate from './DownloadGate'
import { createPortableFile } from './portable'
import { drawRedactions, exportRasterPdf, type Rect } from './visible'

type Mode = 'portable' | 'visible'
type Source = { name: string; kind: 'image' | 'pdf'; pages: HTMLCanvasElement[]; size: number }

const copy = {
  es: {
    eyebrow: 'WHITE MIRROR LAB / EXPERIMENTO 004',
    intro: 'Cifra tu archivo con contraseña o prepara una copia visible con zonas censuradas. Todo se procesa localmente, sin enviar el documento a un servidor.',
    tags: ['CIFRADO AES-256-GCM', 'LOCAL EN TU NAVEGADOR', 'CENSURA DE ZONAS SENSIBLES'],
    yourFile: 'Tu archivo', startFile: 'Empieza con un documento',
    drop: 'Arrastra tu archivo aquí', explore: 'explora tus archivos', change: 'Haz clic para cambiar el archivo', pages: ['página', 'páginas'],
    intensity: 'Intensidad', choose: 'Selecciona un modo de simulación',
    levelNote: 'Básico y Avanzado añaden ruido suave. Magic prueba una trama moiré de alta frecuencia. No se ha demostrado que estos filtros impidan OCR, capturas o fotografías.',
    preparing: 'Preparando descarga…', download: 'Descargar simulación', downloadNote: 'Exporta PNG para imágenes o PDF rasterizado para documentos.',
    preview: 'VISTA PREVIA EN DIRECTO', example: 'EJEMPLO', processing: 'Procesando archivo…', preparingPreview: 'Preparando la vista previa local',
    ready: 'Archivo listo para vista previa', waiting: 'Esperando tu documento', viewSimulation: 'Ver con filtro', viewOriginal: 'Ver sin filtro', previous: 'Página anterior', next: 'Página siguiente',
    notice: 'PROTOTIPO / SIN GARANTÍA DE PROTECCIÓN', foot: 'SAFEFILE / PROTOTIPO EXPERIMENTAL', privacy: 'Privacidad en tu navegador · Sin envío a servidores',
  },
  en: {
    eyebrow: 'WHITE MIRROR LAB / EXPERIMENT 004',
    intro: 'Encrypt your file with a password or prepare a visible copy with redacted areas. Everything runs locally without sending the document to a server.',
    tags: ['AES-256-GCM ENCRYPTION', 'LOCAL IN YOUR BROWSER', 'SENSITIVE AREA REDACTION'],
    yourFile: 'Your file', startFile: 'Start with a document',
    drop: 'Drop your file here', explore: 'browse your files', change: 'Click to change the file', pages: ['page', 'pages'],
    intensity: 'Intensity', choose: 'Choose a simulation mode',
    levelNote: 'Basic and Advanced add light noise. Magic tries a high-frequency moiré pattern. These filters have not been shown to prevent OCR, screenshots, or photographs.',
    preparing: 'Preparing download…', download: 'Download simulation', downloadNote: 'Exports PNG for images or a rasterized PDF for documents.',
    preview: 'LIVE PREVIEW', example: 'EXAMPLE', processing: 'Processing file…', preparingPreview: 'Preparing the local preview',
    ready: 'File ready to preview', waiting: 'Waiting for your document', viewSimulation: 'View with filter', viewOriginal: 'View without filter', previous: 'Previous page', next: 'Next page',
    notice: 'PROTOTYPE / NO PROTECTION GUARANTEE', foot: 'SAFEFILE / EXPERIMENTAL PROTOTYPE', privacy: 'Privacy in your browser · No server upload',
  },
} as const

const ALERT = "Interfaz de SafeFile generada. La 'magia' matemática para la protección anti-cámara requiere investigación externa de ML no disponible en este modelo. Módulo operando en modo simulación."
const MAX_BYTES = 30 * 1024 * 1024
const MAX_PAGES = 20
const MAX_EDGE = 1800

const securityCopy = {
  es: {
    mode: 'Elige cómo compartirlo', portable: 'Cifrado portátil', portableDetail: 'HTML que pide contraseña al abrirlo', visible: 'antiIA', visibleDetail: 'Censura irreversible de datos',
    password: 'Contraseña', confirm: 'Repite la contraseña', generate: 'Generar contraseña segura', show: 'Mostrar', hide: 'Ocultar',
    cipherNote: 'Usa una contraseña larga y única o genera una aleatoria. Guárdala y compártela por un canal separado. Sin ella no hay recuperación. No se almacena en SafeFile.',
    cipherStatus: 'Listo para cifrar', chooseAny: 'Cualquier archivo · máx. 30 MB',
    missingPassword: 'Introduce una contraseña de al menos 12 caracteres.', mismatch: 'Las contraseñas no coinciden.',
    unsupported: 'El cifrado necesita un navegador compatible y una conexión HTTPS o localhost.', size: 'El archivo supera el límite de 30 MB.', format: 'No es un archivo SafeFile válido o su versión no está admitida.', unlock: 'Contraseña incorrecta o archivo alterado. No se ha recuperado ningún contenido.',
    cipherHeading: 'CONTENIDO PROTEGIDO POR CONTRASEÑA', 
    visibleHeading: 'EL CONTENIDO VISIBLE PUEDE SER LEÍDO POR IA', visibleNotice: 'No existe aquí una garantía de mantener todo el documento legible para humanos e ilegible para cualquier IA. La censura elimina las zonas seleccionadas de la copia exportada; el resto sigue siendo legible. antiIA protege las zonas censuradas; el contenido que mantengas visible puede ser leído por IA.',
    redact: 'Censurar zonas', redactNote: 'Arrastra sobre la página para cubrir datos sensibles. Se exportan como píxeles negros, sin texto subyacente.', clearRects: 'Deshacer última zona', clearSession: 'Limpiar sesión',
    exportVisible: 'Descargar copia censurada', exportVisibleNote: 'PDF o PNG rasterizado. No contiene el original ni una capa de texto.',
    working: 'Preparando archivo…', portableAction: 'Crear portátil .html', successPortable: 'HTML cifrado descargado. Ábrelo desde Descargas en un navegador compatible e introduce la contraseña para recuperar el original.',
    portablePreview: 'Tu archivo, listo para llevar', portablePreviewNote: 'El HTML incluirá el archivo cifrado y su pantalla de desbloqueo. Al abrirlo en un navegador compatible pedirá la contraseña. Funciona sin Internet ni instalar SafeFile.',
    portableNotice: 'El portátil protege el contenido con el mismo cifrado AES-256-GCM. Descarga el HTML y ábrelo en un navegador actualizado para introducir la contraseña. La contraseña no se incluye en el HTML. El original recuperado deja de estar cifrado.',
    passwordRules: 'Mínimo 12 caracteres, máximo 1024. No es obligatorio incluir números ni símbolos.', passwordEmpty: 'Escribe una contraseña.', passwordBlank: 'La contraseña no puede estar formada solo por espacios.', passwordLong: 'La contraseña supera el máximo de 1024 caracteres.', confirmEmpty: 'Repite la contraseña para poder cifrar el archivo.', passwordValid: 'La contraseña cumple los requisitos de longitud.', confirmValid: 'Las contraseñas coinciden.', selectFile: 'Selecciona un archivo antes de continuar.',
  },
  en: {
    mode: 'Choose how to share it', portable: 'Portable encryption', portableDetail: 'HTML that asks for a password on opening', visible: 'Anti-AI', visibleDetail: 'Permanent information redaction',
    password: 'Password', confirm: 'Repeat password', generate: 'Generate a secure password', show: 'Show', hide: 'Hide',
    cipherNote: 'Use a long, unique password or generate a random one. Save it and share it through a separate channel. Without it, recovery is impossible. SafeFile does not store it.',
    cipherStatus: 'Ready to encrypt', chooseAny: 'Any file · max. 30 MB',
    missingPassword: 'Enter a password with at least 12 characters.', mismatch: 'Passwords do not match.',
    unsupported: 'Encryption requires a compatible browser and HTTPS or localhost.', size: 'The file exceeds the 30 MB limit.', format: 'Invalid SafeFile file or unsupported version.', unlock: 'Incorrect password or modified file. No content was recovered.',
    cipherHeading: 'PASSWORD PROTECTED CONTENT', 
    visibleHeading: 'VISIBLE CONTENT CAN BE READ BY AI', visibleNotice: 'This tool cannot guarantee that a document readable by humans is unreadable by every AI. Redaction removes selected areas from the exported copy; the rest remains readable. Anti-AI protects redacted areas; content you leave visible can be read by AI.',
    redact: 'Redact areas', redactNote: 'Drag over the page to cover sensitive data. These areas are exported as black pixels without underlying text.', clearRects: 'Undo last area', clearSession: 'Clear session',
    exportVisible: 'Download redacted copy', exportVisibleNote: 'Rasterized PDF or PNG. Contains no original file or text layer.',
    working: 'Preparing file…', portableAction: 'Create portable .html', successPortable: 'Encrypted HTML downloaded. Open it from Downloads in a browser and enter the password to recover the original.',
    portablePreview: 'Your file, ready to take with you', portablePreviewNote: 'The HTML includes the encrypted file and its unlock screen. Open it in a compatible browser to enter the password. No Internet connection or SafeFile installation required.',
    portableNotice: 'The portable file protects content with the same AES-256-GCM encryption. Download the HTML and open it in an updated browser to enter the password. The password is not included in the HTML. The recovered original is no longer encrypted.',
    passwordRules: 'At least 12 characters, maximum 1024. Numbers and symbols are not required.', passwordEmpty: 'Enter a password.', passwordBlank: 'A password cannot consist only of spaces.', passwordLong: 'The password exceeds the 1024 character limit.', confirmEmpty: 'Repeat your password to encrypt the file.', passwordValid: 'The password meets the length requirements.', confirmValid: 'Passwords match.', selectFile: 'Select a file before continuing.',
  },
} as const

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function Icon({ name, size = 20 }: { name: 'upload' | 'file' | 'arrow' | 'download' | 'shield' | 'spark' | 'check' | 'x'; size?: number }) {
  const paths: Record<typeof name, React.ReactNode> = {
    upload: <><path d="M12 16V3m0 0L7 8m5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></>,
    file: <><path d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h5M8 13h8M8 17h6"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></>,
    shield: <><path d="m12 2 8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/></>,
    check: <path d="m4 12 5 5L20 6"/>,
    x: <path d="M5 5 19 19M19 5 5 19"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function scaledSize(width: number, height: number) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

function samplePage(canvas: HTMLCanvasElement, lang: 'es' | 'en') {
  canvas.width = 740; canvas.height = 940
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 740, 940)
  ctx.fillStyle = '#191b1d'; ctx.fillRect(64, 72, 48, 5)
  ctx.font = '600 12px Arial'; ctx.fillText(lang === 'es' ? 'DOCUMENTO DE EJEMPLO' : 'SAMPLE DOCUMENT', 64, 112)
  ctx.fillStyle = '#c8cbd0'; ctx.fillRect(64, 134, 612, 1)
  ctx.fillStyle = '#25272b'; ctx.font = 'bold 37px Arial'; ctx.fillText(lang === 'es' ? 'Un documento,' : 'A document,', 64, 214); ctx.fillText(lang === 'es' ? 'otra perspectiva.' : 'another perspective.', 64, 260)
  ctx.fillStyle = '#737780'; ctx.font = '16px Arial'; ctx.fillText(lang === 'es' ? 'Carga un PDF o una imagen para ver el resultado aquí.' : 'Upload a PDF or image to preview the result here.', 64, 320)
  for (let row = 0; row < 11; row++) {
    ctx.fillStyle = row % 3 === 0 ? '#d6d8dc' : '#e7e8ea'
    ctx.fillRect(64, 390 + row * 37, row % 4 === 3 ? 360 : 610, 9)
  }
  ctx.fillStyle = '#e8ecea'; ctx.fillRect(64, 827, 612, 46)
  ctx.fillStyle = '#68736c'; ctx.font = '12px Arial'; ctx.fillText(lang === 'es' ? 'SAFEFILE  /  VISTA DE EJEMPLO' : 'SAFEFILE  /  SAMPLE PREVIEW', 84, 855)
}

export default function SafeFileApp({ lang }: { lang: 'es' | 'en' }) {
  const t = copy[lang]
  const s = securityCopy[lang]
  const [mode, setMode] = useState<Mode>('portable')
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState('')
  const [redact, setRedact] = useState(true)
  const [redactions, setRedactions] = useState<Record<number, Rect[]>>({})
  const [draft, setDraft] = useState<Rect | null>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const [source, setSource] = useState<Source | null>(null)
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const taskRef = useRef(0)
  const [gateOpen, setGateOpen] = useState(false)
  const [pendingDownload, setPendingDownload] = useState<{ blob: Blob; name: string; message: string } | null>(null)
  const completeDownload = () => {
    if (!pendingDownload) return
    saveBlob(pendingDownload.blob, pendingDownload.name)
    setSuccess(pendingDownload.message)
    setPendingDownload(null); setGateOpen(false); setDownloading(false)
  }
  const passwordCount = Array.from(password).length
  const fieldIssue = passwordIssue(password, password)
  const validationIssue = passwordIssue(password, confirmation)
  const issueMessage = (issue: NonNullable<ReturnType<typeof passwordIssue>>) => {
    if (issue === 'short') return lang === 'es' ? `La contraseña tiene ${passwordCount} caracteres; necesita al menos 12.` : `The password has ${passwordCount} characters; at least 12 are required.`
    if (issue === 'empty') return s.passwordEmpty
    if (issue === 'blank') return s.passwordBlank
    if (issue === 'long') return s.passwordLong
    if (issue === 'confirmation') return s.confirmEmpty
    return s.mismatch
  }

  const loadFile = useCallback(async (file?: File, targetMode: Mode = mode) => {
    if (!file || downloading) return
    const task = ++taskRef.current
    dragStart.current = null
    setError(''); setSuccess(''); setBusy(true); setSource(null); setFile(null); setPage(0); setRedactions({}); setDraft(null)
    try {
      if (file.size > MAX_BYTES) throw new Error(s.size)
      if (task !== taskRef.current) return
      if (targetMode !== 'visible') {
        setFile(file)
        return
      }
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const isImage = file.type.startsWith('image/') && !file.type.includes('svg')
      if (!isPdf && !isImage) throw new Error(lang === 'es' ? 'Selecciona un PDF o una imagen PNG, JPG, WebP o GIF.' : 'Select a PDF or PNG, JPG, WebP or GIF image.')
      let pages: HTMLCanvasElement[] = []
      if (isPdf) {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
        try {
          const pdf = await loadingTask.promise
          if (pdf.numPages > MAX_PAGES) throw new Error(lang === 'es' ? `Este prototipo admite PDF de hasta ${MAX_PAGES} páginas.` : `This prototype supports PDFs with up to ${MAX_PAGES} pages.`)
        for (let n = 1; n <= pdf.numPages; n++) {
          if (task !== taskRef.current) return
          const pdfPage = await pdf.getPage(n)
          const viewport = pdfPage.getViewport({ scale: 1 })
          const size = scaledSize(viewport.width * 1.5, viewport.height * 1.5)
          const canvas = makeCanvas(size.width, size.height)
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size.width, size.height)
          await pdfPage.render({ canvasContext: ctx, canvas, viewport: pdfPage.getViewport({ scale: size.width / viewport.width }) }).promise
          pages.push(canvas)
        }
        } finally {
          await loadingTask.destroy()
        }
      } else {
        const bitmap = await createImageBitmap(file)
        const size = scaledSize(bitmap.width, bitmap.height)
        const canvas = makeCanvas(size.width, size.height)
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size.width, size.height)
        ctx.drawImage(bitmap, 0, 0, size.width, size.height)
        bitmap.close()
        pages = [canvas]
      }
      if (task === taskRef.current) {
        setFile(file)
        setSource({ name: file.name, kind: isPdf ? 'pdf' : 'image', pages, size: file.size })
      }
    } catch (cause) {
      if (task === taskRef.current) setError(cause instanceof Error ? cause.message : lang === 'es' ? 'No se pudo abrir el archivo.' : 'Could not open the file.')
    } finally {
      if (task === taskRef.current) setBusy(false)
    }
  }, [mode, s.size, downloading, lang])

  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const original = source?.pages[page]
    if (original) {
      canvas.width = original.width; canvas.height = original.height
      canvas.getContext('2d')?.drawImage(original, 0, 0)
      drawRedactions(canvas, [...(redactions[page] ?? []), ...(draft ? [draft] : [])])
    } else {
      samplePage(canvas, lang)
    }
  }, [source, page, busy, lang, mode, redactions, draft])

  useEffect(() => () => { taskRef.current++ }, [])

  const changeMode = (next: Mode) => {
    if (next === mode) return
    setMode(next); setPassword(''); setConfirmation(''); setShowPassword(false); setAttempted(false); setError(''); setSuccess('')
    if (file) void loadFile(file, next)
  }

  const clearSession = () => {
    dragStart.current = null
    setAttempted(false)
    taskRef.current++; setFile(null); setSource(null); setPassword(''); setConfirmation(''); setShowPassword(false); setRedactions({}); setDraft(null); setError(''); setSuccess(''); setPage(0); setBusy(false)
  }

  const generatePassword = () => {
    if (!globalThis.crypto?.subtle) { setError(s.unsupported); return }
    const value = Array.from(crypto.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('')
    setPassword(value); setConfirmation(value); setShowPassword(true); setError(''); setSuccess(''); setAttempted(false)
  }

  const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) }
  }

  const rectToPoint = (end: { x: number; y: number }): Rect | null => {
    const start = dragStart.current
    return start ? { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: Math.abs(end.x - start.x), height: Math.abs(end.y - start.y) } : null
  }

  const processEncryption = async () => {
    if (busy || downloading) return
    setAttempted(true)
    setError(''); setSuccess('')
    if (validationIssue) { setError(issueMessage(validationIssue)); return }
    if (!file) { setError(s.selectFile); return }
    setDownloading(true); setGateOpen(true); setPendingDownload(null)
    try {
      const container = await encryptFile(file, password)
      const blob = await createPortableFile(container, lang)
      setPendingDownload({ blob, name: 'safefile-portable.html', message: s.successPortable })
    } catch (cause) {
      setError(cause instanceof SafeFileError ? cause.code === 'password' ? s.missingPassword : s[cause.code] : (lang === 'es' ? 'No se pudo procesar el archivo.' : 'Could not process the file.'))
      setDownloading(false); setGateOpen(false)
    }
  }

  const download = async () => {
    if (!source || downloading) return
    setDownloading(true); setError(''); setGateOpen(true); setPendingDownload(null)
    try {
      const processed = source.pages.map((original, index) => {
        const canvas = makeCanvas(original.width, original.height)
        canvas.getContext('2d')!.drawImage(original, 0, 0)
        drawRedactions(canvas, redactions[index] ?? [])
        return canvas
      })
      const stem = source.name.replace(/\.[^.]+$/, '')
      let output: Blob
      let filename: string
      if (source.kind === 'pdf') {
        output = await exportRasterPdf(processed)
        filename = `${stem}-safefile-redacted.pdf`
      } else {
        const blob = await new Promise<Blob>((resolve, reject) => processed[0].toBlob(result => result ? resolve(result) : reject(new Error(lang === 'es' ? 'No se pudo crear la imagen.' : 'Could not create the image.')), 'image/png'))
        output = blob
        filename = `${stem}-safefile-redacted.png`
      }
      setPendingDownload({ blob: output, name: filename, message: lang === 'es' ? 'Copia visible descargada. Las zonas censuradas se han eliminado de esta copia.' : 'Visible copy downloaded. Redacted areas have been removed from this copy.' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : lang === 'es' ? 'No se pudo generar la descarga.' : 'Could not prepare the download.')
      setDownloading(false); setGateOpen(false)
    }
  }

  return <main className={`${styles.root} ph-no-capture`}>
    <Navbar lang={lang} />
    {gateOpen && <DownloadGate lang={lang} ready={Boolean(pendingDownload)} onComplete={completeDownload} />}
    <div className={styles.shell}>
      <section className={styles.intro}>
        <div className={styles.eyebrow}><span className={styles.eyebrowLine}/> {t.eyebrow}</div>
        <h1>Safe<span>File.</span></h1>
        <p>{t.intro}</p>
        <div className={styles.introTags}>{t.tags.map(tag => <span key={tag}><Icon name="check" size={14}/> {tag}</span>)}</div>
      </section>

      <div className={styles.modeSelector} role="radiogroup" aria-label={s.mode}>
        {(['portable', 'visible'] as const).map(item => <button key={item} type="button" role="radio" aria-checked={mode === item} disabled={busy || downloading} className={mode === item ? styles.activeMode : ''} onClick={() => changeMode(item)}><Icon name={item === 'visible' ? 'file' : 'shield'} size={24}/><span><strong>{s[item]}</strong><small>{item === 'portable' ? s.portableDetail : s.visibleDetail}</small></span><span className={styles.radio}/></button>)}
      </div>

      <div className={styles.workspace}>
        <section className={styles.controls} aria-label={lang === 'es' ? 'Configuración de SafeFile' : 'SafeFile settings'}>
          <div className={styles.sectionHead}><span className={styles.step}>01</span><div><h2>{t.yourFile}</h2><p>{t.startFile}</p></div></div>
          <input ref={inputRef} className={styles.hiddenInput} type="file" disabled={downloading} accept={mode === 'visible' ? 'application/pdf,image/png,image/jpeg,image/webp,image/gif' : undefined} onChange={event => { void loadFile(event.target.files?.[0]); event.target.value = '' }} aria-label={lang === 'es' ? 'Seleccionar archivo' : 'Select file'} />
          <div className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`} role="button" tabIndex={0} aria-disabled={downloading} onClick={() => { if (!downloading) inputRef.current?.click() }} onKeyDown={event => { if (!downloading && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); inputRef.current?.click() } }} onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={event => { event.preventDefault(); setDragging(false) }} onDrop={event => { event.preventDefault(); setDragging(false); void loadFile(event.dataTransfer.files[0]) }}>
            <span className={styles.uploadIcon}><Icon name={file ? 'file' : 'upload'} size={25}/></span>
            {file ? <><strong className={styles.filename}>{file.name}</strong><span>{source && <>{source.pages.length} {source.pages.length === 1 ? t.pages[0] : t.pages[1]} · </>}{(file.size / 1024 / 1024).toFixed(1)} MB</span><small>{t.change}</small></> : <><strong>{t.drop}</strong><span>{lang === 'es' ? 'o' : 'or'} <u>{t.explore}</u></span><small>{mode !== 'visible' ? s.chooseAny : `PDF, PNG, JPG, WebP · ${lang === 'es' ? 'máx.' : 'max.'} 30 MB`}</small></>}
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          {success && <p className={styles.success} role="status">{success}</p>}

          <div className={styles.separator}/>
          {mode !== 'visible' ? <form className={styles.cipherForm} noValidate onSubmit={event => { event.preventDefault(); void processEncryption() }}>
            <label htmlFor="safefile-password">{s.password}</label>
            <div className={styles.passwordRow}><input id="safefile-password" type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError(''); setSuccess('') }} autoComplete="off" spellCheck={false} maxLength={1024} disabled={downloading} aria-describedby="password-rules password-feedback" aria-invalid={Boolean(fieldIssue && (password || attempted))} data-ph-mask data-private/><button type="button" disabled={downloading} onClick={() => setShowPassword(value => !value)} aria-pressed={showPassword}>{showPassword ? s.hide : s.show}</button></div>
            <p id="password-rules" className={styles.passwordHelp}>{s.passwordRules}</p>
            <p id="password-feedback" className={fieldIssue ? styles.validationError : styles.validationOk} role="status" aria-live="polite">{(password || attempted) && (fieldIssue ? issueMessage(fieldIssue) : s.passwordValid)}</p>
            {<><label htmlFor="safefile-confirm">{s.confirm}</label><input id="safefile-confirm" type={showPassword ? 'text' : 'password'} value={confirmation} onChange={event => { setConfirmation(event.target.value); setError(''); setSuccess('') }} autoComplete="off" spellCheck={false} maxLength={1024} disabled={downloading} aria-describedby="confirmation-feedback" aria-invalid={Boolean((confirmation || attempted) && password !== confirmation)} data-ph-mask data-private/><p id="confirmation-feedback" className={password === confirmation ? styles.validationOk : styles.validationError} role="status" aria-live="polite">{(confirmation || attempted) && (password !== confirmation ? confirmation ? s.mismatch : s.confirmEmpty : confirmation ? s.confirmValid : '')}</p><button type="button" className={styles.textButton} disabled={downloading} onClick={generatePassword}>{s.generate}</button></>}
            <p className={styles.levelNote}>{s.cipherNote}</p>
            <button type="submit" className={styles.download} disabled={busy || downloading}><Icon name="shield" size={19}/><span>{downloading ? s.working : s.portableAction}</span><Icon name="arrow" size={18}/></button>
          </form> : <>
          <div className={styles.redactionGuide}>
            <strong>{lang === 'es' ? 'Oculta datos con rectángulos negros' : 'Hide information with black rectangles'}</strong>
            <div className={styles.redactionDemo} aria-hidden="true"><span>Jane Doe</span><span>████████████</span><span>████████</span></div>
            <p>{lang === 'es' ? '1. Sube un documento. 2. Arrastra el ratón o el dedo sobre los datos en la vista previa. 3. Descarga la copia censurada.' : '1. Upload a document. 2. Drag your mouse or finger over information in the preview. 3. Download the redacted copy.'}</p>
            <p role="status">{Object.values(redactions).reduce((sum, rectangles) => sum + rectangles.length, 0)} {lang === 'es' ? 'zonas censuradas en el documento' : 'redacted areas in the document'}</p>
          </div>
          <label className={styles.redactToggle}><input type="checkbox" checked={redact} onChange={event => setRedact(event.target.checked)}/>{s.redact}</label>
          <p className={styles.levelNote}>{s.redactNote}</p>
          {!!redactions[page]?.length && <button className={styles.textButton} type="button" onClick={() => setRedactions(value => ({ ...value, [page]: value[page].slice(0, -1) }))}>{s.clearRects}</button>}
          <button type="button" className={styles.download} onClick={() => void download()} disabled={!source || busy || downloading}><Icon name="download" size={19}/><span>{downloading ? t.preparing : s.exportVisible}</span><Icon name="arrow" size={18}/></button>
          <p className={styles.downloadNote}>{s.exportVisibleNote}</p>
          </>}
          <button className={styles.clearSession} type="button" disabled={downloading} onClick={clearSession}>{s.clearSession}</button>
        </section>

        <section className={styles.previewPanel} aria-label={lang === 'es' ? 'Vista previa' : 'Preview'}>
          <div className={styles.previewHeader}><div><span className={styles.liveDot}/> {mode !== 'visible' ? 'AES-256-GCM / HTML' : t.preview}</div><span>{source ? `${page + 1} / ${source.pages.length}` : mode !== 'visible' ? 'LOCAL' : t.example}</span></div>
          {mode === 'visible' && <div className={styles.canvasHint}>{lang === 'es' ? '✚ Arrastra aquí para dibujar rectángulos negros sobre los datos que quieras ocultar.' : '✚ Drag here to draw black rectangles over the information you want to hide.'}</div>}
          <div className={styles.previewStage}>{busy ? <div className={styles.loading}><span className={styles.spinner}/><strong>{t.processing}</strong><small>{t.preparingPreview}</small></div> : mode !== 'visible' ? <div className={styles.lockedPreview}><span className={styles.lockMark}><Icon name="shield" size={52}/></span><h2>{s.portablePreview}</h2><p>{s.portablePreviewNote}</p><small>AES-256-GCM · PBKDF2-SHA256 · 600 000</small></div> : <div className={styles.paper}><canvas ref={previewRef} className={source && redact ? styles.redactionCanvas : ''} aria-label={source ? `${t.preview} ${page + 1}` : t.example}
            onPointerDown={event => { if (!source || !redact || event.button !== 0) return; dragStart.current = canvasPoint(event); event.currentTarget.setPointerCapture(event.pointerId); setDraft(null) }}
            onPointerMove={event => { if (dragStart.current) setDraft(rectToPoint(canvasPoint(event))) }}
            onPointerUp={event => { const rect = rectToPoint(canvasPoint(event)); if (rect && rect.width > 0.001 && rect.height > 0.001) setRedactions(value => ({ ...value, [page]: [...(value[page] ?? []), rect] })); dragStart.current = null; setDraft(null) }}
            onPointerCancel={() => { dragStart.current = null; setDraft(null) }} onLostPointerCapture={() => { dragStart.current = null; setDraft(null) }}/></div>}</div>
          <div className={styles.previewFooter}><div className={styles.previewStatus}><span className={styles.statusIcon}><Icon name={file ? 'check' : 'file'} size={15}/></span><span>{mode !== 'visible' ? file ? s.cipherStatus : t.waiting : source ? t.ready : t.waiting}</span></div><div className={styles.previewActions}>{source && source.pages.length > 1 && <div className={styles.pagination}><button type="button" disabled={page === 0} onClick={() => { setDraft(null); setPage(value => value - 1) }} aria-label={t.previous}>‹</button><span>{page + 1}/{source.pages.length}</span><button type="button" disabled={page === source.pages.length - 1} onClick={() => { setDraft(null); setPage(value => value + 1) }} aria-label={t.next}>›</button></div>}</div></div>
        </section>
      </div>

      <aside className={styles.unavailable}><strong>{lang === 'es' ? 'Protección universal anticapturas y antifotos: no disponible' : 'Universal screenshot and camera protection: unavailable'}</strong><p>{lang === 'es' ? 'No se ha conseguido una técnica fiable que conserve el documento visible e impida leerlo a cualquier IA, incluso en fotografías. No hay una opción funcional que activar. El cifrado protege el contenido mientras permanece cerrado; la censura elimina los datos que marques.' : 'A reliable technique that keeps a document visible while preventing every AI from reading it, including in photographs, has not been achieved here. There is no working option to enable. Encryption protects content while locked; redaction removes the information you select.'}</p></aside>
      <aside className={styles.notice} role="status"><div className={styles.noticeIcon}><Icon name={mode !== 'visible' ? 'shield' : 'spark'} size={18}/></div><div><strong>{mode !== 'visible' ? s.cipherHeading : s.visibleHeading}</strong><p>{mode === 'portable' ? s.portableNotice : s.visibleNotice}</p>{mode === 'visible' && <p>{lang === 'es' ? ALERT : "SafeFile interface generated. The mathematical 'magic' for camera protection requires external ML research unavailable in this model. Module operating in simulation mode."}</p>}</div></aside>
      <div className={styles.foot}><span>{t.foot}</span><span>{t.privacy}</span></div>
    </div>
  </main>
}
