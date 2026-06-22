'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { createPost, createStory, fetchUserPosts, MAX_POSTS } from '@/lib/queries'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'
import { captureEvent } from '@/lib/posthog'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoImage  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
const IcoStory  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
const IcoUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
const IcoX      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoCheck  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const IcoInfo   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

type Mode    = 'post' | 'story'
type Status  = 'idle' | 'uploading' | 'success' | 'error'

// Archivos aceptados según modo
const ACCEPT_POST  = 'image/jpeg,image/png,image/webp,image/gif'
const ACCEPT_STORY = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm'
const MAX_SIZE_MB  = 50

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPage() {
  const locale = useLocale()
  const isEnglish = locale === 'en'
  const { userId, profile, loading: authLoading } = useCurrentUser()
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode]         = useState<Mode>('post')
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string | null>(null)
  const [isVideo, setIsVideo]   = useState(false)
  const [caption, setCaption]   = useState('')
  const [dragging, setDragging] = useState(false)
  const [status, setStatus]     = useState<Status>('idle')
  const [progress, setProgress] = useState(0)   // 0-100 simulado
  const [errorMsg, setErrorMsg] = useState('')
  const [postCount, setPostCount] = useState<number | null>(null)

  // Cargar conteo de posts actuales
  useEffect(() => {
    if (userId) {
      fetchUserPosts(userId).then(({ data }) => setPostCount(data?.length ?? 0))
    }
  }, [userId])

  // Liberar URL del preview al desmontar o cambiar fichero
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  // Reset al cambiar de modo
  const switchMode = (m: Mode) => {
    setMode(m)
    clearFile()
    setStatus('idle')
    setErrorMsg('')
    setCaption('')
  }

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setIsVideo(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [preview])

  // Validar y preparar fichero
  const handleFile = useCallback((f: File) => {
    setErrorMsg('')
    setStatus('idle')

    const isVid = f.type.startsWith('video/')
    const isImg = f.type.startsWith('image/')

    if (mode === 'post' && !isImg) {
      setErrorMsg(isEnglish ? 'Only images are allowed in posts.' : 'Solo se permiten imagenes en los posts.')
      return
    }
    if (mode === 'story' && !isImg && !isVid) {
      setErrorMsg(isEnglish ? 'Stories accept images or short videos.' : 'Las historias aceptan imagenes o videos cortos.')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(isEnglish ? `The file exceeds the ${MAX_SIZE_MB} MB limit.` : `El archivo supera el limite de ${MAX_SIZE_MB} MB.`)
      return
    }

    if (preview) URL.revokeObjectURL(preview)
    setFile(f)
    setIsVideo(isVid)
    setPreview(URL.createObjectURL(f))
  }, [mode, preview, isEnglish])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  // Simular progreso durante la subida (Supabase no expone progreso real en JS SDK)
  const simulateProgress = () => {
    setProgress(0)
    const steps = [15, 35, 55, 72, 88, 96]
    let i = 0
    const id = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(id)
      }
    }, 300)
    return () => clearInterval(id)
  }

  const handleSubmit = async () => {
    if (!file || !userId) return
    setStatus('uploading')
    setErrorMsg('')
    const stopProgress = simulateProgress()

    try {
      if (mode === 'post') {
        const { error } = await createPost(userId, file, caption.trim() || null)
        if (error) throw new Error(error)
        captureEvent('post_upload', { media_type: file.type, file_size_mb: Math.round(file.size / 1048576) })
      } else {
        const { error } = await createStory(userId, file)
        if (error) throw new Error(error)
        captureEvent('story_upload', { media_type: file.type, file_size_mb: Math.round(file.size / 1048576) })
      }

      stopProgress()
      setProgress(100)
      setStatus('success')

      // Redirigir al perfil tras 1.2 s
      setTimeout(() => {
        router.push(profile ? wmlPath(locale, `/profile/${profile.username}`) : wmlPath(locale, '/feed'))
      }, 1200)

    } catch (e: unknown) {
      stopProgress()
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : (isEnglish ? 'Unknown upload error.' : 'Error desconocido al subir.'))
      setProgress(0)
    }
  }

  // ── Loading auth ──────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
        <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.12em' }}>
          {isEnglish ? 'LOADING...' : 'CARGANDO...'}
        </span>
      </div>
    )
  }

  if (!userId) {
    router.replace(wmlPath(locale, '/auth'))
    return null
  }

  const atLimit    = mode === 'post' && postCount !== null && postCount >= MAX_POSTS
  const isUploading = status === 'uploading'
  const isSuccess   = status === 'success'
  const canSubmit   = !!file && !isUploading && !isSuccess

  return (
    <div className="wml-upload">

      {/* ── Header ── */}
      <div className="wml-upload-title">{isEnglish ? 'Publish' : 'Publicar'}</div>
      <div className="wml-upload-subtitle">
        {mode === 'post'
          ? `${isEnglish ? 'Photo' : 'Foto'} / ${postCount ?? '...'}/${MAX_POSTS} ${isEnglish ? 'posts' : 'publicaciones'}`
          : (isEnglish ? 'Story / disappears after 24h' : 'Historia / desaparece en 24 h')}
      </div>

      {/* ── Mode tabs ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        background: 'var(--w-border)',
        marginBottom: 28,
      }}>
        {(['post', 'story'] as Mode[]).map((m) => {
          const active = mode === m
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              disabled={isUploading || isSuccess}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '18px 0',
                background: active ? 'var(--w-accent)' : 'var(--w-surface)',
                color: active ? '#000' : 'var(--w-muted)',
                border: 'none',
                cursor: isUploading || isSuccess ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--w-font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'background 0.2s, color 0.2s',
                opacity: isUploading || isSuccess ? 0.5 : 1,
              }}
            >
              {m === 'post' ? <IcoImage /> : <IcoStory />}
              {m === 'post' ? (isEnglish ? 'Photo' : 'Foto') : (isEnglish ? 'Story' : 'Historia')}
            </button>
          )
        })}
      </div>

      {/* ── Aviso límite de posts ── */}
      {mode === 'post' && postCount !== null && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          padding: '10px 12px',
          marginBottom: 16,
          background: atLimit ? 'var(--w-accent-neg-dim)' : 'var(--w-surface)',
          border: `1px solid ${atLimit ? 'var(--w-accent-neg)' : 'var(--w-border)'}`,
          fontFamily: 'var(--w-font-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          color: atLimit ? 'var(--w-accent-neg)' : 'var(--w-muted)',
          lineHeight: 1.6,
        }}>
          <span style={{ flexShrink: 0, marginTop: 1 }}><IcoInfo /></span>
          {atLimit
            ? (isEnglish ? `You have ${MAX_POSTS}/${MAX_POSTS} photos. Publishing this one will automatically delete the oldest.` : `Tienes ${MAX_POSTS}/${MAX_POSTS} fotos. Al publicar esta, se eliminara automaticamente la mas antigua.`)
            : (isEnglish ? `You can have up to ${MAX_POSTS} photos. You currently have ${postCount}.` : `Puedes tener hasta ${MAX_POSTS} fotos. Tienes ${postCount}.`)}
        </div>
      )}

      {/* ── Aviso formato historia ── */}
      {mode === 'story' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', marginBottom: 16,
          background: 'var(--w-surface)', border: '1px solid var(--w-border)',
          fontFamily: 'var(--w-font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--w-muted)',
        }}>
          <IcoInfo />
          {isEnglish ? `Images or short videos (MP4, MOV, WEBM) / Max ${MAX_SIZE_MB} MB / Recommended max duration: 60s` : `Imagenes o videos cortos (MP4, MOV, WEBM) / Max. ${MAX_SIZE_MB} MB / Duracion recomendada: 60 s`}
        </div>
      )}

      {/* ── Error ── */}
      {errorMsg && (
        <div className="wml-error-msg" style={{ marginBottom: 16 }}>
          {errorMsg}
        </div>
      )}

      {/* ── Drop zone ── */}
      <div
        onClick={() => !file && !isUploading && !isSuccess && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!isUploading && !isSuccess) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: mode === 'story' ? '9/16' : '1',
          maxHeight: mode === 'story' ? 520 : undefined,
          background: dragging ? 'var(--w-accent-dim)' : 'var(--w-surface)',
          border: `1px ${dragging ? 'solid' : 'dashed'} ${
            dragging ? 'var(--w-accent)' :
            isSuccess ? 'var(--w-accent)' :
            'var(--w-border-hover)'
          }`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          cursor: file || isUploading || isSuccess ? 'default' : 'pointer',
          overflow: 'hidden',
          marginBottom: 16,
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {/* File input oculto */}
        <input
          ref={inputRef}
          type="file"
          accept={mode === 'post' ? ACCEPT_POST : ACCEPT_STORY}
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {/* ── Estado: sin fichero ── */}
        {!file && !isSuccess && (
          <>
            <span style={{ color: 'var(--w-muted)', opacity: 0.6 }}>
              {mode === 'post' ? <IcoImage /> : <IcoStory />}
            </span>
            <div style={{ textAlign: 'center', fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-muted)', letterSpacing: '0.1em', lineHeight: 1.7 }}>
              {dragging ? (isEnglish ? 'DROP HERE' : 'SUELTA AQUI') : (isEnglish ? 'DRAG OR TAP TO SELECT' : 'ARRASTRA O TOCA PARA SELECCIONAR')}
              <br />
              <span style={{ fontSize: 9, opacity: 0.55 }}>
                {mode === 'post'
                  ? 'JPG · PNG · WEBP · GIF'
                  : 'JPG · PNG · WEBP · MP4 · MOV · WEBM'}
                {' '} / {isEnglish ? 'Max' : 'Max.'} {MAX_SIZE_MB} MB
              </span>
            </div>
          </>
        )}

        {/* ── Estado: preview ── */}
        {file && !isSuccess && (
          <>
            {isVideo ? (
              <video
                src={preview ?? ''}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                muted
                playsInline
                loop
                autoPlay
              />
            ) : (
              <img
                src={preview ?? ''}
                alt="Preview"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Overlay con info del fichero */}
            {!isUploading && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '10px 12px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em' }}>
                  {file.name.length > 24 ? file.name.slice(0, 22) + '…' : file.name}
                  {' '}· {formatSize(file.size)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile() }}
                  style={{
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', cursor: 'pointer', padding: '4px 6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  title="Quitar imagen"
                >
                  <IcoX />
                </button>
              </div>
            )}

            {/* Overlay de progreso durante la subida */}
            {isUploading && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.65)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
              }}>
                <div style={{ width: '60%', height: 2, background: 'var(--w-border)' }}>
                  <div style={{
                    height: '100%', background: 'var(--w-accent)',
                    width: `${progress}%`, transition: 'width 0.3s ease',
                  }} />
                </div>
                <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-accent)', letterSpacing: '0.12em' }}>
                  {progress < 100 ? `${isEnglish ? 'UPLOADING' : 'SUBIENDO'} ${progress}%` : (isEnglish ? 'PROCESSING...' : 'PROCESANDO...')}
                </span>
              </div>
            )}
          </>
        )}

        {/* ── Estado: éxito ── */}
        {isSuccess && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--w-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IcoCheck />
            </div>
            <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 11, color: 'var(--w-accent)', letterSpacing: '0.12em' }}>
              {isEnglish ? 'PUBLISHED' : 'PUBLICADO'}
            </div>
            <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, color: 'var(--w-muted)', letterSpacing: '0.08em' }}>
              {isEnglish ? 'REDIRECTING TO YOUR PROFILE...' : 'REDIRIGIENDO A TU PERFIL...'}
            </div>
          </div>
        )}
      </div>

      {/* ── Caption (solo posts) ── */}
      {mode === 'post' && !isSuccess && (
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={isEnglish ? 'Add a caption (optional)' : 'Anade un pie de foto (opcional)'}
          maxLength={300}
          rows={3}
          disabled={isUploading}
          style={{
            width: '100%',
            background: 'var(--w-surface)',
            border: '1px solid var(--w-border)',
            padding: '12px 14px',
            fontFamily: 'var(--w-font-body)',
            fontSize: 14,
            color: 'var(--w-white)',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.6,
            marginBottom: 8,
            transition: 'border-color 0.2s',
            opacity: isUploading ? 0.5 : 1,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--w-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--w-border)')}
        />
      )}
      {mode === 'post' && !isSuccess && caption.length > 0 && (
        <div style={{
          textAlign: 'right', marginBottom: 16,
          fontFamily: 'var(--w-font-mono)', fontSize: 9, letterSpacing: '0.06em',
          color: caption.length > 280 ? 'var(--w-accent-neg)' : 'var(--w-muted)',
        }}>
          {300 - caption.length} {isEnglish ? 'characters remaining' : 'caracteres restantes'}
        </div>
      )}

      {/* ── Botón publicar ── */}
      {!isSuccess && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '15px 24px',
            background: canSubmit ? 'var(--w-accent)' : 'var(--w-surface-2)',
            color: canSubmit ? '#000' : 'var(--w-muted)',
            border: 'none',
            fontFamily: 'var(--w-font-mono)',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {isUploading ? (
            <>{isEnglish ? 'Uploading' : 'Subiendo'} {progress}%...</>
          ) : !file ? (
            <>
              <IcoUpload />
              {isEnglish ? 'Select' : 'Selecciona'} {mode === 'post' ? (isEnglish ? 'a photo' : 'una foto') : (isEnglish ? 'a file' : 'un archivo')}
            </>
          ) : (
            <>
              <IcoUpload />
              {mode === 'post' ? (isEnglish ? 'Publish photo' : 'Publicar foto') : (isEnglish ? 'Publish story' : 'Publicar historia')}
            </>
          )}
        </button>
      )}

      {/* ── Nota historia ── */}
      {mode === 'story' && !isSuccess && (
        <div style={{
          marginTop: 14,
          fontFamily: 'var(--w-font-mono)', fontSize: 9,
          color: 'var(--w-muted)', letterSpacing: '0.08em', lineHeight: 1.7,
        }}>
          {isEnglish
            ? 'Stories disappear automatically after 24 hours. Videos loop in the viewer.'
            : 'Las historias desaparecen automaticamente a las 24 horas. Los videos se reproducen en bucle en el visor.'}
        </div>
      )}

    </div>
  )
}
