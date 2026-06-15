'use client'

import { Suspense, useState, useEffect } from 'react'
import { hasConsentCookie, clearConsentCookie } from '@/lib/consent' // <-- Añadido clearConsentCookie
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { captureEvent } from '@/lib/posthog'
import { mapAuthError } from '@/lib/auth-errors'
import { wmlCopy } from '@/lib/copy'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'
import './auth.css'

// Iconos para mostrar / ocultar contraseña
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

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const paramMode = searchParams.get('mode') // <-- Lee si viene redirigido desde el consentimiento
  const locale = useLocale()
  const t = wmlCopy[locale]
  
  // Cambiado para que si la URL dice 'signup', empiece directamente ahí
  const [mode, setMode] = useState<'login' | 'signup'>(paramMode === 'signup' ? 'signup' : 'login')
  
  // Estados originales
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  
  // Nuevos estados obligatorios para la BD y la edad
  const [age, setAge] = useState('')
  const [country, setCountry] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Estado para la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Intercepta accesos directos o manuales a SignUp sin haber firmado el consentimiento
  useEffect(() => {
    if (mode === 'signup' && !hasConsentCookie()) {
      const params = new URLSearchParams()
      params.set('mode', 'signup')
      if (next) params.set('next', next)
      
      router.replace(`${wmlPath(locale, '/consent')}?${params.toString()}`)
    }
  }, [mode, next, locale, router])

  const redirectAfterLogin = () => {
    const dest = next && next.startsWith('/') ? next : wmlPath(locale, '/feed')
    router.replace(dest)
  }

  const resetMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleSubmit = async () => {
    resetMessages()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        if (loginErr) throw loginErr
        captureEvent('auth_login', { locale })
        redirectAfterLogin()
      } else {
        // Validaciones Front-end
        if (!username.match(/^[a-z0-9_]{3,20}$/)) {
          throw new Error(t.usernameRule)
        }
        
        // Validación estricta de edad +18
        const ageNum = parseInt(age)
        if (isNaN(ageNum) || ageNum < 18) {
          throw new Error("Debes ser mayor de 18 años para registrarte.")
        }
        if (!country) {
          throw new Error("Por favor, selecciona un país.")
        }
        if (!termsAccepted) {
          throw new Error("Debes aceptar los términos y condiciones.")
        }

        const { data: available } = await supabase
          .rpc('check_username_available', { p_username: username })
        if (available === false) throw new Error(t.usernameTaken)

        const { data, error: signUpErr } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { age: ageNum } } 
        })
        if (signUpErr) throw signUpErr

        if (data.user) {
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            username,
            display_name: displayName || username,
            country: country, 
            accepted_terms_version: '1.0', 
            accepted_at: new Date().toISOString(), 
            karma_score: 0,
            votes_received_positive: 0,
            votes_received_negative: 0,
            is_bot: false,
          })
          
          if (profileErr) {
             throw new Error(`Error al crear el perfil: ${profileErr.message || 'Faltan campos obligatorios en la BD'}`)
          }
          captureEvent('auth_signup', { username, locale })
          clearConsentCookie()
        }

        if (!data.session) {
          captureEvent('auth_signup_pending_confirm', { username, locale })
          setSuccess(t.confirmEmail)
          setMode('login')
          return
        }

        redirectAfterLogin()
      }
    } catch (e: any) {
      setError(mapAuthError(e, locale) || e.message || 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wml-auth-wrap">
      <div className="wml-auth">
        <div className="wml-auth-card">
          <div className="wml-auth-logo">
            <span style={{ display: 'inline-block', width: 7, height: 7, background: 'var(--w-accent)', borderRadius: '50%' }} />
            WML 1.0 - Karma Score
          </div>

          <div className="wml-auth-title">
            {mode === 'login' ? t.authTitleLogin : t.authTitleSignup}
          </div>
          <div className="wml-auth-sub">
            {mode === 'login' ? t.authSubLogin : t.authSubSignup}
          </div>

          {error && <div className="wml-error-msg">{error}</div>}
          {success && <div className="wml-success-msg">{success}</div>}

          {mode === 'signup' && (
            <>
              <input
                className="wml-input"
                placeholder="Username (ex: user_42)"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
              />
              <input
                className="wml-input"
                placeholder={t.displayName}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
              />
              
              <input
                className="wml-input"
                type="number"
                placeholder="Edad (+18)"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
              />
              
              <select 
                className="wml-input" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="" disabled>Country / País</option>
                <option value="AF">Afghanistan</option>
<option value="AL">Albania</option>
<option value="DZ">Algeria</option>
<option value="AD">Andorra</option>
<option value="AO">Angola</option>
<option value="AR">Argentina</option>
<option value="AM">Armenia</option>
<option value="AU">Australia</option>
<option value="AT">Austria</option>
<option value="AZ">Azerbaijan</option>
<option value="BS">Bahamas</option>
<option value="BH">Bahrain</option>
<option value="BD">Bangladesh</option>
<option value="BB">Barbados</option>
<option value="BY">Belarus</option>
<option value="BE">Belgium</option>
<option value="BZ">Belize</option>
<option value="BO">Bolivia</option>
<option value="BA">Bosnia and Herzegovina</option>
<option value="BW">Botswana</option>
<option value="BR">Brazil</option>
<option value="BN">Brunei</option>
<option value="BG">Bulgaria</option>
<option value="KH">Cambodia</option>
<option value="CM">Cameroon</option>
<option value="CA">Canada</option>
<option value="CL">Chile</option>
<option value="CN">China</option>
<option value="CO">Colombia</option>
<option value="CR">Costa Rica</option>
<option value="HR">Croatia</option>
<option value="CU">Cuba</option>
<option value="CY">Cyprus</option>
<option value="CZ">Czechia</option>
<option value="DK">Denmark</option>
<option value="DO">Dominican Republic</option>
<option value="EC">Ecuador</option>
<option value="EG">Egypt</option>
<option value="SV">El Salvador</option>
<option value="EE">Estonia</option>
<option value="ET">Ethiopia</option>
<option value="FJ">Fiji</option>
<option value="FI">Finland</option>
<option value="FR">France</option>
<option value="GE">Georgia</option>
<option value="DE">Germany</option>
<option value="GH">Ghana</option>
<option value="GR">Greece</option>
<option value="GT">Guatemala</option>
<option value="HN">Honduras</option>
<option value="HU">Hungary</option>
<option value="IS">Iceland</option>
<option value="IN">India</option>
<option value="ID">Indonesia</option>
<option value="IR">Iran</option>
<option value="IQ">Iraq</option>
<option value="IE">Ireland</option>
<option value="IL">Israel</option>
<option value="IT">Italy</option>
<option value="JM">Jamaica</option>
<option value="JP">Japan</option>
<option value="JO">Jordan</option>
<option value="KZ">Kazakhstan</option>
<option value="KE">Kenya</option>
<option value="KW">Kuwait</option>
<option value="LV">Latvia</option>
<option value="LB">Lebanon</option>
<option value="LT">Lithuania</option>
<option value="LU">Luxembourg</option>
<option value="MY">Malaysia</option>
<option value="MV">Maldives</option>
<option value="MT">Malta</option>
<option value="MX">Mexico</option>
<option value="MC">Monaco</option>
<option value="MA">Morocco</option>
<option value="NP">Nepal</option>
<option value="NL">Netherlands</option>
<option value="NZ">New Zealand</option>
<option value="NI">Nicaragua</option>
<option value="NG">Nigeria</option>
<option value="NO">Norway</option>
<option value="OM">Oman</option>
<option value="PK">Pakistan</option>
<option value="PA">Panama</option>
<option value="PY">Paraguay</option>
<option value="PE">Peru</option>
<option value="PH">Philippines</option>
<option value="PL">Poland</option>
<option value="PT">Portugal</option>
<option value="QA">Qatar</option>
<option value="RO">Romania</option>
<option value="RU">Russia</option>
<option value="SA">Saudi Arabia</option>
<option value="SN">Senegal</option>
<option value="RS">Serbia</option>
<option value="SG">Singapore</option>
<option value="SK">Slovakia</option>
<option value="SI">Slovenia</option>
<option value="ZA">South Africa</option>
<option value="KR">South Korea</option>
<option value="ES">Spain</option>
<option value="LK">Sri Lanka</option>
<option value="SE">Sweden</option>
<option value="CH">Switzerland</option>
<option value="SY">Syria</option>
<option value="TW">Taiwan</option>
<option value="TH">Thailand</option>
<option value="TN">Tunisia</option>
<option value="TR">Turkey</option>
<option value="UA">Ukraine</option>
<option value="AE">United Arab Emirates</option>
<option value="GB">United Kingdom</option>
<option value="US">United States</option>
<option value="UY">Uruguay</option>
<option value="VE">Venezuela</option>
<option value="VN">Vietnam</option>
<option value="YE">Yemen</option>
<option value="ZM">Zambia</option>
<option value="ZW">Zimbabwe</option>
              </select>
            </>
          )}

          <input
            className="wml-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          {/* Contenedor relativo para posicionar el botón de visibilidad */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              className="wml-input"
              type={showPassword ? 'text' : 'password'}
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{ paddingRight: '42px' }} // Margen interno derecho para que el texto no tape el icono
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--w-muted, #71717a)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                zIndex: 2
              }}
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <IcoEyeOff /> : <IcoEye />}
            </button>
          </div>

          {mode === 'signup' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginTop: '8px', color: 'var(--w-muted, #71717a)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              Confirmo que soy mayor de 18 años y acepto los términos.
            </label>
          )}

          <button
            type="button"
            className="wml-btn wml-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? '...' : mode === 'login' ? t.authTitleLogin : t.authTitleSignup}
          </button>

          <div className="wml-auth-switch">
            {mode === 'login' ? (
              <>
                {t.noAccount}{' '}
                <button type="button" onClick={() => { 
  resetMessages(); 
  setShowPassword(false);
  // Si intenta ir a registrarse pero no tiene la cookie, lo mandamos a la pantalla de consentimiento
  if (!hasConsentCookie()) {
    const params = new URLSearchParams()
    params.set('mode', 'signup')
    if (next) params.set('next', next)
    router.push(`${wmlPath(locale, '/consent')}?${params.toString()}`)
  } else {
    setMode('signup');
  }
}}>
  {t.signup}
</button>
              </>
            ) : (
              <>
                {t.haveAccount}{' '}
                <button type="button" onClick={() => { setMode('login'); resetMessages(); setShowPassword(false) }}>
                  {t.authTitleLogin}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const locale = useLocale()
  return (
    <Suspense fallback={<div className="wml-empty">{wmlCopy[locale].loadingExperiment}</div>}>
      <AuthForm />
    </Suspense>
  )
}