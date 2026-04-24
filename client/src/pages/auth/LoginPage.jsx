import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import PageLayout from '@components/layout/PageLayout'
import { useAuth } from '@context/AuthContext'
import { fadeUp, modalContent, staggerContainer } from '@animations/variants'
import { viewport } from '@animations/transitions'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, isLoading: authLoading } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <PageLayout
        title="Login"
        description="Admin login"
        withTopPadding={false}
      >
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin" size={40} />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Admin Login"
      description="Portfolio admin login"
      withTopPadding={false}
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-bg-base">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <motion.div variants={fadeUp} className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
              Admin<span className="gradient-text">.login</span>
            </h1>
            <p className="text-sm text-text-secondary">
              Manage your portfolio projects
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            variants={modalContent}
            className="glass rounded-2xl border border-bg-border bg-bg-surface/40 p-8 shadow-card"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <motion.div variants={fadeUp}>
                <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  disabled={isLoading}
                  required
                />
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeUp}>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  variants={fadeUp}
                  className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                variants={fadeUp}
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </motion.button>

              {/* Help Text */}
              <motion.p variants={fadeUp} className="text-center text-xs text-text-muted">
                Use Django superuser credentials to access the dashboard
              </motion.p>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
