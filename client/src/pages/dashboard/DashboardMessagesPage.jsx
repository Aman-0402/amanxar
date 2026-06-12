import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Mail, Trash2, Eye, EyeOff, MessageSquare, Send, Loader2,
  ArrowRight, CheckCircle, XCircle, Clock, ChevronRight,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { messagesAPI, supportAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

// ─── Status helpers ───────────────────────────────────────────────────────────
const TICKET_STATUS_MAP = {
  open:    'bg-green-500/15 text-green-400 border-green-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

const CATEGORY_LABELS = {
  general:   'General Question',
  content:   'Content Request',
  technical: 'Technical Issue',
  premium:   'Premium Inquiry',
  feedback:  'Feedback / Suggestion',
  other:     'Other',
}

function TicketStatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${TICKET_STATUS_MAP[status] ?? TICKET_STATUS_MAP.open}`}>
      {status}
    </span>
  )
}

// ─── Support Thread (admin view) ──────────────────────────────────────────────
function SupportThread({ ticket, onBack, onReply, onStatusChange }) {
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
          <p className="text-xs text-text-muted">
            From: <span className="text-text-secondary">{ticket.user_name}</span>
            {ticket.user_email && ` · ${ticket.user_email}`}
            {' · '}{CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          {ticket.status !== 'closed' && (
            <button onClick={() => onStatusChange(ticket.id, 'closed')} title="Close ticket"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
              <XCircle size={14} />
            </button>
          )}
          {ticket.status === 'closed' && (
            <button onClick={() => onStatusChange(ticket.id, 'open')} title="Reopen"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-green-400 hover:border-green-400/30 transition-colors">
              <CheckCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Thread body */}
      <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Original message bubble */}
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            {(ticket.user_name?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted mb-1">{ticket.user_name} · {new Date(ticket.created_at).toLocaleDateString()}</p>
            <div className="rounded-xl rounded-tl-sm bg-bg-elevated border border-bg-border px-3 py-2 text-sm text-text-primary">
              {ticket.message}
            </div>
          </div>
        </div>

        {ticket.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              reply.is_admin
                ? 'bg-brand-amber/20 border border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : (ticket.user_name?.[0] || 'S').toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 ${reply.is_admin ? 'items-end flex flex-col' : ''}`}>
              <p className="text-xs text-text-muted mb-1">
                {reply.is_admin ? 'You (Admin)' : reply.sender_name} · {new Date(reply.created_at).toLocaleDateString()}
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

        {ticket.replies?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">No replies yet. Be the first to respond.</p>
        )}
      </div>

      {/* Reply input */}
      {ticket.status !== 'closed' && (
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Reply to student…"
            className="flex-1 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button type="submit" disabled={sending || !msg.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white disabled:opacity-40 hover:bg-brand-dark transition-colors">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      )}
      {ticket.status === 'closed' && (
        <p className="text-xs text-text-muted text-center py-2">This ticket is closed. Reopen to reply.</p>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardMessagesPage() {
  const [tab, setTab]               = useState('messages')
  const [messages, setMessages]     = useState([])
  const [tickets, setTickets]       = useState([])
  const [ticketFilter, setTicketFilter] = useState('all')
  const [loading, setLoading]       = useState(true)
  const [activeThread, setActiveThread] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget]       = useState(null)

  useEffect(() => {
    Promise.all([messagesAPI.getAll(), supportAPI.getAll()])
      .then(([mRes, tRes]) => {
        setMessages(mRes.data)
        setTickets(tRes.data)
        const unread = tRes.data.filter(t => t.unread_count > 0).length
        if (unread > 0) {
          Swal.fire({
            toast: true, position: 'top-end', icon: 'info',
            title: `${unread} unread support message${unread > 1 ? 's' : ''}`,
            timer: 4000, showConfirmButton: false, timerProgressBar: true,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchTickets  = () => supportAPI.getAll().then(({ data }) => setTickets(data))
  const fetchMessages = () => messagesAPI.getAll().then(({ data }) => setMessages(data))

  const openThread = async (ticket) => {
    const { data } = await supportAPI.getById(ticket.id)
    setActiveThread(data)
    await supportAPI.markRead(ticket.id)
    fetchTickets()
  }

  const handleReply = async (ticketId, message) => {
    await supportAPI.reply(ticketId, { message })
    const { data } = await supportAPI.getById(ticketId)
    setActiveThread(data)
    fetchTickets()
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    await supportAPI.setStatus(ticketId, { status: newStatus })
    const { data } = await supportAPI.getById(ticketId)
    setActiveThread(data)
    fetchTickets()
  }

  const handleMarkAsRead = async (message) => {
    await messagesAPI.markAsRead(message.id, { read: !message.read })
    fetchMessages()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await messagesAPI.delete(deleteTarget.id)
    setDeleteModalOpen(false)
    setDeleteTarget(null)
    fetchMessages()
  }

  const unreadMsgCount    = messages.filter(m => !m.read).length
  const unreadTicketCount = tickets.filter(t => t.unread_count > 0).length
  const filteredTickets   = ticketFilter === 'all' ? tickets : tickets.filter(t => t.status === ticketFilter)

  const filterCounts = {
    all:     tickets.length,
    open:    tickets.filter(t => t.status === 'open').length,
    replied: tickets.filter(t => t.status === 'replied').length,
    closed:  tickets.filter(t => t.status === 'closed').length,
  }

  if (loading) return <div className="p-8 text-text-muted">Loading…</div>

  // Thread view
  if (activeThread && tab === 'support') return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
      <SupportThread
        ticket={activeThread}
        onBack={() => setActiveThread(null)}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
      />
    </div>
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated w-fit">
        <button onClick={() => setTab('messages')}
          className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'messages' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          <Mail size={14} /> Contact
          {unreadMsgCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadMsgCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab('support')}
          className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'support' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          <MessageSquare size={14} /> Support Tickets
          {unreadTicketCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadTicketCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Contact Messages tab ─────────────────────────────────────────────── */}
      {tab === 'messages' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-bg-border bg-bg-surface">
          <div className="p-6 border-b border-bg-border">
            <h2 className="text-xl font-bold text-text-primary">Contact Submissions ({messages.length})</h2>
          </div>
          <div className="divide-y divide-bg-border">
            {messages.length > 0 ? messages.map(message => (
              <div key={message.id}
                className={`p-6 hover:bg-bg-elevated/50 transition-colors ${!message.read ? 'bg-brand-primary/5' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-sm font-semibold ${!message.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {message.name}
                      </h3>
                      <span className="text-xs text-text-muted">{message.email}</span>
                      {!message.read && <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />}
                    </div>
                    <h4 className="font-medium text-text-primary mb-2">{message.subject}</h4>
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{message.message}</p>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {new Date(message.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleMarkAsRead(message)} title={message.read ? 'Mark unread' : 'Mark read'}
                      className="p-2 hover:bg-bg-border rounded transition-colors">
                      {message.read ? <EyeOff size={16} className="text-text-muted" /> : <Eye size={16} className="text-brand-primary" />}
                    </button>
                    <button onClick={() => { setDeleteTarget(message); setDeleteModalOpen(true) }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded bg-bg-elevated">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-text-muted">No messages yet</div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Support Tickets tab ──────────────────────────────────────────────── */}
      {tab === 'support' && (
        <div className="space-y-3">
          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all',     label: 'All' },
              { key: 'open',    label: 'Open' },
              { key: 'replied', label: 'Replied' },
              { key: 'closed',  label: 'Closed' },
            ].map(f => (
              <button key={f.key} onClick={() => setTicketFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  ticketFilter === f.key
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-bg-elevated text-text-secondary border-bg-border hover:border-brand-primary/40 hover:text-text-primary'
                }`}>
                {f.label}
                <span className={`inline-flex h-4 min-w-4 px-0.5 items-center justify-center rounded-full text-[10px] font-bold ${
                  ticketFilter === f.key ? 'bg-white/20 text-white' : 'bg-bg-border text-text-muted'
                }`}>
                  {filterCounts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{ticketFilter === 'all' ? 'No support tickets yet' : `No ${ticketFilter} tickets`}</p>
            </div>
          ) : (
            filteredTickets.map(t => (
              <button key={t.id} onClick={() => openThread(t)}
                className="w-full text-left rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/30 hover:shadow-card transition-all group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">{t.subject}</p>
                      <TicketStatusBadge status={t.status} />
                      {t.unread_count > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-brand-amber text-black text-[10px] font-bold flex items-center justify-center">
                          {t.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      <span className="font-medium">{t.user_name}</span>
                      {t.user_email && ` · ${t.user_email}`}
                      {' · '}<span className="text-text-muted">{CATEGORY_LABELS[t.category] ?? t.category}</span>
                    </p>
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
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
      />
    </div>
  )
}
