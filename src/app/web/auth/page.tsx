'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { captureEvent } from '@/lib/analytics'
import { mapAuthError } from '@/lib/auth-errors'
import { wmlCopy } from '@/lib/copy'
import { useLocale } from '@/hooks/useLocale'
import { wmlPath } from '@/lib/i18n'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const locale = useLocale()
  const t = wmlCopy[locale]
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        if (!username.match(/^[a-z0-9_]{3,20}$/)) {
          throw new Error(t.usernameRule)
        }
        const { data: available } = await supabase
          .rpc('check_username_available', { p_username: username })
        if (available === false) throw new Error(t.usernameTaken)

        const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
        if (signUpErr) throw signUpErr

        if (!data.session) {
          captureEvent('auth_signup_pending_confirm', { username, locale })
          setSuccess(t.confirmEmail)
          setMode('login')
          return
        }

        if (data.user) {
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            username,
            display_name: displayName || username,
            karma_score: 0,
            votes_received_positive: 0,
            votes_received_negative: 0,
            total_votes_given_positive: 0,
            total_votes_given_negative: 0,
            is_bot: false,
          })
          if (profileErr) throw profileErr
          captureEvent('auth_signup', { username, locale })
          redirectAfterLogin()
        }
      }
    } catch (e: unknown) {
      setError(mapAuthError(e, locale))
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
          <input
            className="wml-input"
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

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
                <button type="button" onClick={() => { setMode('signup'); resetMessages() }}>
                  {t.signup}
                </button>
              </>
            ) : (
              <>
                {t.haveAccount}{' '}
                <button type="button" onClick={() => { setMode('login'); resetMessages() }}>
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
