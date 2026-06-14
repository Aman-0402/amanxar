import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Trash2, Eye, EyeOff, MessageSquare, Send, Loader2,
  ArrowLeft, CheckCircle, XCircle, Clock, ChevronRight,
  Search, CheckCheck, ExternalLink,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { messagesAPI, supportAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relTime(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TICKET_STATUS_COLOR = {
  open:    'bg-green-500/15 text-green-400 border-green-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

const CATEGORY_LABELS = {
  general:   'General',
  content:   'Content',
  technical: 'Technical',
  premium:   'Premium',
  feedback:  'Feedback',
  other:     'Other',
}

function TicketBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${TICKET_STATUS_COLOR[status] ?? TICKET_STATUS_COLOR.open}`}>
      {status}
    </span>
  )
}

// ─── Contact Message Detail Panel ─────────────────────────────────────────────
function MessageDetail({ message, onMarkRead, onDelete, onBack }) {
  if (!message) return (
    <div className="flex-1 flex items-center justify-center text-text-muted">
      <div className="text-center">
        <Mail size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Select a message to read</p>
      </div>
    </div>
  )

  return (
    <motion.div key={message.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col min-h-0">
      {/* Detail header */}
      <div className="p-5 border-b border-bg-border space-y-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-text-primary truncate">{message.subject || '(No subject)'}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              <span className="font-medium text-text-secondary">{message.name}</span>
              {' · '}{message.email}
              {' · '}{relTime(message.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onMarkRead(message)} title={message.read ? 'Mark unread' : 'Mark read'}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-colors">
              {message.read ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button onClick={() => onDelete(message)}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Message body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="rounded-xl border border-bg-border bg-bg-elevated/40 p-4">
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{message.message}</p>
        </div>
      </div>

      {/* Reply via Email */}
      <div className="p-5 border-t border-bg-border">
        <a
          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || '')}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-brand-primary bg-brand-primary/10 px-5 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200"
        >
          <ExternalLink size={14} /> Reply via Email
        </a>
      </div>
    </motion.div>
  )
}

// ─── Support Thread Panel ─────────────────────────────────────────────────────
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

  if (!ticket) return (
    <div className="flex-1 flex items-center justify-center text-text-muted">
      <div className="text-center">
        <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Select a ticket to view thread</p>
      </div>
    </div>
  )

  return (
    <motion.div key={ticket.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col min-h-0">
      {/* Thread header */}
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-text-primary text-sm truncate">{ticket.subject}</h2>
              <TicketBadge status={ticket.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              <span className="font-medium text-text-secondary">{ticket.user_name}</span>
              {ticket.user_email && ` · ${ticket.user_email}`}
              {' · '}{CATEGORY_LABELS[ticket.category] ?? ticket.category}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {ticket.status !== 'closed' ? (
              <button onClick={() => onStatusChange(ticket.id, 'closed')} title="Close ticket"
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
                <XCircle size={14} />
              </button>
            ) : (
              <button onClick={() => onStatusChange(ticket.id, 'open')} title="Reopen ticket"
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-green-400 hover:border-green-400/30 transition-colors">
                <CheckCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Original */}
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            {(ticket.user_name?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted mb-1">{ticket.user_name} · {relTime(ticket.created_at)}</p>
            <div className="rounded-xl rounded-tl-sm bg-bg-elevated border border-bg-border px-3 py-2.5 text-sm text-text-primary">
              {ticket.message}
            </div>
          </div>
        </div>

        {/* Replies */}
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
                {reply.is_admin ? 'You (Admin)' : reply.sender_name} · {relTime(reply.created_at)}
              </p>
              <div className={`rounded-xl px-3 py-2.5 text-sm border max-w-xs ${
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
          <p className="text-xs text-text-muted text-center py-6">No replies yet.</p>
        )}
      </div>

      {/* Reply input */}
      {ticket.status !== 'closed' ? (
        <form onSubmit={handleSend} className="p-4 border-t border-bg-border flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Reply to student…"
            className="flex-1 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          <button type="submit" disabled={sending || !msg.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-primary text-white disabled:opacity-40 hover:bg-brand-dark transition-colors shrink-0">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      ) : (
        <div className="p-4 border-t border-bg-border text-xs text-text-muted text-center">
          Ticket closed — <button onClick={() => onStatusChange(ticket.id, 'open')} className="text-brand-primary hover:underline">Reopen</button> to reply.
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardMessagesPage() {
  const [tab, setTab]                     = useState('messages')
  const [messages, setMessages]           = useState([])
  const [tickets, setTickets]             = useState([])
  const [ticketFilter, setTicketFilter]   = useState('all')
  const [msgSearch, setMsgSearch]         = useState('')
  const [ticketSearch, setTicketSearch]   = useState('')
  const [loading, setLoading]             = useState(true)
  const [selectedMsg, setSelectedMsg]     = useState(null)
  const [activeThread, setActiveThread]   = useState(null)
  const [showDetail, setShowDetail]       = useState(false) // mobile: show right panel
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget]       = useState(null)
  const [markingAll, setMarkingAll]           = useState(false)

  useEffect(() => {
    Promise.allSettled([messagesAPI.getAll(), supportAPI.getAll()])
      .then(([mRes, tRes]) => {
        const mData = mRes.status === 'fulfilled' ? mRes.value.data : []
        const tData = tRes.status === 'fulfilled' ? tRes.value.data : []
        setMessages(mData)
        setTickets(tData)
        const unread = tData.filter(t => t.unread_count > 0).length
        if (unread > 0) {
          Swal.fire({
            toast: true, position: 'top-end', icon: 'info',
            title: `${unread} unread support ticket${unread > 1 ? 's' : ''}`,
            timer: 4000, showConfirmButton: false, timerProgressBar: true,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const fetchMessages = () => messagesAPI.getAll().then(({ data }) => setMessages(data))
  const fetchTickets  = () => supportAPI.getAll().then(({ data }) => setTickets(data))

  // Filtered lists
  const filteredMessages = useMemo(() => {
    const term = msgSearch.toLowerCase()
    return messages.filter(m =>
      !term ||
      m.name?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.subject?.toLowerCase().includes(term)
    )
  }, [messages, msgSearch])

  const filteredTickets = useMemo(() => {
    const term = ticketSearch.toLowerCase()
    return tickets.filter(t => {
      const matchFilter = ticketFilter === 'all' || t.status === ticketFilter
      const matchSearch = !term ||
        t.subject?.toLowerCase().includes(term) ||
        t.user_name?.toLowerCase().includes(term) ||
        t.user_email?.toLowerCase().includes(term)
      return matchFilter && matchSearch
    })
  }, [tickets, ticketFilter, ticketSearch])

  const filterCounts = {
    all:     tickets.length,
    open:    tickets.filter(t => t.status === 'open').length,
    replied: tickets.filter(t => t.status === 'replied').length,
    closed:  tickets.filter(t => t.status === 'closed').length,
  }

  const unreadMsgCount    = messages.filter(m => !m.read).length
  const unreadTicketCount = tickets.filter(t => t.unread_count > 0).length

  // Message actions
  const selectMessage = async (msg) => {
    setSelectedMsg(msg)
    setShowDetail(true)
    if (!msg.read) {
      await messagesAPI.markAsRead(msg.id, { read: true })
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
      setSelectedMsg(prev => prev ? { ...prev, read: true } : prev)
    }
  }

  const handleToggleRead = async (msg) => {
    const updated = { ...msg, read: !msg.read }
    await messagesAPI.markAsRead(msg.id, { read: !msg.read })
    setMessages(prev => prev.map(m => m.id === msg.id ? updated : m))
    if (selectedMsg?.id === msg.id) setSelectedMsg(updated)
  }

  const handleMarkAllRead = async () => {
    const unread = messages.filter(m => !m.read)
    if (!unread.length) return
    setMarkingAll(true)
    await Promise.allSettled(unread.map(m => messagesAPI.markAsRead(m.id, { read: true })))
    await fetchMessages()
    setMarkingAll(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await messagesAPI.delete(deleteTarget.id)
    setMessages(prev => prev.filter(m => m.id !== deleteTarget.id))
    if (selectedMsg?.id === deleteTarget.id) { setSelectedMsg(null); setShowDetail(false) }
    setDeleteModalOpen(false)
    setDeleteTarget(null)
  }

  // Ticket actions
  const openThread = async (ticket) => {
    const { data } = await supportAPI.getById(ticket.id)
    setActiveThread(data)
    setShowDetail(true)
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

  const handleBack = () => { setShowDetail(false) }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin text-brand-primary" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold text-text-primary">Messages</h1>
        <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated">
          <button onClick={() => { setTab('messages'); setShowDetail(false) }}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'messages' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            <Mail size={14} /> Contact
            {unreadMsgCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadMsgCount}
              </span>
            )}
          </button>
          <button onClick={() => { setTab('support'); setShowDetail(false) }}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'support' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            <MessageSquare size={14} /> Support
            {unreadTicketCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadTicketCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Split Pane */}
      <div className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden flex" style={{ minHeight: '600px' }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
        <div className={`w-full lg:w-80 xl:w-96 shrink-0 border-r border-bg-border flex flex-col ${showDetail ? 'hidden lg:flex' : 'flex'}`}>

          {tab === 'messages' && (
            <>
              {/* Search + Mark all */}
              <div className="p-3 border-b border-bg-border space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search messages…"
                    value={msgSearch}
                    onChange={e => setMsgSearch(e.target.value)}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
                  />
                </div>
                {unreadMsgCount > 0 && (
                  <button onClick={handleMarkAllRead} disabled={markingAll}
                    className="flex items-center gap-1.5 w-full justify-center rounded-lg border border-bg-border bg-bg-elevated/50 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-brand-primary/30 transition-all disabled:opacity-50">
                    {markingAll ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={11} />}
                    Mark all as read ({unreadMsgCount})
                  </button>
                )}
              </div>

              {/* Message list */}
              <div className="flex-1 overflow-y-auto divide-y divide-bg-border">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    <Mail size={28} className="mb-2 opacity-30" />
                    <p className="text-xs">{msgSearch ? 'No results' : 'No messages yet'}</p>
                  </div>
                ) : filteredMessages.map(m => (
                  <button key={m.id} onClick={() => selectMessage(m)}
                    className={`w-full text-left p-3 hover:bg-bg-elevated/60 transition-colors ${selectedMsg?.id === m.id ? 'bg-brand-primary/8 border-l-2 border-brand-primary' : ''} ${!m.read ? 'bg-brand-primary/5' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {!m.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shrink-0" />}
                          <p className={`text-xs font-semibold truncate ${!m.read ? 'text-text-primary' : 'text-text-secondary'}`}>{m.name}</p>
                        </div>
                        <p className="text-xs text-text-secondary truncate">{m.subject || '(No subject)'}</p>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">{m.message}</p>
                      </div>
                      <span className="text-[10px] text-text-muted shrink-0">{relTime(m.created_at)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'support' && (
            <>
              {/* Filter pills + search */}
              <div className="p-3 border-b border-bg-border space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search tickets…"
                    value={ticketSearch}
                    onChange={e => setTicketSearch(e.target.value)}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {['all', 'open', 'replied', 'closed'].map(f => (
                    <button key={f} onClick={() => setTicketFilter(f)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all capitalize ${
                        ticketFilter === f
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-bg-elevated text-text-muted border-bg-border hover:border-brand-primary/40'
                      }`}>
                      {f} <span className="opacity-70">({filterCounts[f]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket list */}
              <div className="flex-1 overflow-y-auto divide-y divide-bg-border">
                {filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    <MessageSquare size={28} className="mb-2 opacity-30" />
                    <p className="text-xs">{ticketSearch || ticketFilter !== 'all' ? 'No results' : 'No tickets yet'}</p>
                  </div>
                ) : filteredTickets.map(t => (
                  <button key={t.id} onClick={() => openThread(t)}
                    className={`w-full text-left p-3 hover:bg-bg-elevated/60 transition-colors ${activeThread?.id === t.id ? 'bg-brand-primary/8 border-l-2 border-brand-primary' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {t.unread_count > 0 && (
                            <span className="h-4 min-w-4 px-0.5 rounded-full bg-brand-amber text-black text-[9px] font-bold flex items-center justify-center shrink-0">
                              {t.unread_count}
                            </span>
                          )}
                          <p className="text-xs font-semibold text-text-primary truncate">{t.subject}</p>
                        </div>
                        <p className="text-[11px] text-text-muted truncate">{t.user_name}{t.user_email ? ` · ${t.user_email}` : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <TicketBadge status={t.status} />
                          <span className="text-[10px] text-text-muted">{relTime(t.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-text-muted shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-w-0 ${showDetail ? 'flex' : 'hidden lg:flex'}`}>
          <AnimatePresence mode="wait">
            {tab === 'messages' ? (
              <MessageDetail
                key={selectedMsg?.id ?? 'empty-msg'}
                message={selectedMsg}
                onMarkRead={handleToggleRead}
                onDelete={(msg) => { setDeleteTarget(msg); setDeleteModalOpen(true) }}
                onBack={handleBack}
              />
            ) : (
              <SupportThread
                key={activeThread?.id ?? 'empty-thread'}
                ticket={activeThread}
                onBack={handleBack}
                onReply={handleReply}
                onStatusChange={handleStatusChange}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

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
