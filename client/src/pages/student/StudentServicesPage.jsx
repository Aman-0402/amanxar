import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Clock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { servicesAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function StudentServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm]         = useState({ name: '', email: '', message: '' })
  const [sending, setSending]   = useState(false)

  useEffect(() => {
    servicesAPI.getAll()
      .then(({ data }) => setServices(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selected) return
    setSending(true)
    // Simulate booking — replace with real API when backend ready
    await new Promise(r => setTimeout(r, 1000))
    setSending(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Booking Requested!</h2>
        <p className="text-text-secondary max-w-sm">
          Your service booking request has been sent. Aman will get back to you shortly.
        </p>
        <button
          onClick={() => { setSubmitted(false); setSelected(null); setForm({ name: '', email: '', message: '' }) }}
          className="mt-2 rounded-lg border border-bg-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Book Another
        </button>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">Services</h1>
        <p className="text-text-secondary text-sm mt-1">Select a service and schedule a session with Aman</p>
      </motion.div>

      {/* Services grid */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3">Choose a Service</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border border-bg-border bg-bg-surface animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <Briefcase size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No services listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(svc => (
              <button
                key={svc.id}
                onClick={() => setSelected(svc)}
                className={`text-left rounded-xl border p-5 transition-all duration-200 ${
                  selected?.id === svc.id
                    ? 'border-brand-primary bg-brand-primary/10 shadow-glow-primary'
                    : 'border-bg-border bg-bg-surface hover:border-brand-primary/40 hover:bg-bg-elevated'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-text-primary text-sm">{svc.title || svc.name}</h3>
                  {selected?.id === svc.id && <CheckCircle2 size={16} className="text-brand-primary shrink-0" />}
                </div>
                {svc.description && <p className="text-xs text-text-muted line-clamp-2">{svc.description}</p>}
                {svc.duration && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                    <Clock size={11} /> {svc.duration}
                  </div>
                )}
                {svc.price && (
                  <p className="text-brand-amber text-sm font-semibold mt-2">{svc.price}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Booking form */}
      {selected && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleBook}
          className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-4 max-w-lg"
        >
          <h2 className="font-semibold text-text-primary">
            Booking: <span className="text-brand-primary">{selected.title || selected.name}</span>
          </h2>
          <div className="space-y-1">
            <label className="text-label">Your Name</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
              className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-label">Email</label>
            <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-label">Message / Preferred time</label>
            <textarea required rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Describe your need and suggest a time…"
              className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none" />
          </div>
          <button type="submit" disabled={sending}
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {sending ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><ArrowRight size={14} /> Send Booking Request</>}
          </button>
        </motion.form>
      )}
    </motion.div>
  )
}
