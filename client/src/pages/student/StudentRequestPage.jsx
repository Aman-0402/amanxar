import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Send, CheckCircle2, Loader2, AlertCircle,
  ArrowRight, Clock, ChevronRight,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { supportAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

const CATEGORIES = [
  { value: 'general',   label: 'General Question' },
  { value: 'content',   label: 'Content Request' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'premium',   label: 'Premium Inquiry' },
  { value: 'feedback',  label: 'Feedback / Suggestion' },
  { value: 'other',     label: 'Other' },
]

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

const TICKET_STATUS_MAP = {
  open:    'bg-green-500/15 text-green-400 border-green-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

function TicketStatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${TICKET_STATUS_MAP[status] ?? TICKET_STATUS_MAP.open}`}>
      {status}
    </span>
  )
}

// ─── Student Support Thread ───────────────────────────────────────────────────
function StudentSupportThread({ ticket, onBack, onReply }) {
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    setSending(true)
    await onReply(ticket.id, msg.trim())
    setMsg('')
    setSending(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
          <ArrowRight size={15} className="rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm">{ticket.subject}</h2>
          <p className="text-xs text-text-muted">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</p>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Thread body */}
      <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Original message — student on right */}
        <div className="flex gap-3 flex-row-reverse">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            Y
          </div>
          <div className="flex-1 min-w-0 items-end flex flex-col">
            <p className="text-xs text-text-muted mb-1">You · {new Date(ticket.created_at).toLocaleDateString()}</p>
            <div className="rounded-xl rounded-tr-sm bg-brand-primary/10 border border-brand-primary/20 px-3 py-2 text-sm text-text-primary max-w-xs">
              {ticket.message}
            </div>
          </div>
        </div>

        {ticket.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${!reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              reply.is_admin
                ? 'bg-brand-amber/20 border border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : 'Y'}
            </div>
            <div className={`flex-1 min-w-0 ${!reply.is_admin ? 'items-end flex flex-col' : ''}`}>
              <p className="text-xs text-text-muted mb-1">
                {reply.is_admin ? 'Admin' : 'You'} · {new Date(reply.created_at).toLocaleDateString()}
              </p>
              <div className={`rounded-xl px-3 py-2 text-sm border max-w-xs ${
                reply.is_admin
                  ? 'bg-bg-elevated border-bg-border text-text-primary rounded-tl-sm'
                  : 'bg-brand-primary/10 border-brand-primary/20 text-text-primary rounded-tr-sm'
              }`}>
                {reply.message}
              </div>
            </div>
          </div>
        ))}

        {ticket.replies?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">Waiting for admin response…</p>
        )}
      </div>

      {/* Reply input */}
      {ticket.status !== 'closed' ? (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Add a reply…"
            className="flex-1 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button type="submit" disabled={sending || !msg.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white disabled:opacity-40 hover:bg-brand-dark transition-colors">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      ) : (
        <p className="text-xs text-text-muted text-center py-2">This ticket is closed.</p>
      )}
    </motion.div>
  )
}

// ─── New Request Form ─────────────────────────────────────────────────────────
const EMPTY = { subject: '', category: CATEGORIES[0].value, message: '' }
const ERRORS_EMPTY = { subject: '', message: '' }

function NewRequestForm({ onSuccess }) {
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
      })
      setSuccess(true)
      onSuccess()
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
        <p className="text-text-secondary max-w-sm">Your request has been received. Check My Tickets for admin replies.</p>
        <button onClick={() => { setSuccess(false); setForm(EMPTY) }}
          className="mt-2 rounded-lg border border-bg-border px-5 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          Send Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-bg-border bg-bg-surface p-6 space-y-5">
      {/* Category */}
      <div className="space-y-1">
        <label className="text-label">Category</label>
        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      {/* Subject */}
      <div className="space-y-1">
        <label className="text-label">Subject</label>
        <input type="text" value={form.subject}
          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          onBlur={() => setErrors(p => ({ ...p, subject: validate().subject || '' }))}
          placeholder="Brief summary of your request"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all ${errors.subject ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'}`}
        />
        {errors.subject && <p className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={11} /> {errors.subject}</p>}
      </div>
      {/* Message */}
      <div className="space-y-1">
        <label className="text-label">Message</label>
        <textarea rows={5} value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          onBlur={() => setErrors(p => ({ ...p, message: validate().message || '' }))}
          placeholder="Describe your question or issue in detail…"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-bg-elevated focus:outline-none focus:ring-2 transition-all resize-none ${errors.message ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-bg-border focus:border-brand-primary focus:ring-brand-primary/20'}`}
        />
        <div className="flex items-center justify-between">
          {errors.message ? <p className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={11} /> {errors.message}</p> : <span />}
          <span className="text-xs text-text-muted">{form.message.length} chars</span>
        </div>
      </div>
      {apiErr && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {apiErr}
        </div>
      )}
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Request</>}
      </button>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentRequestPage() {
  const [tab, setTab]                       = useState('new')
  const [tickets, setTickets]               = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [activeThread, setActiveThread]     = useState(null)
  const notifiedRef = useRef(false)

  const fetchTickets = async () => {
    setTicketsLoading(true)
    try {
      const { data } = await supportAPI.getAll()
      setTickets(data)
      if (!notifiedRef.current) {
        notifiedRef.current = true
        const unread = data.filter(t => t.unread_count > 0).length
        if (unread > 0) {
          Swal.fire({
            toast: true, position: 'top-end', icon: 'success',
            title: `Admin replied to ${unread} of your ticket${unread > 1 ? 's' : ''}`,
            timer: 4000, showConfirmButton: false, timerProgressBar: true,
          })
        }
      }
    } catch {}
    setTicketsLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  const openThread = async (ticket) => {
    const { data } = await supportAPI.getById(ticket.id)
    await supportAPI.markRead(ticket.id)
    setActiveThread(data)
    fetchTickets()
  }

  const handleReply = async (ticketId, message) => {
    await supportAPI.reply(ticketId, { message })
    const { data } = await supportAPI.getById(ticketId)
    setActiveThread(data)
    fetchTickets()
  }

  const unreadCount = tickets.filter(t => t.unread_count > 0).length

  // Thread view
  if (activeThread && tab === 'tickets') {
    return (
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-xl">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-bold text-text-primary">Support & Requests</h1>
          <p className="text-text-secondary text-sm mt-1">Ask questions, report issues, or request content</p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <StudentSupportThread ticket={activeThread} onBack={() => setActiveThread(null)} onReply={handleReply} />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 max-w-xl">
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">Support & Requests</h1>
        <p className="text-text-secondary text-sm mt-1">Ask questions, report issues, or request content</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated w-fit">
        <button onClick={() => setTab('new')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'new' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          New Request
        </button>
        <button onClick={() => setTab('tickets')}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'tickets' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          My Tickets{tickets.length > 0 ? ` (${tickets.length})` : ''}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-amber text-black text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* New Request tab */}
      {tab === 'new' && (
        <motion.div variants={fadeUp}>
          <NewRequestForm onSuccess={() => { fetchTickets(); setTab('tickets') }} />
        </motion.div>
      )}

      {/* My Tickets tab */}
      {tab === 'tickets' && (
        <motion.div variants={fadeUp} className="space-y-3">
          {ticketsLoading ? (
            <div className="text-center py-12 text-text-muted"><Loader2 size={20} className="mx-auto animate-spin" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-bg-border bg-bg-surface">
              <MessageSquare size={36} className="mx-auto mb-3 text-text-muted opacity-30" />
              <p className="text-sm text-text-muted">No tickets yet. Send a request to get started.</p>
            </div>
          ) : (
            tickets.map(t => (
              <button key={t.id} onClick={() => openThread(t)}
                className="w-full text-left rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/30 hover:shadow-card transition-all group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">{t.subject}</p>
                      <TicketStatusBadge status={t.status} />
                      {t.unread_count > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-brand-amber text-black text-[10px] font-bold flex items-center justify-center">
                          {t.unread_count} new
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{CATEGORY_LABELS[t.category] ?? t.category}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(t.created_at).toLocaleDateString()}</span>
                      <span>{(t.replies?.length || 0) + 1} message{(t.replies?.length || 0) !== 0 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
              </button>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
