import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { supportAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

const CATEGORIES = [
  'General Question',
  'Content Request',
  'Technical Issue',
  'Premium Inquiry',
  'Feedback / Suggestion',
  'Other',
]

const EMPTY = { subject: '', category: CATEGORIES[0], message: '' }
const ERRORS_EMPTY = { subject: '', message: '' }

export default function StudentRequestPage() {
  const { user } = useAuth()
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState(ERRORS_EMPTY)
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.subject.trim())          e.subject = 'Subject is required'
    else if (form.subject.length < 5)  e.subject = 'At least 5 characters'
    if (!form.message.trim())          e.message = 'Message is required'
    else if (form.message.length < 20) e.message = 'At least 20 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setApiErr('')
    try {
      await supportAPI.create({
        subject:  form.subject.trim(),
        category: form.category,
        message:  form.message.trim(),
        user:     user?.user_id || user?.id,
      })
      setSuccess(true)
    } catch {
      setApiErr('Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Request Sent!</h2>
        <p className="text-text-secondary max-w-sm">
          Your request has been received. You'll get a response soon.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm(EMPTY) }}
          className="mt-2 rounded-lg border border-bg-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Send Another
        </button>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-xl">

      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">Support & Requests</h1>
        <p className="text-text-secondary text-sm mt-1">Ask questions, report issues, or request content</p>
      </motion.div>

      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5"
      >
        {/* Category */}
        <div className="space-y-1">
          <label className="text-label">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="text-label">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            onBlur={() => setErrors(p => ({ ...p, subject: validate().subject || '' }))}
            placeholder="Brief summary of your request"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all ${
              errors.subject
                ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'
            }`}
          />
          {errors.subject && (
            <p className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={11} /> {errors.subject}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label className="text-label">Message</label>
          <textarea
            rows={5}
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            onBlur={() => setErrors(p => ({ ...p, message: validate().message || '' }))}
            placeholder="Describe your question or issue in detail…"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all resize-none ${
              errors.message
                ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'
            }`}
          />
          <div className="flex items-center justify-between">
            {errors.message
              ? <p className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={11} /> {errors.message}</p>
              : <span />
            }
            <span className="text-xs text-text-muted">{form.message.length} chars</span>
          </div>
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
          {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Request</>}
        </button>
      </motion.form>
    </motion.div>
  )
}
