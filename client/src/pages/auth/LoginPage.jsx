import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Loader2, LogIn, UserPlus,
  User, Mail, Lock, Phone, CheckCircle2, AlertCircle, ArrowLeft,
} from 'lucide-react'
import PageLayout from '@components/layout/PageLayout'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE  = /^\+?[1-9]\d{9,13}$/
const UNAME_RE  = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/
const NAME_RE   = /^[a-zA-Z\s]{2,50}$/

function validateLogin({ username, password }) {
  const e = {}
  if (!username.trim())              e.username = 'Username is required'
  else if (username.trim().length < 3) e.username = 'At least 3 characters'
  if (!password)                     e.password = 'Password is required'
  return e
}

function validateRegister(f) {
  const e = {}
  if (!f.full_name.trim())            e.full_name = 'Full name is required'
  else if (!NAME_RE.test(f.full_name.trim())) e.full_name = 'Letters and spaces only, 2–50 chars'

  if (!f.username.trim())             e.username = 'Username is required'
  else if (!UNAME_RE.test(f.username)) e.username = '3–20 chars, letters/numbers/underscore, start with letter'

  if (!f.email.trim())                e.email = 'Email is required'
  else if (!EMAIL_RE.test(f.email))   e.email = 'Enter a valid email address'

  if (f.phone && !PHONE_RE.test(f.phone.replace(/[\s\-()]/g, '')))
                                      e.phone = 'Enter a valid phone number (10–14 digits)'

  if (!f.password)                    e.password = 'Password is required'
  else {
    const issues = []
    if (f.password.length < 8)          issues.push('at least 8 characters')
    if (!/[A-Z]/.test(f.password))      issues.push('one uppercase letter')
    if (!/[a-z]/.test(f.password))      issues.push('one lowercase letter')
    if (!/[0-9]/.test(f.password))      issues.push('one number')
    if (issues.length) e.password = `Password needs: ${issues.join(', ')}`
  }

  if (!f.confirm_password)            e.confirm_password = 'Please confirm your password'
  else if (f.password !== f.confirm_password) e.confirm_password = 'Passwords do not match'

  return e
}

function passwordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[a-z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
const STRENGTH_COLORS = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6']

// ─── Field component ──────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-red-400"
        >
          <AlertCircle size={11} />
          {error}
        </motion.p>
      )}
    </div>
  )
}

function Input({ icon: Icon, right, error, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
      )}
      <input
        {...props}
        className={[
          'w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
          'bg-bg-elevated focus:outline-none focus:ring-2 transition-all duration-200',
          Icon ? 'pl-9' : '',
          right ? 'pr-10' : '',
          error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
            : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20',
        ].join(' ')}
      />
      {right}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, login, register, isLoading: authLoading } = useAuth()

  const [tab, setTab] = useState('login')   // 'login' | 'register'

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginApiError, setLoginApiError] = useState('')

  // Register state
  const [regForm, setRegForm] = useState({
    full_name: '', username: '', email: '', phone: '', password: '', confirm_password: '',
  })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)
  const [regApiError, setRegApiError] = useState('')
  const [regSuccess, setRegSuccess] = useState(false)

  const [showLoginPw, setShowLoginPw]   = useState(false)
  const [showRegPw, setShowRegPw]       = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const dest = user?.role === 'student' ? '/student' : '/dashboard'
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, navigate, user])

  // ── Login submit ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    const errors = validateLogin(loginForm)
    setLoginErrors(errors)
    if (Object.keys(errors).length) return

    setLoginLoading(true)
    setLoginApiError('')
    try {
      const decoded = await login(loginForm.username, loginForm.password)
      navigate(decoded?.role === 'student' ? '/student' : '/dashboard', { replace: true })
    } catch (err) {
      setLoginApiError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password'
      )
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Register submit ─────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    const errors = validateRegister(regForm)
    setRegErrors(errors)
    if (Object.keys(errors).length) return

    setRegLoading(true)
    setRegApiError('')
    try {
      await register({
        full_name:    regForm.full_name.trim(),
        username:     regForm.username.trim(),
        email:        regForm.email.trim(),
        phone:        regForm.phone.trim() || undefined,
        password:     regForm.password,
        role:         'student',
      })
      setRegSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const fieldErrors = {}
        if (data.username)  fieldErrors.username = Array.isArray(data.username) ? data.username[0] : data.username
        if (data.email)     fieldErrors.email    = Array.isArray(data.email)    ? data.email[0]    : data.email
        if (data.phone)     fieldErrors.phone    = Array.isArray(data.phone)    ? data.phone[0]    : data.phone
        if (Object.keys(fieldErrors).length) {
          setRegErrors(prev => ({ ...prev, ...fieldErrors }))
        } else {
          setRegApiError(data.detail || data.non_field_errors?.[0] || 'Registration failed. Please try again.')
        }
      } else {
        setRegApiError('Registration failed. Please try again.')
      }
    } finally {
      setRegLoading(false)
    }
  }

  const strength = passwordStrength(regForm.password)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="animate-spin text-brand-primary" size={36} />
      </div>
    )
  }

  return (
    <PageLayout
      title={tab === 'login' ? 'Sign In' : 'Create Account'}
      description="Think With Aman — Student portal"
      withTopPadding={false}
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-16 bg-bg-base">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Back to home */}
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors group">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </button>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeUp} className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-text-primary mb-1">
              Think With<span className="gradient-text"> Aman</span>
            </h1>
            <p className="text-sm text-text-secondary">Student Learning Portal</p>
          </motion.div>

          {/* Tab switcher */}
          <motion.div
            variants={fadeUp}
            className="flex rounded-xl border border-bg-border bg-bg-surface p-1 mb-6"
          >
            {[
              { id: 'login',    label: 'Sign In',        Icon: LogIn },
              { id: 'register', label: 'Create Account', Icon: UserPlus },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => { setTab(id); setLoginApiError(''); setRegApiError('') }}
                className={[
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  tab === id
                    ? 'bg-brand-primary text-white shadow-glow-primary'
                    : 'text-text-muted hover:text-text-primary',
                ].join(' ')}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </motion.div>

          {/* Card */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-bg-border bg-bg-surface/60 p-8 shadow-card backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">

              {/* ── LOGIN FORM ──────────────────────────────────────────────── */}
              {tab === 'login' && (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  noValidate
                  className="space-y-5"
                >
                  <Field label="Username" error={loginErrors.username}>
                    <Input
                      icon={User}
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                      onBlur={() => {
                        const e = validateLogin(loginForm)
                        setLoginErrors(p => ({ ...p, username: e.username }))
                      }}
                      error={loginErrors.username}
                      disabled={loginLoading}
                      autoComplete="username"
                    />
                  </Field>

                  <Field label="Password" error={loginErrors.password}>
                    <Input
                      icon={Lock}
                      type={showLoginPw ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                      onBlur={() => {
                        const e = validateLogin(loginForm)
                        setLoginErrors(p => ({ ...p, password: e.password }))
                      }}
                      error={loginErrors.password}
                      disabled={loginLoading}
                      autoComplete="current-password"
                      right={
                        <button
                          type="button"
                          onClick={() => setShowLoginPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                          tabIndex={-1}
                        >
                          {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                  </Field>

                  {loginApiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    >
                      <AlertCircle size={15} />
                      {loginApiError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <><LogIn size={15} /> Sign In</>}
                  </button>

                  <p className="text-center text-sm text-text-muted">
                    Not registered yet?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                    >
                      Register yourself here
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── REGISTER FORM ───────────────────────────────────────────── */}
              {tab === 'register' && !regSuccess && (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  noValidate
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Field label="Full Name" error={regErrors.full_name}>
                        <Input
                          icon={User}
                          type="text"
                          placeholder="Your full name"
                          value={regForm.full_name}
                          onChange={e => setRegForm(p => ({ ...p, full_name: e.target.value }))}
                          onBlur={() => {
                            const e = validateRegister(regForm)
                            setRegErrors(p => ({ ...p, full_name: e.full_name }))
                          }}
                          error={regErrors.full_name}
                          disabled={regLoading}
                          autoComplete="name"
                        />
                      </Field>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Field label="Username" error={regErrors.username}>
                        <Input
                          icon={User}
                          type="text"
                          placeholder="e.g. john_doe"
                          value={regForm.username}
                          onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))}
                          onBlur={() => {
                            const e = validateRegister(regForm)
                            setRegErrors(p => ({ ...p, username: e.username }))
                          }}
                          error={regErrors.username}
                          disabled={regLoading}
                          autoComplete="username"
                        />
                      </Field>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <Field label="Phone (optional)" error={regErrors.phone}>
                        <Input
                          icon={Phone}
                          type="tel"
                          placeholder="+91 9876543210"
                          value={regForm.phone}
                          onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
                          onBlur={() => {
                            const e = validateRegister(regForm)
                            setRegErrors(p => ({ ...p, phone: e.phone }))
                          }}
                          error={regErrors.phone}
                          disabled={regLoading}
                          autoComplete="tel"
                        />
                      </Field>
                    </div>

                    <div className="col-span-2">
                      <Field label="Email" error={regErrors.email}>
                        <Input
                          icon={Mail}
                          type="email"
                          placeholder="you@example.com"
                          value={regForm.email}
                          onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                          onBlur={() => {
                            const e = validateRegister(regForm)
                            setRegErrors(p => ({ ...p, email: e.email }))
                          }}
                          error={regErrors.email}
                          disabled={regLoading}
                          autoComplete="email"
                        />
                      </Field>
                    </div>

                    <div className="col-span-2">
                      <Field label="Password" error={regErrors.password}>
                        <Input
                          icon={Lock}
                          type={showRegPw ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          value={regForm.password}
                          onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                          onBlur={() => {
                            const e = validateRegister(regForm)
                            setRegErrors(p => ({ ...p, password: e.password }))
                          }}
                          error={regErrors.password}
                          disabled={regLoading}
                          autoComplete="new-password"
                          right={
                            <button
                              type="button"
                              onClick={() => setShowRegPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                              tabIndex={-1}
                            >
                              {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          }
                        />
                        {/* Strength bar */}
                        {regForm.password && (
                          <div className="mt-2 space-y-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div
                                  key={i}
                                  className="h-1 flex-1 rounded-full transition-all duration-300"
                                  style={{
                                    background: i <= strength ? STRENGTH_COLORS[strength] : 'var(--bg-border)',
                                  }}
                                />
                              ))}
                            </div>
                            <p className="text-xs" style={{ color: STRENGTH_COLORS[strength] }}>
                              {STRENGTH_LABELS[strength]}
                            </p>
                          </div>
                        )}
                      </Field>
                    </div>

                    <div className="col-span-2">
                      <Field label="Confirm Password" error={regErrors.confirm_password}>
                        <Input
                          icon={Lock}
                          type={showConfirmPw ? 'text' : 'password'}
                          placeholder="Repeat your password"
                          value={regForm.confirm_password}
                          onChange={e => setRegForm(p => ({ ...p, confirm_password: e.target.value }))}
                          onBlur={() => {
                            const e = validateRegister(regForm)
                            setRegErrors(p => ({ ...p, confirm_password: e.confirm_password }))
                          }}
                          error={regErrors.confirm_password}
                          disabled={regLoading}
                          autoComplete="new-password"
                          right={
                            <button
                              type="button"
                              onClick={() => setShowConfirmPw(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                              tabIndex={-1}
                            >
                              {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          }
                        />
                      </Field>
                    </div>
                  </div>

                  {regApiError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    >
                      <AlertCircle size={15} />
                      {regApiError}
                    </motion.div>
                  )}

                  <p className="text-xs text-text-muted leading-relaxed">
                    By registering you agree to the terms of the student learning portal. Your account role will be <span className="text-brand-primary font-medium">Student</span>.
                  </p>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {regLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
                      : <><UserPlus size={15} /> Create Account</>
                    }
                  </button>

                  <p className="text-center text-sm text-text-muted">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                    >
                      Sign in here
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── REGISTER SUCCESS ─────────────────────────────────────────── */}
              {tab === 'register' && regSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4 py-6 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 border border-green-500/30">
                    <CheckCircle2 size={32} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                      Account Created!
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Welcome, <span className="text-brand-primary font-medium">{regForm.full_name}</span>!
                      Your student account is ready.
                    </p>
                  </div>
                  <button
                    onClick={() => { setTab('login'); setRegSuccess(false) }}
                    className="mt-2 flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all"
                  >
                    <LogIn size={15} />
                    Sign In Now
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
