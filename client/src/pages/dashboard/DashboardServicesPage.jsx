import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, MessageSquare, ChevronRight,
  Send, Loader2, Clock, ArrowRight, CheckCircle, XCircle, LayoutList,
} from 'lucide-react'
import { servicesAPI, bookingsAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import ServiceFormModal from '@components/dashboard/ServiceFormModal'
import { showSuccess, showError } from '@utils/toast'

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  replied: 'bg-brand-primary/15 text-brand-primary border-brand-primary/30',
  closed:  'bg-bg-elevated text-text-muted border-bg-border',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_MAP[status] ?? STATUS_MAP.pending}`}>
      {status}
    </span>
  )
}

// ─── Booking Thread ───────────────────────────────────────────────────────────
function BookingThread({ booking, onBack, onReply, onStatusChange }) {
  const [msg, setMsg]       = useState('')
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
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-8 w-8 flex items-center justify-center rounded-lg border border-bg-border text-text-secondary hover:bg-bg-elevated transition-colors">
          <ArrowRight size={15} className="rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary text-sm">{booking.service_title || 'Service Request'}</h2>
          <p className="text-xs text-text-muted">
            From: <span className="text-text-secondary">{booking.user_name}</span>
            {booking.user_email && ` · ${booking.user_email}`}
            {' · '}Booking #{booking.id}
          </p>
        </div>
        {/* Status controls */}
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          {booking.status !== 'closed' && (
            <button
              onClick={() => onStatusChange(booking.id, 'closed')}
              title="Mark as closed"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors"
            >
              <XCircle size={14} />
            </button>
          )}
          {booking.status === 'closed' && (
            <button
              onClick={() => onStatusChange(booking.id, 'pending')}
              title="Reopen"
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-green-400 hover:border-green-400/30 transition-colors"
            >
              <CheckCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {/* Initial message */}
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
            {(booking.user_name?.[0] || 'S').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted mb-1">{booking.user_name} · {new Date(booking.created_at).toLocaleDateString()}</p>
            <div className="rounded-xl rounded-tl-sm bg-bg-elevated border border-bg-border px-3 py-2 text-sm text-text-primary">
              {booking.message}
            </div>
          </div>
        </div>

        {booking.replies?.map(reply => (
          <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              reply.is_admin
                ? 'bg-brand-amber/20 border border-brand-amber/30 text-brand-amber'
                : 'bg-brand-primary/20 border border-brand-primary/30 text-brand-primary'
            }`}>
              {reply.is_admin ? 'A' : (booking.user_name?.[0] || 'S').toUpperCase()}
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

        {booking.replies?.length === 0 && (
          <p className="text-xs text-text-muted text-center py-4">No replies yet. Be the first to respond.</p>
        )}
      </div>

      {/* Reply form */}
      {booking.status !== 'closed' && (
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
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardServicesPage() {
  const [services, setServices]     = useState([])
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('services')
  const [activeThread, setActiveThread] = useState(null)

  const [formModalOpen, setFormModalOpen]   = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteTarget, setDeleteTarget]     = useState(null)

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  useEffect(() => {
    Promise.all([servicesAPI.getAll(), bookingsAPI.getAll()])
      .then(([sRes, bRes]) => { setServices(sRes.data); setBookings(bRes.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchServices = () => servicesAPI.getAll().then(({ data }) => setServices(data))
  const fetchBookings = () => bookingsAPI.getAll().then(({ data }) => setBookings(data))

  const handleSave = async (data) => {
    try {
      editingService ? await servicesAPI.update(editingService.id, data) : await servicesAPI.create(data)
      setFormModalOpen(false); setEditingService(null); fetchServices()
    } catch (err) { console.error(err) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await servicesAPI.delete(deleteTarget.id)
      showSuccess('Service deleted')
      setDeleteModalOpen(false); setDeleteTarget(null); fetchServices()
    } catch (err) { showError(err.response?.data?.detail || 'Delete failed') }
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

  const openThread = async (booking) => {
    const { data } = await bookingsAPI.getById(booking.id)
    setActiveThread(data)
  }

  if (loading) return <div className="p-8 text-text-muted">Loading…</div>

  // Thread open
  if (activeThread && tab === 'bookings') return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-text-primary">Services</h1>
      </div>
      <BookingThread
        booking={activeThread}
        onBack={() => setActiveThread(null)}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
      />
    </div>
  )

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Services</h1>
        {tab === 'services' && (
          <button
            onClick={() => { setEditingService(null); setFormModalOpen(true) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors text-sm"
          >
            <Plus size={15} /> Add Service
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated w-fit">
        <button onClick={() => setTab('services')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'services' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          <LayoutList size={14} /> Services
        </button>
        <button onClick={() => setTab('bookings')}
          className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'bookings' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>
          <MessageSquare size={14} /> Bookings
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Services tab ────────────────────────────────────────────────────── */}
      {tab === 'services' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-bg-border bg-bg-surface p-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl">{service.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary text-sm">{service.title}</h3>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{service.description}</p>
                </div>
              </div>
              {service.features?.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {service.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-text-muted">• {f}</li>
                  ))}
                  {service.features.length > 3 && <li className="text-xs text-text-muted">+{service.features.length - 3} more</li>}
                </ul>
              )}
              {service.tiers?.length > 0 && (
                <p className="text-xs text-brand-primary font-medium mb-3">
                  {service.tiers.length} tier{service.tiers.length !== 1 ? 's' : ''}: {service.tiers.map(t => t.name).join(', ')}
                </p>
              )}
              <div className="flex gap-1">
                <button onClick={() => { setEditingService(service); setFormModalOpen(true) }}
                  className="p-2 hover:bg-bg-border rounded-lg transition-colors flex-1 flex items-center justify-center">
                  <Edit2 size={14} className="text-text-secondary" />
                </button>
                <button onClick={() => { setDeleteTarget(service); setDeleteModalOpen(true) }}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors flex-1 flex items-center justify-center">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Bookings tab ────────────────────────────────────────────────────── */}
      {tab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            bookings.map(b => (
              <button key={b.id} onClick={() => openThread(b)}
                className="w-full text-left rounded-xl border border-bg-border bg-bg-surface p-4 hover:border-brand-primary/30 hover:shadow-card transition-all group">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">{b.service_title || 'Service Request'}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-text-secondary">
                      <span className="font-medium">{b.user_name}</span>
                      {b.user_email && ` · ${b.user_email}`}
                    </p>
                    <p className="text-xs text-text-muted mt-1 line-clamp-1">{b.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(b.created_at).toLocaleDateString()}</span>
                      <span>{b.replies?.length || 0} message{b.replies?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-brand-primary transition-colors shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <ServiceFormModal isOpen={formModalOpen} onClose={() => { setFormModalOpen(false); setEditingService(null) }} onSubmit={handleSave} service={editingService} />
      <DeleteConfirmModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null) }} onConfirm={handleDelete} title="Delete Service" message="Are you sure? This cannot be undone." />
    </div>
  )
}
