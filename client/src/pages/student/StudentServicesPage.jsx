import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, CheckCircle2, ArrowRight, Loader2, Send,
  MessageSquare, Clock, ChevronRight, X, Bell, Badge,
  LayoutList, ListChecks,
} from 'lucide-react'
import { servicesAPI, bookingsAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    replied:  'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
    closed:   'bg-bg-elevated text-text-muted border-bg-border',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${map[status] ?? map.pending}`}>
      {status}
    </span>
  )
}

// ─── Thread View ──────────────────────────────────────────────────────────────
function ThreadView({ booking, onBack, onReply }) {
  const { user } = useAuth()
  const [msg, setMsg]     = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    setSending(true)
    await onReply(booking.id, msg.trim())
    setMsg('')
    setSending(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
          <ArrowRight size={15} className="rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm">{booking.service_title || 'Service Request'}</h2>
          <p className="text-xs text-text-muted">Booking #{booking.id}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Messages */}
      <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Initial message */}
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            {(user?.full_name?.[0] || user?.username?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted mb-1">{user?.full_name || user?.username} · {new Date(booking.created_at).toLocaleDateString()}</p>
            <div className="rounded-xl rounded-tl-sm bg-bg-elevated border border-bg-border px-3 py-2 text-sm text-text-primary">
              {booking.message}
            </div>
          </div>
        </div>

        {/* Replies */}
        {booking.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              reply.is_admin
                ? 'bg-brand-amber/20 border border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : (user?.full_name?.[0] || 'S').toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 ${reply.is_admin ? 'items-end flex flex-col' : ''}`}>
              <p className="text-xs text-text-muted mb-1">
                {reply.is_admin ? 'Aman (Admin)' : reply.sender_name} · {new Date(reply.created_at).toLocaleDateString()}
                {reply.is_admin && !reply.read_by_student && (
                  <span className="ml-2 text-brand-primary font-semibold">• New</span>
                )}
              </p>
              <div className={`rounded-xl px-3 py-2 text-sm border max-w-xs ${
                reply.is_admin
                  ? 'bg-brand-amber/8 border-brand-amber/20 text-text-primary rounded-tr-sm'
                  : 'bg-bg-elevated border-bg-border text-text-primary rounded-tl-sm'
              }`}>
                {reply.message}
              </div>
            </div>
          </div>
        ))}

        {booking.replies?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">Waiting for a reply from Aman…</p>
        )}
      </div>

      {/* Reply form */}
      {booking.status !== 'closed' && (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Type your reply…"
            className="flex-1 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button type="submit" disabled={sending || !msg.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white disabled:opacity-40 hover:bg-brand-dark transition-colors">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      )}
    </motion.div>
  )
}

// ─── Service Detail Card ──────────────────────────────────────────────────────
function ServiceCard({ svc, onRequest }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="rounded-xl border border-bg-border bg-bg-surface transition-all duration-200 hover:border-brand-primary/30 hover:shadow-card"
    >
      {/* Header */}
      <button className="w-full text-left p-5" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{svc.icon || '🎯'}</span>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">{svc.title}</h3>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{svc.description}</p>
            </div>
          </div>
          <ChevronRight size={16} className={`text-text-muted shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-bg-border pt-4">
              {/* Description */}
              <p className="text-sm text-text-secondary">{svc.description}</p>

              {/* Features */}
              {svc.features?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">What's included</p>
                  <ul className="space-y-1.5">
                    {svc.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle2 size={14} className="text-brand-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tiers */}
              {svc.tiers?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Tiers</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {svc.tiers.map((tier, i) => (
                      <div key={i} className="rounded-lg border border-bg-border bg-bg-elevated p-3">
                        <p className="text-sm font-semibold text-text-primary">{tier.name}</p>
                        {tier.price && <p className="text-brand-amber text-sm font-bold mt-0.5">{tier.price}</p>}
                        {tier.description && <p className="text-xs text-text-muted mt-1">{tier.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => onRequest(svc)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white py-2.5 text-sm font-semibold hover:bg-brand-dark transition-colors shadow-glow-primary"
              >
                <MessageSquare size={14} /> Request This Service
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentServicesPage() {
  const [services, setServices]   = useState([])
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('services') // services | mybookings
  const [requestSvc, setRequestSvc] = useState(null)     // service to request
  const [requestMsg, setRequestMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeThread, setActiveThread] = useState(null)  // booking id

  const totalUnread = bookings.reduce((sum, b) => sum + (b.unread_count || 0), 0)

  useEffect(() => {
    Promise.all([servicesAPI.getAll(), bookingsAPI.getAll()])
      .then(([sRes, bRes]) => {
        setServices(sRes.data)
        setBookings(bRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const refreshBookings = () =>
    bookingsAPI.getAll().then(({ data }) => setBookings(data)).catch(() => {})

  const handleRequest = async (e) => {
    e.preventDefault()
    if (!requestSvc || !requestMsg.trim()) return
    setSubmitting(true)
    try {
      await bookingsAPI.create({ service: requestSvc.id, message: requestMsg.trim() })
      setRequestSvc(null)
      setRequestMsg('')
      refreshBookings()
      setTab('mybookings')
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (bookingId, message) => {
    await bookingsAPI.reply(bookingId, { message })
    refreshBookings()
    // update active thread inline
    const { data } = await bookingsAPI.getById(bookingId)
    setActiveThread(data)
  }

  const openThread = async (booking) => {
    bookingsAPI.markRead(booking.id).catch(() => {})
    const { data } = await bookingsAPI.getById(booking.id)
    setActiveThread(data)
    refreshBookings()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-text-muted">
      <Loader2 size={24} className="animate-spin" />
    </div>
  )

  // Thread open
  if (activeThread) return (
    <ThreadView
      booking={activeThread}
      onBack={() => setActiveThread(null)}
      onReply={handleReply}
    />
  )

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header + tabs */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Services</h1>
          <p className="text-text-secondary text-sm mt-1">Explore and request 1:1 sessions with Aman</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated">
          <button
            onClick={() => setTab('services')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'services' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <LayoutList size={14} /> Services
          </button>
          <button
            onClick={() => setTab('mybookings')}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'mybookings' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <ListChecks size={14} /> My Bookings
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Services tab */}
      {tab === 'services' && (
        <motion.div variants={fadeUp} className="space-y-3">
          {services.length === 0 ? (
            <div className="text-center py-14 text-text-muted">
              <Briefcase size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No services listed yet</p>
            </div>
          ) : (
            services.map(svc => (
              <ServiceCard key={svc.id} svc={svc} onRequest={setRequestSvc} />
            ))
          )}
        </motion.div>
      )}

      {/* My bookings tab */}
      {tab === 'mybookings' && (
        <motion.div variants={fadeUp} className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-14 text-text-muted">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No bookings yet. Request a service to get started.</p>
            </div>
          ) : (
            bookings.map(b => (
              <button
                key={b.id}
                onClick={() => openThread(b)}
                className="w-full text-left rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/30 hover:shadow-card transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">{b.service_title || 'Service Request'}</p>
                      {b.unread_count > 0 && (
                        <span className="h-5 px-1.5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center">
                          {b.unread_count} new
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted line-clamp-1">{b.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock size={10} /> {new Date(b.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-text-muted">
                        {b.replies?.length || 0} message{b.replies?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
              </button>
            ))
          )}
        </motion.div>
      )}

      {/* Request Modal */}
      <AnimatePresence>
        {requestSvc && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setRequestSvc(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl border border-bg-border bg-bg-surface p-6 shadow-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-bold text-text-primary">Request Service</h2>
                    <p className="text-sm text-brand-primary mt-0.5">{requestSvc.title}</p>
                  </div>
                  <button onClick={() => setRequestSvc(null)} className="h-7 w-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Describe your need / preferred time
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={requestMsg}
                      onChange={e => setRequestMsg(e.target.value)}
                      placeholder="E.g. I want help with building my AI project. Available weekday evenings (IST)…"
                      className="w-full rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setRequestSvc(null)}
                      className="flex-1 rounded-xl border border-bg-border py-2.5 text-sm text-text-secondary hover:text-text-primary transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting || !requestMsg.trim()}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary text-white py-2.5 text-sm font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors">
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Send Request
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
