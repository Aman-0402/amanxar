import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { usersAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[1-9]\d{9,13}$/

export default function StudentProfilePage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)
  const [apiErr, setApiErr]   = useState('')

  const validate = () => {
    const e = {}
    if (!form.full_name.trim())                          e.full_name = 'Name is required'
    else if (!/^[a-zA-Z\s]{2,50}$/.test(form.full_name)) e.full_name = 'Letters only, 2–50 chars'
    if (!form.email.trim())                              e.email = 'Email is required'
    else if (!EMAIL_RE.test(form.email))                 e.email = 'Invalid email'
    if (form.phone && !PHONE_RE.test(form.phone.replace(/[\s\-()]/g, '')))
                                                         e.phone = 'Invalid phone number'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setApiErr('')
    try {
      await usersAPI.updateProfile({
        full_name: form.full_name.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setApiErr('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.username?.[0] || 'S').toUpperCase()

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-xl">

      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">My Profile</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your personal information</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-bg-border bg-bg-surface p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-2xl font-bold text-brand-primary shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-text-primary text-lg">{form.full_name || user?.username}</p>
          <p className="text-sm text-text-muted">{user?.username}</p>
          <span className="inline-block mt-1 text-xs rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-2 py-0.5 font-medium">
            Student
          </span>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.form variants={fadeUp} onSubmit={handleSave} noValidate className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5">
        <h2 className="font-semibold text-text-primary">Edit Information</h2>

        {[
          { key: 'full_name', label: 'Full Name',    icon: User,  type: 'text',  placeholder: 'Your full name' },
          { key: 'email',     label: 'Email',        icon: Mail,  type: 'email', placeholder: 'you@example.com' },
          { key: 'phone',     label: 'Phone (optional)', icon: Phone, type: 'tel', placeholder: '+91 9876543210' },
        ].map(({ key, label, icon: Icon, type, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-label">{label}</label>
            <div className="relative">
              <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                onBlur={() => {
                  const errs = validate()
                  setErrors(p => ({ ...p, [key]: errs[key] || '' }))
                }}
                placeholder={placeholder}
                className={`w-full rounded-lg border pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all ${
                  errors[key]
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'
                }`}
              />
            </div>
            {errors[key] && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={11} /> {errors[key]}
              </p>
            )}
          </div>
        ))}

        {/* Read-only username */}
        <div className="space-y-1">
          <label className="text-label">Username</label>
          <input
            value={user?.username || ''}
            disabled
            className="w-full rounded-lg border border-bg-border bg-bg-base px-4 py-2.5 text-sm text-text-muted cursor-not-allowed"
          />
          <p className="text-xs text-text-muted">Username cannot be changed</p>
        </div>

        {apiErr && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={15} /> {apiErr}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 size={14} /> Saved!</>
          ) : (
            <><Save size={14} /> Save Changes</>
          )}
        </button>
      </motion.form>
    </motion.div>
  )
}
