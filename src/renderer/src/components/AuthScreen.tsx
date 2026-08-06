import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from './icons'

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: (name: string, email: string, password: string) => Promise<void>
}

function AuthScreen({ onLogin, onSignup }: AuthScreenProps): React.JSX.Element {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else {
        await onSignup(`${firstName} ${lastName}`.trim(), email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'bg-fs-surface border border-fs-divider px-3 py-2 text-sm text-fs-text outline-none placeholder:text-fs-muted focus:border-fs-accent'

  return (
    <div className="relative flex h-screen w-screen items-center bg-fs-bg px-24 text-fs-text">
      <div className="absolute inset-x-0 top-0 h-1 bg-fs-accent" />
      <form onSubmit={handleSubmit} className="flex w-full max-w-90 flex-col gap-3.5">
        <span className="mb-3 w-fit border border-fs-accent px-2.5 py-0.5 text-[11px] tracking-wide text-fs-accent">
          FLOWSTATE
        </span>
        <h1 className="font-heading text-[28px] font-extrabold">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="-mt-2 mb-1 text-sm text-fs-muted">
          {mode === 'login' ? 'Log in to pick up where you left off.' : 'One account. Just you.'}
        </p>

        {mode === 'signup' && (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={`w-1/2 ${inputClass}`}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={`w-1/2 ${inputClass}`}
            />
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={`w-full pr-10 ${inputClass}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-fs-muted hover:text-fs-text"
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="text-[12.5px] text-fs-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 h-11 bg-fs-accent font-heading text-sm font-extrabold text-fs-accent-text disabled:opacity-45"
        >
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-[13px] text-fs-muted hover:text-fs-text"
        >
          {mode === 'login' ? (
            <>
              New here? <span className="text-fs-accent">Create an account</span>
            </>
          ) : (
            <>
              Already have an account? <span className="text-fs-accent">Log in</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default AuthScreen
