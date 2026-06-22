'use client'

import { Suspense, useState, useEffect } from 'react'
import { hasConsentCookie, clearConsentCookie } from '@/lib/consent'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { captureEvent } from '@/lib/posthog'
import { mapAuthError } from '@/lib/auth-errors'
import { wmlCopy } from '@/lib/copy'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'
import './auth.css'

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IcoEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IcoArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const IcoMail = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ── Tipos de modo ─────────────────────────────────────────────────────────────
type AuthMode = 'login' | 'signup' | 'forgot' | 'reset'

// ── Componente principal ──────────────────────────────────────────────────────
function AuthForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next')
  const paramMode    = searchParams.get('mode')
  const locale       = useLocale()
  const t            = wmlCopy[locale]
  const bi = (es: string, en: string) => locale === 'es' ? es : en

  // Detectar si venimos de un enlace de reset de contraseña.
  // Supabase añade ?type=recovery al redirect URL del email.
  const urlType = searchParams.get('type')

  const [mode, setMode] = useState<AuthMode>(() => {
    if (urlType === 'recovery') return 'reset'
    return paramMode === 'signup' ? 'signup' : 'login'
  })

  // ── Campos comunes ──────────────────────────────────────────────────────────
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ── Campos signup ───────────────────────────────────────────────────────────
  const [username, setUsername]     = useState('')
  const [displayName, setDisplayName] = useState('')
  const [age, setAge]               = useState('')
  const [country, setCountry]       = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // ── Campos reset ────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword]           = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')
  const [showNewPassword, setShowNewPassword]   = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // ── Estado UI ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [emailSent, setEmailSent] = useState(false)      // forgot: email enviado
  const [passwordChanged, setPasswordChanged] = useState(false) // reset: éxito

  // Redirigir a consentimiento si intenta signup sin cookie
  useEffect(() => {
    if (mode === 'signup' && !hasConsentCookie()) {
      const params = new URLSearchParams()
      params.set('mode', 'signup')
      if (next) params.set('next', next)
      router.replace(`${wmlPath(locale, '/consent')}?${params.toString()}`)
    }
  }, [mode, next, locale, router])

  // Cuando Supabase redirige al usuario después del email de recovery,
  // la URL contiene un hash con access_token. El SDK lo procesa automáticamente
  // y dispara onAuthStateChange con event = 'PASSWORD_RECOVERY'.
  // Nos aseguramos de estar en modo 'reset' si eso ocurre.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const redirectAfterLogin = () => {
    const dest = next && next.startsWith('/') ? next : wmlPath(locale, '/feed')
    router.replace(dest)
  }

  const resetMessages = () => { setError(''); setSuccess('') }

  const goTo = (m: AuthMode) => {
    resetMessages()
    setShowPassword(false)
    setMode(m)
  }

  // ── HANDLERS ─────────────────────────────────────────────────────────────────

  // LOGIN
  const handleLogin = async () => {
    resetMessages()
    if (!email || !password) { setError(bi('Rellena email y contrasena.', 'Enter your email and password.')); return }
    setLoading(true)
    try {
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
      if (loginErr) throw loginErr
      captureEvent('auth_login', { locale })
      redirectAfterLogin()
    } catch (e: unknown) {
      setError(mapAuthError(e, locale) || (e instanceof Error ? e.message : bi('Error al iniciar sesion.', 'Sign-in failed.')))
    } finally {
      setLoading(false)
    }
  }

  // SIGNUP
  const handleSignup = async () => {
    resetMessages()
    setLoading(true)
    try {
      if (!username.match(/^[a-z0-9_]{3,20}$/)) throw new Error(t.usernameRule)

      const ageNum = parseInt(age)
      if (isNaN(ageNum) || ageNum < 18) throw new Error(bi('Debes ser mayor de 18 anos para registrarte.', 'You must be 18 or older to register.'))
      if (!country) throw new Error(bi('Selecciona un pais.', 'Select a country.'))
      if (!termsAccepted) throw new Error(bi('Debes aceptar los terminos y condiciones.', 'You must accept the terms and conditions.'))

      const { data: available } = await supabase.rpc('check_username_available', { p_username: username })
      if (available === false) throw new Error(t.usernameTaken)

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { age: ageNum } },
      })
      if (signUpErr) throw signUpErr

      if (data.user) {
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          display_name: displayName || username,
          country,
          accepted_terms_version: '1.0',
          accepted_at: new Date().toISOString(),
          karma_score: 0,
          total_votes_given_positive: 0,
          total_votes_given_negative: 0,
          is_bot: false,
        })
        if (profileErr) throw new Error(`${bi('Error al crear el perfil', 'Profile creation failed')}: ${profileErr.message}`)
        captureEvent('auth_signup', { locale })
        clearConsentCookie()
      }

      if (!data.session) {
        captureEvent('auth_signup_pending_confirm', { locale })
        setSuccess(t.confirmEmail)
        setMode('login')
        return
      }
      redirectAfterLogin()
    } catch (e: unknown) {
      setError(mapAuthError(e, locale) || (e instanceof Error ? e.message : bi('Error al crear la cuenta.', 'Account creation failed.')))
    } finally {
      setLoading(false)
    }
  }

  // FORGOT PASSWORD — envía el email de recuperación
  const handleForgot = async () => {
    resetMessages()
    if (!email || !email.includes('@')) { setError(bi('Introduce un email valido.', 'Enter a valid email.')); return }
    setLoading(true)
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        // ⚠️  Esta URL debe estar en la lista de "Redirect URLs" de Supabase
        // (ver instrucciones al final del archivo)
        redirectTo: `${window.location.origin}${wmlPath(locale, '/auth')}?type=recovery`,
      })
      // Supabase siempre devuelve éxito (sin revelar si el email existe)
      if (resetErr) throw resetErr
      setEmailSent(true)
      captureEvent('auth_forgot_password', { locale })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : bi('Error al enviar el email.', 'Failed to send the email.'))
    } finally {
      setLoading(false)
    }
  }

  // RESET PASSWORD — actualiza la contraseña con el token del email
  const handleReset = async () => {
    resetMessages()
    if (newPassword.length < 8) {
      setError(bi('La contrasena debe tener al menos 8 caracteres.', 'Password must be at least 8 characters.'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(bi('Las contrasenas no coinciden.', 'Passwords do not match.'))
      return
    }
    setLoading(true)
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updateErr) throw updateErr
      setPasswordChanged(true)
      captureEvent('auth_password_reset_success', { locale })
      // Cerrar sesión limpia para que el usuario haga login con la nueva contraseña
      await supabase.auth.signOut()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : bi('Error al actualizar la contrasena.', 'Password update failed.'))
    } finally {
      setLoading(false)
    }
  }

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="wml-auth-wrap">
      <div className="wml-auth">
        <div className="wml-auth-card">

          {/* Logo */}
          <div className="wml-auth-logo">
            <span style={{ display: 'inline-block', width: 7, height: 7, background: 'var(--w-accent)', borderRadius: '50%' }} />
            WML 1.0 — Karma Score
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* LOGIN                                                              */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {mode === 'login' && (
            <>
              <div className="wml-auth-title">{t.authTitleLogin}</div>
              <div className="wml-auth-sub">{t.authSubLogin}</div>

              {error   && <div className="wml-error-msg">{error}</div>}
              {success && <div className="wml-success-msg">{success}</div>}

              <input className="wml-input" type="email" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />

              <PasswordField
                value={password} onChange={setPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)}
                placeholder={t.password}
                autoComplete="current-password"
                onEnter={handleLogin}
              />

              {/* Olvidé mi contraseña */}
              <div style={{ textAlign: 'right', marginBottom: 4 }}>
                <button type="button" onClick={() => goTo('forgot')}
                  style={{ background: 'none', border: 'none', color: 'var(--w-muted-2)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--w-font-body)', textDecoration: 'underline' }}>
                  {bi('Olvidaste tu contrasena?', 'Forgot your password?')}
                </button>
              </div>

              <button type="button" className="wml-btn wml-btn-primary" onClick={handleLogin}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                {loading ? '...' : t.authTitleLogin}
              </button>

              <div className="wml-auth-switch">
                {t.noAccount}{' '}
                <button type="button" onClick={() => {
                  resetMessages()
                  setShowPassword(false)
                  if (!hasConsentCookie()) {
                    const params = new URLSearchParams()
                    params.set('mode', 'signup')
                    if (next) params.set('next', next)
                    router.push(`${wmlPath(locale, '/consent')}?${params.toString()}`)
                  } else {
                    setMode('signup')
                  }
                }}>
                  {t.signup}
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* SIGNUP                                                             */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {mode === 'signup' && (
            <>
              <div className="wml-auth-title">{t.authTitleSignup}</div>
              <div className="wml-auth-sub">{t.authSubSignup}</div>

              {error   && <div className="wml-error-msg">{error}</div>}
              {success && <div className="wml-success-msg">{success}</div>}

              <input className="wml-input" placeholder="Username (ex: user_42)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={20} autoComplete="off" spellCheck={false}
              />
              <input className="wml-input" placeholder={t.displayName}
                value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40}
              />
              <input className="wml-input" type="number" placeholder={bi('Edad (+18)', 'Age (18+)')}
                value={age} onChange={(e) => setAge(e.target.value)} min="18"
              />
              <select className="wml-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="" disabled>{bi('Pais', 'Country')}</option>
                <option value="AF">Afghanistan</option><option value="AL">Albania</option>
                <option value="DZ">Algeria</option><option value="AD">Andorra</option>
                <option value="AO">Angola</option><option value="AR">Argentina</option>
                <option value="AM">Armenia</option><option value="AU">Australia</option>
                <option value="AT">Austria</option><option value="AZ">Azerbaijan</option>
                <option value="BS">Bahamas</option><option value="BH">Bahrain</option>
                <option value="BD">Bangladesh</option><option value="BB">Barbados</option>
                <option value="BY">Belarus</option><option value="BE">Belgium</option>
                <option value="BZ">Belize</option><option value="BO">Bolivia</option>
                <option value="BA">Bosnia and Herzegovina</option><option value="BW">Botswana</option>
                <option value="BR">Brazil</option><option value="BN">Brunei</option>
                <option value="BG">Bulgaria</option><option value="KH">Cambodia</option>
                <option value="CM">Cameroon</option><option value="CA">Canada</option>
                <option value="CL">Chile</option><option value="CN">China</option>
                <option value="CO">Colombia</option><option value="CR">Costa Rica</option>
                <option value="HR">Croatia</option><option value="CU">Cuba</option>
                <option value="CY">Cyprus</option><option value="CZ">Czechia</option>
                <option value="DK">Denmark</option><option value="DO">Dominican Republic</option>
                <option value="EC">Ecuador</option><option value="EG">Egypt</option>
                <option value="SV">El Salvador</option><option value="EE">Estonia</option>
                <option value="ET">Ethiopia</option><option value="FJ">Fiji</option>
                <option value="FI">Finland</option><option value="FR">France</option>
                <option value="GE">Georgia</option><option value="DE">Germany</option>
                <option value="GH">Ghana</option><option value="GR">Greece</option>
                <option value="GT">Guatemala</option><option value="HN">Honduras</option>
                <option value="HU">Hungary</option><option value="IS">Iceland</option>
                <option value="IN">India</option><option value="ID">Indonesia</option>
                <option value="IR">Iran</option><option value="IQ">Iraq</option>
                <option value="IE">Ireland</option><option value="IL">Israel</option>
                <option value="IT">Italy</option><option value="JM">Jamaica</option>
                <option value="JP">Japan</option><option value="JO">Jordan</option>
                <option value="KZ">Kazakhstan</option><option value="KE">Kenya</option>
                <option value="KW">Kuwait</option><option value="LV">Latvia</option>
                <option value="LB">Lebanon</option><option value="LT">Lithuania</option>
                <option value="LU">Luxembourg</option><option value="MY">Malaysia</option>
                <option value="MV">Maldives</option><option value="MT">Malta</option>
                <option value="MX">Mexico</option><option value="MC">Monaco</option>
                <option value="MA">Morocco</option><option value="NP">Nepal</option>
                <option value="NL">Netherlands</option><option value="NZ">New Zealand</option>
                <option value="NI">Nicaragua</option><option value="NG">Nigeria</option>
                <option value="NO">Norway</option><option value="OM">Oman</option>
                <option value="PK">Pakistan</option><option value="PA">Panama</option>
                <option value="PY">Paraguay</option><option value="PE">Peru</option>
                <option value="PH">Philippines</option><option value="PL">Poland</option>
                <option value="PT">Portugal</option><option value="QA">Qatar</option>
                <option value="RO">Romania</option><option value="RU">Russia</option>
                <option value="SA">Saudi Arabia</option><option value="SN">Senegal</option>
                <option value="RS">Serbia</option><option value="SG">Singapore</option>
                <option value="SK">Slovakia</option><option value="SI">Slovenia</option>
                <option value="ZA">South Africa</option><option value="KR">South Korea</option>
                <option value="ES">Spain</option><option value="LK">Sri Lanka</option>
                <option value="SE">Sweden</option><option value="CH">Switzerland</option>
                <option value="SY">Syria</option><option value="TW">Taiwan</option>
                <option value="TH">Thailand</option><option value="TN">Tunisia</option>
                <option value="TR">Turkey</option><option value="UA">Ukraine</option>
                <option value="AE">United Arab Emirates</option><option value="GB">United Kingdom</option>
                <option value="US">United States</option><option value="UY">Uruguay</option>
                <option value="VE">Venezuela</option><option value="VN">Vietnam</option>
                <option value="YE">Yemen</option><option value="ZM">Zambia</option>
                <option value="ZW">Zimbabwe</option>
              </select>

              <input className="wml-input" type="email" placeholder="Email"
                value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
              />

              <PasswordField
                value={password} onChange={setPassword}
                show={showPassword} onToggle={() => setShowPassword(!showPassword)}
                placeholder={t.password}
                autoComplete="new-password"
                onEnter={handleSignup}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginTop: 8, color: 'var(--w-muted-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                {bi('Confirmo que soy mayor de 18 anos y acepto los', 'I confirm that I am 18 or older and accept the')}{' '}
                <a href="/legal/terminos" target="_blank" style={{ color: 'var(--w-accent)' }}>{bi('terminos', 'terms')}</a>.
              </label>

              <button type="button" className="wml-btn wml-btn-primary" onClick={handleSignup}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? '...' : t.authTitleSignup}
              </button>

              <div className="wml-auth-switch">
                {t.haveAccount}{' '}
                <button type="button" onClick={() => goTo('login')}>{t.authTitleLogin}</button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* FORGOT PASSWORD                                                    */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {mode === 'forgot' && (
            <>
              {/* Back */}
              <button type="button" onClick={() => goTo('login')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--w-muted-2)', cursor: 'pointer', fontFamily: 'var(--w-font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, padding: 0 }}>
                <IcoArrowLeft /> {bi('Volver', 'Back')}
              </button>

              {!emailSent ? (
                <>
                  <div className="wml-auth-title">{bi('Recuperar contrasena', 'Reset password')}</div>
                  <div className="wml-auth-sub">
                    {bi('Introduce tu email y te enviaremos un enlace para crear una nueva contrasena.', 'Enter your email and we will send you a link to create a new password.')}
                  </div>

                  {error && <div className="wml-error-msg">{error}</div>}

                  <input className="wml-input" type="email" placeholder="tu@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    onKeyDown={(e) => e.key === 'Enter' && handleForgot()}
                    autoFocus
                  />

                  <button type="button" className="wml-btn wml-btn-primary" onClick={handleForgot}
                    disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? bi('Enviando...', 'Sending...') : bi('Enviar enlace de recuperacion', 'Send reset link')}
                  </button>
                </>
              ) : (
                /* Estado: email enviado */
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ color: 'var(--w-accent)', marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
                    <IcoMail />
                  </div>
                  <div className="wml-auth-title" style={{ fontSize: 20 }}>{bi('Revisa tu email', 'Check your email')}</div>
                  <div className="wml-auth-sub" style={{ marginBottom: 24 }}>
                    {bi('Si', 'If')} <strong>{email}</strong> {bi('tiene una cuenta, recibiras un enlace de recuperacion en los proximos minutos. Revisa tambien spam.', 'has an account, you will receive a reset link in the next few minutes. Check your spam folder too.')}
                  </div>
                  <div style={{ fontFamily: 'var(--w-font-mono)', fontSize: 10, color: 'var(--w-muted)', letterSpacing: '0.1em', marginBottom: 24 }}>
                    {bi('El enlace expira en 1 hora.', 'The link expires in 1 hour.')}
                  </div>
                  <button type="button" className="wml-btn wml-btn-ghost" onClick={() => { setEmailSent(false); setEmail('') }}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {bi('Usar otro email', 'Use another email')}
                  </button>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* RESET PASSWORD (viene del enlace del email)                        */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {mode === 'reset' && (
            <>
              {!passwordChanged ? (
                <>
                  <div className="wml-auth-title">{bi('Nueva contrasena', 'New password')}</div>
                  <div className="wml-auth-sub">
                    {bi('Elige una contrasena segura. Minimo 8 caracteres.', 'Choose a secure password. Minimum 8 characters.')}
                  </div>

                  {error && <div className="wml-error-msg">{error}</div>}

                  <PasswordField
                    value={newPassword} onChange={setNewPassword}
                    show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)}
                    placeholder={bi('Nueva contrasena (min. 8 caracteres)', 'New password (min. 8 characters)')}
                    autoComplete="new-password"
                    onEnter={() => {}}
                    autoFocus
                  />

                  {/* Indicador de fortaleza */}
                  {newPassword.length > 0 && (
                    <PasswordStrength password={newPassword} />
                  )}

                  <PasswordField
                    value={confirmPassword} onChange={setConfirmPassword}
                    show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    placeholder={bi('Repetir contrasena', 'Repeat password')}
                    autoComplete="new-password"
                    onEnter={handleReset}
                  />

                  {/* Validación de coincidencia en tiempo real */}
                  {confirmPassword.length > 0 && (
                    <div style={{
                      fontFamily: 'var(--w-font-mono)', fontSize: 10,
                      letterSpacing: '0.08em', marginBottom: 12,
                      color: newPassword === confirmPassword ? 'var(--w-accent)' : 'var(--w-accent-neg)',
                    }}>
                      {newPassword === confirmPassword ? bi('Las contrasenas coinciden', 'Passwords match') : bi('No coinciden', 'Passwords do not match')}
                    </div>
                  )}

                  <button type="button" className="wml-btn wml-btn-primary" onClick={handleReset}
                    disabled={loading || newPassword !== confirmPassword || newPassword.length < 8}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading ? bi('Guardando...', 'Saving...') : bi('Guardar nueva contrasena', 'Save new password')}
                  </button>
                </>
              ) : (
                /* Estado: contraseña cambiada con éxito */
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--w-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', color: '#000',
                  }}>
                    <IcoCheck />
                  </div>
                  <div className="wml-auth-title" style={{ fontSize: 20 }}>{bi('Contrasena actualizada', 'Password updated')}</div>
                  <div className="wml-auth-sub" style={{ marginBottom: 24 }}>
                    {bi('Tu contrasena se ha cambiado correctamente. Ahora puedes acceder con ella.', 'Your password was updated. You can now sign in with it.')}
                  </div>
                  <button type="button" className="wml-btn wml-btn-primary"
                    onClick={() => { setMode('login'); setNewPassword(''); setConfirmPassword('') }}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {bi('Ir a acceder', 'Go to sign in')}
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Sub-componente: campo de contraseña con toggle ────────────────────────────
function PasswordField({
  value, onChange, show, onToggle, placeholder, autoComplete, onEnter, autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
  autoComplete: string
  onEnter: () => void
  autoFocus?: boolean
}) {
  const locale = useLocale()
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        className="wml-input"
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        style={{ paddingRight: 42 }}
      />
      <button type="button" onClick={onToggle}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--w-muted)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, zIndex: 2,
        }}
        title={show ? (locale === 'es' ? 'Ocultar contrasena' : 'Hide password') : (locale === 'es' ? 'Mostrar contrasena' : 'Show password')}
      >
        {show ? <IcoEyeOff /> : <IcoEye />}
      </button>
    </div>
  )
}

// ── Sub-componente: indicador de fortaleza de contraseña ──────────────────────
function PasswordStrength({ password }: { password: string }) {
  const locale = useLocale()
  const checks = [
    { label: locale === 'es' ? '8+ caracteres' : '8+ characters', ok: password.length >= 8 },
    { label: locale === 'es' ? 'Mayuscula' : 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: locale === 'es' ? 'Numero' : 'Number', ok: /[0-9]/.test(password) },
    { label: locale === 'es' ? 'Simbolo (!@#...)' : 'Symbol (!@#...)', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score  = checks.filter((c) => c.ok).length
  const colors = ['var(--w-accent-neg)', 'var(--w-accent-neg)', '#f59e0b', 'var(--w-accent)', 'var(--w-accent)']
  const labels = locale === 'es'
    ? ['', 'Debil', 'Debil', 'Media', 'Fuerte']
    : ['', 'Weak', 'Weak', 'Medium', 'Strong']

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Barra */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score] : 'var(--w-border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      {/* Checks */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {checks.map((c) => (
          <span key={c.label} style={{
            fontFamily: 'var(--w-font-mono)', fontSize: 9, letterSpacing: '0.06em',
            color: c.ok ? 'var(--w-accent)' : 'var(--w-muted)',
            transition: 'color 0.2s',
          }}>
            {c.ok ? '✓' : '○'} {c.label}
          </span>
        ))}
        {score > 0 && (
          <span style={{ fontFamily: 'var(--w-font-mono)', fontSize: 9, letterSpacing: '0.06em', color: colors[score], marginLeft: 'auto' }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const locale = useLocale()
  return (
    <Suspense fallback={<div className="wml-empty">{wmlCopy[locale].loadingExperiment}</div>}>
      <AuthForm />
    </Suspense>
  )
}
