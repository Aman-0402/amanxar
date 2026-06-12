import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Trash2, Loader2, AlertCircle, UserCheck } from 'lucide-react'
import { usersAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import Swal from 'sweetalert2'

export default function DashboardUsersPage() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [deleting, setDeleting] = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    usersAPI.getAll()
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete user?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
      background: '#0C1628',
      color: '#EEF4FF',
    })
    if (!result.isConfirmed) return
    setDeleting(id)
    try {
      await usersAPI.delete(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      setError('Failed to delete user')
    } finally {
      setDeleting(null)
    }
  }

  const roleColor = (role) => ({
    admin:    'text-brand-amber bg-brand-amber/10 border-brand-amber/30',
    employee: 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/30',
    student:  'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
  }[role] || 'text-text-muted bg-bg-elevated border-bg-border')

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary mt-1">Manage registered students and team members</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-bg-border bg-bg-elevated px-4 py-2">
          <UserCheck size={16} className="text-brand-primary" />
          <span className="text-sm font-semibold text-text-primary">{users.length}</span>
          <span className="text-sm text-text-muted">total</span>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp} className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>{search ? 'No users match your search' : 'No users registered yet'}</p>
        </div>
      ) : (
        <motion.div variants={fadeUp} className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-elevated/50">
                  {['User', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/20 border border-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
                          {(u.full_name || u.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{u.full_name || '—'}</p>
                          <p className="text-xs text-text-muted">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${roleColor(u.role)}`}>
                        {u.role || 'student'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {deleting === u.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
