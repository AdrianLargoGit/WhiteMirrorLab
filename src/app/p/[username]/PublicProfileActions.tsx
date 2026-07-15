'use client'

import { useEffect, useState } from 'react'
import { legalPath, type Locale } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { castVote, getMyVote } from '@/lib/votes'
import { captureEvent } from '@/lib/posthog'
import styles from './PublicProfileActions.module.css'

type PublicProfile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  karma_score: number
  votes_received_positive: number
  votes_received_negative: number
}

type VoteChoice = true | false
type Mode = 'login' | 'signup'

export default function PublicProfileActions({
  profile,
  locale,
}: {
  profile: PublicProfile
  locale: Locale
}) {
  const isEnglish = locale === 'en'
  const [stats, setStats] = useState(profile)
  const [userId, setUserId] = useState<string | null>(null)
  const [myVote, setMyVote] = useState<boolean | null>(null)
  const [pendingVote, setPendingVote] = useState<VoteChoice | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [loadingVote, setLoadingVote] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      setUserId(user.id)
      if (user.id !== profile.id) {
        const vote = await getMyVote(user.id, profile.id)
        setMyVote(vote)
      }
    })
  }, [profile.id])

  const refreshStats = async () => {
    const { data } = await supabase
      .from('public_profiles')
      .select('id, username, display_name, avatar_url, karma_score, votes_received_positive, votes_received_negative')
      .eq('username', profile.username)
      .single()

    if (data) setStats(data as PublicProfile)
  }

  const handleVote = async (choice: VoteChoice) => {
    setMessage('')
    if (!userId) {
      setPendingVote(choice)
      setMode('login')
      setShowAuth(true)
      return
    }

    if (userId === profile.id) {
      setMessage(isEnglish ? 'You cannot vote for yourself.' : 'No puedes votarte a ti mismo.')
      return
    }

    setLoadingVote(true)
    const result = await castVote({ voterId: userId, receiverId: profile.id, isPositive: choice })
    if (result.success) {
      setMyVote(result.action === 'removed' ? null : choice)
      await refreshStats()
      setMessage(isEnglish ? 'Vote saved.' : 'Voto guardado.')
    } else {
      setMessage(result.error ?? (isEnglish ? 'Vote failed.' : 'No se pudo votar.'))
    }
    setLoadingVote(false)
  }

  const onAuthenticated = async (newUserId: string) => {
    setUserId(newUserId)
    setShowAuth(false)
    if (pendingVote !== null) {
      const vote = pendingVote
      setPendingVote(null)
      await handleVoteWithUser(newUserId, vote)
    }
  }

  const handleVoteWithUser = async (voterId: string, choice: VoteChoice) => {
    setLoadingVote(true)
    const result = await castVote({ voterId, receiverId: profile.id, isPositive: choice })
    if (result.success) {
      setMyVote(result.action === 'removed' ? null : choice)
      await refreshStats()
      setMessage(isEnglish ? 'Vote saved.' : 'Voto guardado.')
    } else {
      setMessage(result.error ?? (isEnglish ? 'Vote failed.' : 'No se pudo votar.'))
    }
    setLoadingVote(false)
  }

  const karma = stats.karma_score > 0 ? `+${stats.karma_score}` : `${stats.karma_score}`
  const karmaColor = stats.karma_score > 0 ? '#4ade80' : stats.karma_score < 0 ? '#f87171' : '#f5f2ee'

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}>
        {[
          { label: 'Karma', value: karma, color: karmaColor },
          { label: isEnglish ? 'Positive' : 'Positivos', value: stats.votes_received_positive, color: '#4ade80' },
          { label: isEnglish ? 'Negative' : 'Negativos', value: stats.votes_received_negative, color: '#f87171' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.035), #080808)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '14px 10px',
            borderRadius: 6,
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <div style={{ color: stat.color, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 24, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ color: '#6a6a6a', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.votePanel}>
        <div className={styles.votePanelHeader}>
          <span>{isEnglish ? 'Anonymous vote' : 'Voto anonimo'}</span>
          <span className={styles.live}>LIVE</span>
        </div>

        <p className={styles.voteCallout}>
          {isEnglish ? 'Vote here. ' : 'Vota aqui. '}
          <span>{isEnglish ? 'It takes one tap.' : 'Solo es un toque.'}</span>
        </p>

        <div className={styles.voteGrid}>
          <button
            type="button"
            onClick={() => handleVote(true)}
            disabled={loadingVote}
            className={`${styles.voteButton} ${myVote === true ? styles.voteButtonActive : ''}`}
            style={{ '--vote-color': '#4ade80' } as React.CSSProperties}
          >
            <span className={styles.voteIcon}>+</span>
            <span className={styles.voteCopy}>
              <span className={styles.voteTitle}>{isEnglish ? 'Positive' : 'Positivo'}</span>
              <span className={styles.voteHint}>{isEnglish ? 'raise karma' : 'subir karma'}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleVote(false)}
            disabled={loadingVote}
            className={`${styles.voteButton} ${myVote === false ? styles.voteButtonActive : ''}`}
            style={{ '--vote-color': '#f87171' } as React.CSSProperties}
          >
            <span className={styles.voteIcon}>-</span>
            <span className={styles.voteCopy}>
              <span className={styles.voteTitle}>{isEnglish ? 'Negative' : 'Negativo'}</span>
              <span className={styles.voteHint}>{isEnglish ? 'lower karma' : 'bajar karma'}</span>
            </span>
          </button>
        </div>
      </div>

      {message && (
        <p style={{ color: message.includes('guardado') || message.includes('saved') ? '#c8ff00' : '#f87171', fontSize: 12, marginTop: 12, fontFamily: 'var(--font-mono)' }}>
          {message}
        </p>
      )}

      {showAuth && (
        <AuthModal
          mode={mode}
          setMode={setMode}
          locale={locale}
          onClose={() => setShowAuth(false)}
          onAuthenticated={onAuthenticated}
        />
      )}
    </>
  )
}

function AuthModal({
  mode,
  setMode,
  locale,
  onClose,
  onAuthenticated,
}: {
  mode: Mode
  setMode: (mode: Mode) => void
  locale: Locale
  onClose: () => void
  onAuthenticated: (userId: string) => void
}) {
  const isEnglish = locale === 'en'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [age, setAge] = useState('')
  const [country, setCountry] = useState('')
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        if (data.user) {
          captureEvent('auth_login', { locale })
          onAuthenticated(data.user.id)
        }
        return
      }

      if (!username.match(/^[a-z0-9_]{3,20}$/)) {
        throw new Error(isEnglish ? 'Username: 3-20 characters, lowercase letters, numbers and _ only.' : 'Username: 3-20 caracteres, solo minusculas, numeros y _.')
      }
      const ageNum = parseInt(age)
      if (isNaN(ageNum) || ageNum < 18) {
        throw new Error(isEnglish ? 'You must be 18 or older.' : 'Debes ser mayor de 18 anos.')
      }
      if (!country.trim()) {
        throw new Error(isEnglish ? 'Enter your country.' : 'Introduce tu pais.')
      }
      if (!terms) {
        throw new Error(isEnglish ? 'You must accept the terms.' : 'Debes aceptar los terminos.')
      }

      const { data: available } = await supabase.rpc('check_username_available', { p_username: username })
      if (available === false) throw new Error(isEnglish ? 'That username is already taken.' : 'Ese username ya esta en uso.')

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { age: ageNum } },
      })
      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          display_name: displayName.trim() || username,
          country: country.trim().toUpperCase(),
          accepted_terms_version: '1.0',
          accepted_at: new Date().toISOString(),
          karma_score: 0,
          votes_received_positive: 0,
          votes_received_negative: 0,
          is_bot: false,
        })
        if (profileError) throw profileError
        captureEvent('auth_signup', { username, locale })
      }

      if (data.session && data.user) {
        onAuthenticated(data.user.id)
      } else {
        setSuccess(isEnglish ? 'Account created. Confirm your email, then sign in here to apply your vote.' : 'Cuenta creada. Confirma tu email y despues inicia sesion aqui para aplicar tu voto.')
        setMode('login')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : (isEnglish ? 'Authentication failed.' : 'No se pudo autenticar.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.82)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: 'min(420px, 100%)',
        maxHeight: 'min(720px, calc(100dvh - 40px))',
        overflowY: 'auto',
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 22,
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#c8ff00', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              WML 1.0
            </div>
            <h2 style={{ margin: 0, fontSize: 22 }}>
              {mode === 'login'
                ? (isEnglish ? 'Sign in to vote' : 'Accede para votar')
                : (isEnglish ? 'Create account' : 'Crear cuenta')}
            </h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f2ee', borderRadius: 6, width: 36, height: 36, cursor: 'pointer' }}>
            x
          </button>
        </div>

        {error && <p style={noticeStyle('#f87171')}>{error}</p>}
        {success && <p style={noticeStyle('#c8ff00')}>{success}</p>}

        {mode === 'signup' && (
          <>
            <input style={inputStyle} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} />
            <input style={inputStyle} placeholder={isEnglish ? 'Display name' : 'Nombre visible'} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input style={inputStyle} type="number" placeholder={isEnglish ? 'Age' : 'Edad'} value={age} onChange={(e) => setAge(e.target.value)} />
              <input style={inputStyle} placeholder={isEnglish ? 'Country code' : 'Pais'} value={country} onChange={(e) => setCountry(e.target.value)} maxLength={2} />
            </div>
          </>
        )}

        <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder={isEnglish ? 'Password' : 'Contrasena'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />

        {mode === 'signup' && (
          <label style={{ display: 'flex', gap: 9, color: '#b8b8b8', fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ accentColor: '#c8ff00', flexShrink: 0, marginTop: 2 }} />
            <span>
              {isEnglish ? 'I confirm that I am 18 or older and accept the ' : 'Confirmo que soy mayor de 18 anos y acepto los '}
              <a href={legalPath(locale, 'terms')} target="_blank" style={{ color: '#c8ff00' }}>{isEnglish ? 'terms' : 'terminos'}</a>.
            </span>
          </label>
        )}

        <button type="button" onClick={submit} disabled={loading} className="btn-primary" style={{ width: '100%', borderRadius: 4, justifyContent: 'center' }}>
          <span>{loading ? '...' : mode === 'login' ? (isEnglish ? 'Sign in and vote' : 'Acceder y votar') : (isEnglish ? 'Create account' : 'Crear cuenta')}</span>
        </button>

        <div style={{ textAlign: 'center', color: '#6a6a6a', fontSize: 13, marginTop: 16 }}>
          {mode === 'login' ? (isEnglish ? 'No account?' : 'No tienes cuenta?') : (isEnglish ? 'Already have an account?' : 'Ya tienes cuenta?')}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }} style={{ background: 'transparent', border: 'none', color: '#c8ff00', cursor: 'pointer', textDecoration: 'underline' }}>
            {mode === 'login' ? (isEnglish ? 'Create one' : 'Crear una') : (isEnglish ? 'Sign in' : 'Acceder')}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#080808',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f5f2ee',
  padding: '12px 14px',
  borderRadius: 4,
  marginBottom: 10,
  fontSize: 14,
  outline: 'none',
}

function noticeStyle(color: string): React.CSSProperties {
  return {
    border: `1px solid ${color}55`,
    background: `${color}18`,
    color,
    padding: '10px 12px',
    borderRadius: 4,
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 12,
  }
}
