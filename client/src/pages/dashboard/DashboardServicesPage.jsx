import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import {
  Plus, Edit2, Trash2, MessageSquare, Send, Loader2,
  Clock, CheckCircle, XCircle, LayoutList, Search,
  ChevronRight, ArrowLeft, Briefcase,
} from 'lucide-react'

function ServiceIcon({ name, size = 20, className = '' }) {
  const Icon = (name && LucideIcons[name]) || LucideIcons.Briefcase
  return <Icon size={size} className={className} />
}
import { servicesAPI, bookingsAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import ServiceFormModal from '@components/dashboard/ServiceFormModal'
import { showSuccess, showError } from '@utils/toast'

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

const STATUS_MAP = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${STATUS_MAP[status] ?? STATUS_MAP.pending}`}>
      {status}
    </span>
  )
}

// ─── Booking Thread Panel ─────────────────────────────────────────────────────
function BookingThread({ booking, onBack, onReply, onStatusChange }) {
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!msg.trim()) return
    setSending(true)
    await onReply(booking.id, msg.trim())
    setMsg('')
    setSending(false)
  }

  if (!booking) return (
    <div className="flex-1 flex items-center justify-center text-text-muted">
      <div className="text-center">
        <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Select a booking to view thread</p>
      </div>
    </div>
  )

  return (
    <motion.div key={booking.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-text-primary text-sm">{booking.service_title || 'Service Request'}</h2>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              <span className="font-medium text-text-secondary">{booking.user_name}</span>
              {booking.user_email && ` · ${booking.user_email}`}
              {' · '}#{booking.id}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {booking.status !== 'closed' ? (
              <button onClick={() => onStatusChange(booking.id, 'closed')} title="Close booking"
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
                <XCircle size={14} />
              </button>
            ) : (
              <button onClick={() => onStatusChange(booking.id, 'pending')} title="Reopen"
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-green-400 hover:border-green-400/30 transition-colors">
                <CheckCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Original message */}
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            {(booking.user_name?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted mb-1">{booking.user_name} · {relTime(booking.created_at)}</p>
            <div className="rounded-xl rounded-tl-sm bg-bg-elevated border border-bg-border px-3 py-2.5 text-sm text-text-primary">
              {booking.message}
            </div>
          </div>
        </div>

        {/* Replies */}
        {booking.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
              reply.is_admin
                ? 'bg-brand-amber/20 border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : (booking.user_name?.[0] || 'S').toUpperCase()}
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

        {!booking.replies?.length && (
          <p className="text-xs text-text-muted text-center py-6">No replies yet.</p>
        )}
      </div>

      {/* Reply input */}
      {booking.status !== 'closed' ? (
        <form onSubmit={handleSend} className="p-4 border-t border-bg-border flex gap-2">
          <input
            value={msg} onChange={e => setMsg(e.target.value)}
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
          Booking closed — <button onClick={() => onStatusChange(booking.id, 'pending')} className="text-brand-primary hover:underline">Reopen</button> to reply.
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardServicesPage() {
  const [services, setServices]         = useState([])
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [tab, setTab]                   = useState('services')
  const [activeThread, setActiveThread] = useState(null)
  const [showDetail, setShowDetail]     = useState(false)
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingFilter, setBookingFilter] = useState('all')

  const [formModalOpen, setFormModalOpen]     = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingService, setEditingService]   = useState(null)
  const [deleteTarget, setDeleteTarget]       = useState(null)

  useEffect(() => {
    Promise.allSettled([servicesAPI.getAll(), bookingsAPI.getAll()])
      .then(([sRes, bRes]) => {
        if (sRes.status === 'fulfilled') setServices(sRes.value.data)
        if (bRes.status === 'fulfilled') setBookings(bRes.value.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const fetchServices = () => servicesAPI.getAll().then(({ data }) => setServices(data))
  const fetchBookings = () => bookingsAPI.getAll().then(({ data }) => setBookings(data))

  // Booking stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const repliedCount = bookings.filter(b => b.status === 'replied').length
  const closedCount  = bookings.filter(b => b.status === 'closed').length

  const filterCounts = { all: bookings.length, pending: pendingCount, replied: repliedCount, closed: closedCount }

  const filteredBookings = useMemo(() => {
    const term = bookingSearch.toLowerCase()
    return bookings.filter(b => {
      const matchFilter = bookingFilter === 'all' || b.status === bookingFilter
      const matchSearch = !term ||
        b.user_name?.toLowerCase().includes(term) ||
        b.user_email?.toLowerCase().includes(term) ||
        b.service_title?.toLowerCase().includes(term)
      return matchFilter && matchSearch
    })
  }, [bookings, bookingSearch, bookingFilter])

  // Service handlers
  const handleSave = async (data) => {
    try {
      editingService
        ? await servicesAPI.update(editingService.id, data)
        : await servicesAPI.create(data)
      setFormModalOpen(false); setEditingService(null); fetchServices()
    } catch (err) { showError(err.response?.data?.detail || 'Failed to save') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await servicesAPI.delete(deleteTarget.id)
      showSuccess('Service deleted')
      setDeleteModalOpen(false); setDeleteTarget(null); fetchServices()
    } catch (err) { showError(err.response?.data?.detail || 'Delete failed') }
  }

  // Booking handlers
  const openThread = async (booking) => {
    const { data } = await bookingsAPI.getById(booking.id)
    setActiveThread(data)
    setShowDetail(true)
    try { await bookingsAPI.markRead(booking.id) } catch {}
    fetchBookings()
  }

  const handleReply = async (bookingId, message) => {
    await bookingsAPI.reply(bookingId, { message })
    const { data } = await bookingsAPI.getById(bookingId)
    setActiveThread(data)
    fetchBookings()
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    await bookingsAPI.setStatus(bookingId, { status: newStatus })
    const { data } = await bookingsAPI.getById(bookingId)
    setActiveThread(data)
    fetchBookings()
  }

  return (
    <div className="space-y-5">

      {/* Header + Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold text-text-primary">Services</h1>
        <div className="flex items-center gap-3">
          {tab === 'services' && (
            <button onClick={() => { setEditingService(null); setFormModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
              <Plus size={15} /> Add Service
            </button>
          )}
          <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated">
            <button onClick={() => { setTab('services'); setShowDetail(false) }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'services' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              <LayoutList size={14} /> Services
              <span className="opacity-70 text-xs">({services.length})</span>
            </button>
            <button onClick={() => { setTab('bookings'); setShowDetail(false) }}
              className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'bookings' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              <MessageSquare size={14} /> Bookings
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── SERVICES TAB ───────────────────────────────────────────────────── */}
      {tab === 'services' && (
        loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-bg-border bg-bg-surface h-48 animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted">
            <Briefcase size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No services yet</p>
            <button onClick={() => setFormModalOpen(true)} className="mt-3 text-xs text-brand-primary hover:underline">Add your first service</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/20 transition-colors flex flex-col">
                <div className="flex items-start gap-2 mb-2">
                  <ServiceIcon name={service.icon} size={20} className="shrink-0 text-brand-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary text-sm">{service.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{service.description}</p>
                  </div>
                </div>
                {service.features?.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {service.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="text-xs text-text-muted flex items-start gap-1.5">
                        <CheckCircle size={10} className="text-green-400 shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                    {service.features.length > 3 && (
                      <li className="text-xs text-text-muted pl-4">+{service.features.length - 3} more</li>
                    )}
                  </ul>
                )}
                {service.tiers?.length > 0 && (
                  <p className="text-xs text-brand-primary font-medium mb-3">
                    {service.tiers.length} tier{service.tiers.length !== 1 ? 's' : ''}: {service.tiers.map(t => t.name).join(', ')}
                  </p>
                )}
                <div className="mt-auto flex gap-1.5 pt-3 border-t border-bg-border">
                  <button onClick={() => { setEditingService(service); setFormModalOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-bg-border text-text-muted hover:text-brand-primary hover:border-brand-primary/30 text-xs transition-colors">
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => { setDeleteTarget(service); setDeleteModalOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 text-xs transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* ── BOOKINGS TAB ───────────────────────────────────────────────────── */}
      {tab === 'bookings' && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Total',   value: bookings.length, color: 'border-bg-border bg-bg-elevated text-text-primary' },
              { label: 'Pending', value: pendingCount,    color: 'border-yellow-500/30 bg-yellow-500/8 text-yellow-400' },
              { label: 'Replied', value: repliedCount,    color: 'border-brand-primary/30 bg-brand-primary/8 text-brand-primary' },
              { label: 'Closed',  value: closedCount,     color: 'border-bg-border bg-bg-elevated text-text-muted' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${s.color}`}>
                <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</span>
                <span className="text-sm font-bold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Split pane */}
          <div className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden flex" style={{ minHeight: '560px' }}>

            {/* Left — booking list */}
            <div className={`w-full lg:w-80 xl:w-96 shrink-0 border-r border-bg-border flex flex-col ${showDetail ? 'hidden lg:flex' : 'flex'}`}>
              {/* Search + filter */}
              <div className="p-3 border-b border-bg-border space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" placeholder="Search bookings…" value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {['all', 'pending', 'replied', 'closed'].map(f => (
                    <button key={f} onClick={() => setBookingFilter(f)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all capitalize ${
                        bookingFilter === f
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-bg-elevated text-text-muted border-bg-border hover:border-brand-primary/40'
                      }`}>
                      {f} <span className="opacity-70">({filterCounts[f]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking list */}
              <div className="flex-1 overflow-y-auto divide-y divide-bg-border">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-brand-primary" />
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    <MessageSquare size={28} className="mb-2 opacity-30" />
                    <p className="text-xs">{bookingSearch || bookingFilter !== 'all' ? 'No results' : 'No bookings yet'}</p>
                  </div>
                ) : filteredBookings.map(b => (
                  <button key={b.id} onClick={() => openThread(b)}
                    className={`w-full text-left p-3 hover:bg-bg-elevated/60 transition-colors ${activeThread?.id === b.id ? 'bg-brand-primary/8 border-l-2 border-brand-primary' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-text-primary truncate">{b.service_title || 'Service Request'}</p>
                        <p className="text-[11px] text-text-muted truncate">{b.user_name}{b.user_email ? ` · ${b.user_email}` : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={b.status} />
                          <span className="text-[10px] text-text-muted">{relTime(b.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-text-muted shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right — thread panel */}
            <div className={`flex-1 flex flex-col min-w-0 ${showDetail ? 'flex' : 'hidden lg:flex'}`}>
              <AnimatePresence mode="wait">
                <BookingThread
                  key={activeThread?.id ?? 'empty'}
                  booking={activeThread}
                  onBack={() => setShowDetail(false)}
                  onReply={handleReply}
                  onStatusChange={handleStatusChange}
                />
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      <ServiceFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingService(null) }}
        onSubmit={handleSave}
        service={editingService}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
