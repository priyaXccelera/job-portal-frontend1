import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { currentRole, homeFor, login } from '../auth/auth'
import { AuthCard, FormAlert } from '../components/AuthCard'
import { CheckboxField, TextField } from '../components/fields'
import { DEMO_PASSWORD } from '../constants'
import { useSeo } from '../hooks'
import { validateIdentifier, validateRequired } from '../validation'

// MOCK: demo accounts offered as one-click fill buttons for reviewers; remove before wiring a real backend.
const DEMO_ACCOUNTS = [
  { label: 'Job seeker', identifier: 'seeker1@mail.com' },
  { label: 'Recruiter', identifier: 'recruiter1@company.com' },
  { label: 'Admin', identifier: 'admin@jobportal.com' },
]

export function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [attempted, setAttempted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  useSeo('Login', 'Log in to your JobHub account.')

  const errors = { identifier: validateIdentifier(identifier), password: validateRequired(password, 'Password') }
  const isValid = !errors.identifier && !errors.password

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setAttempted(true)
    if (!isValid || loading) return
    setLoading(true)
    setError('')
    try {
      const ok = await login(identifier.trim(), password)
      if (!ok) {
        setError('Invalid email/mobile or password')
        return
      }
      toast.success('Welcome back!')
      const returnTo = params.get('returnTo')
      navigate(returnTo && returnTo.startsWith('/') ? returnTo : homeFor(currentRole()), { replace: true })
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Login" subtitle="Welcome back! Log in to continue.">
      <FormAlert message={error} />
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField label="Email ID / Mobile number" required autoComplete="username" value={identifier} error={attempted ? errors.identifier : ''} onChange={(event) => setIdentifier(event.target.value)} />
        <TextField label="Password" type="password" required autoComplete="current-password" value={password} error={attempted ? errors.password : ''} onChange={(event) => setPassword(event.target.value)} />
        <div className="flex items-center justify-between">
          <CheckboxField label="Remember me" checked={remember} onChange={setRemember} />
          <Link to="/forgot-password" className="text-sm font-semibold text-primary">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="btn-primary w-full py-2.5" disabled={loading || (attempted && !isValid)}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        OR
        <span className="h-px flex-1 bg-line" />
      </div>
      <Link to="/login-otp" className="btn-outline w-full py-2.5">
        Login with OTP
      </Link>
      <p className="mt-4 text-center text-sm text-muted">
        New to JobHub?{' '}
        <Link to="/register" className="font-semibold text-primary">
          Sign up
        </Link>
      </p>
      <div className="mt-5 rounded-lg bg-soft p-3 text-xs text-muted">
        <p className="mb-2 font-semibold text-ink">Demo accounts (password: {DEMO_PASSWORD})</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.identifier}
              type="button"
              className="chip"
              onClick={() => {
                setIdentifier(account.identifier)
                setPassword(DEMO_PASSWORD)
              }}
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </AuthCard>
  )
}
