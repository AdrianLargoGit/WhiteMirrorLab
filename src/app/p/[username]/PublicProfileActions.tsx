'use client'

import { useEffect, useState } from 'react'
import { legalPath, type Locale } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { castVote, getMyVote } from '@/lib/votes'
import { captureEvent } from '@/lib/posthog'
import PostSignupSharePopup from '@/components/wml/PostSignupSharePopup'
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

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' }, { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' }, { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' }, { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' }, { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' }, { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' },
  { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czechia' },
  { code: 'DK', name: 'Denmark' }, { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' }, { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' },
  { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' }, { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' }, { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' }, { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' }, { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' }, { code: 'KE', name: 'Kenya' },
  { code: 'KW', name: 'Kuwait' }, { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' }, { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' }, { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' }, { code: 'MT', name: 'Malta' },
  { code: 'MX', name: 'Mexico' }, { code: 'MC', name: 'Monaco' },
  { code: 'MA', name: 'Morocco' }, { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' }, { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' }, { code: 'PA', name: 'Panama' },
  { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' }, { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' },
  { code: 'ZA', name: 'South Africa' }, { code: 'KR', name: 'South Korea' },
  { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' },
  { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' }, { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' }, { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }, { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
]

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
  const [postSignupUsername, setPostSignupUsername] = useState<string | null>(null)

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

  return (
    <>
      <div className={styles.statsGrid}>
        {[
          { label: 'Karma', value: karma },
          { label: isEnglish ? 'Positive' : 'Positivos', value: stats.votes_received_positive },
          { label: isEnglish ? 'Negative' : 'Negativos', value: stats.votes_received_negative },
        ].map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
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
          >
            <span className={styles.voteIcon}>-</span>
            <span className={styles.voteCopy}>
              <span className={styles.voteTitle}>{isEnglish ? 'Negative' : 'Negativo'}</span>
              <span className={styles.voteHint}>{isEnglish ? 'lower karma' : 'bajar karma'}</span>
            </span>
          </button>
        </div>
      </div>

      {message && <p className={styles.voteMessage}>{message}</p>}

      {showAuth && (
        <AuthModal
          mode={mode}
          setMode={setMode}
          locale={locale}
          onClose={() => setShowAuth(false)}
          onAuthenticated={onAuthenticated}
          onSignupCreated={setPostSignupUsername}
        />
      )}
      {postSignupUsername && (
        <PostSignupSharePopup
          username={postSignupUsername}
          locale={locale}
          onClose={() => setPostSignupUsername(null)}
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
  onSignupCreated,
}: {
  mode: Mode
  setMode: (mode: Mode) => void
  locale: Locale
  onClose: () => void
  onAuthenticated: (userId: string) => void
  onSignupCreated: (username: string) => void
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
        onSignupCreated(username)
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
    <div role="dialog" aria-modal="true" className={styles.authOverlay}>
      <div className={styles.authShell}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div>
              <div className={styles.authLogo}>
                <span className={styles.authLogoDot} />
                WML 1.0
              </div>
              <h2 className={styles.authTitle}>
                {mode === 'login'
                  ? (isEnglish ? 'Sign in to vote' : 'Accede para votar')
                  : (isEnglish ? 'Create account' : 'Crear cuenta')}
              </h2>
              <p className={styles.authSub}>
                {mode === 'login'
                  ? (isEnglish ? 'Your pending vote will be applied automatically.' : 'Tu voto pendiente se aplicara automaticamente.')
                  : (isEnglish ? 'Create your WML profile to finish voting.' : 'Crea tu perfil WML para terminar de votar.')}
              </p>
            </div>
            <button type="button" onClick={onClose} className={styles.authClose} aria-label={isEnglish ? 'Close' : 'Cerrar'}>
              x
            </button>
          </div>

          {error && <p className={`${styles.authNotice} ${styles.authError}`}>{error}</p>}
          {success && <p className={`${styles.authNotice} ${styles.authSuccess}`}>{success}</p>}

          {mode === 'signup' && (
            <>
              <input className={styles.authInput} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} />
              <input className={styles.authInput} placeholder={isEnglish ? 'Display name' : 'Nombre visible'} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <div className={styles.authSplit}>
                <input className={styles.authInput} type="number" placeholder={isEnglish ? 'Age' : 'Edad'} value={age} onChange={(e) => setAge(e.target.value)} />
                <select className={styles.authInput} value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="" disabled>{isEnglish ? 'Country' : 'Pais'}</option>
                  {COUNTRIES.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <input className={styles.authInput} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={styles.authInput} type="password" placeholder={isEnglish ? 'Password' : 'Contrasena'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />

          {mode === 'signup' && (
            <label className={styles.authCheck}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>
                {isEnglish ? 'I confirm that I am 18 or older and accept the ' : 'Confirmo que soy mayor de 18 anos y acepto los '}
                <a href={legalPath(locale, 'terms')} target="_blank">{isEnglish ? 'terms' : 'terminos'}</a>.
              </span>
            </label>
          )}

          <button type="button" onClick={submit} disabled={loading} className={styles.authPrimary}>
            <span>{loading ? '...' : mode === 'login' ? (isEnglish ? 'Sign in and vote' : 'Acceder y votar') : (isEnglish ? 'Create account' : 'Crear cuenta')}</span>
          </button>

          <div className={styles.authSwitch}>
            {mode === 'login' ? (isEnglish ? 'No account?' : 'No tienes cuenta?') : (isEnglish ? 'Already have an account?' : 'Ya tienes cuenta?')}{' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}>
              {mode === 'login' ? (isEnglish ? 'Create one' : 'Crear una') : (isEnglish ? 'Sign in' : 'Acceder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
