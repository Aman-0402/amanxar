import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Trash2, Loader2, AlertCircle, UserCheck, Calendar, ChevronUp, ChevronDown, Check, X } from 'lucide-react'
import { usersAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import { useAuth } from '@context/AuthContext'
import Swal from 'sweetalert2'

const ROLE_RANK = { admin: 0, employee: 1, student: 2 }
const ROLE_FILTERS = ['all', 'admin', 'employee', 'student']
const ROLE_LABEL = { admin: 'Admin', employee: 'Moderator', student: 'Student' }

const roleColor = (role) => ({
  admin:    'text-brand-amber bg-brand-amber/10 border-brand-amber/30',
  employee: 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/30',
  student:  'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
}[role] || 'text-text-muted bg-bg-elevated border-bg-border')

export default function DashboardUsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [dateSort, setDateSort]     = useState('desc')
  const [deleting, setDeleting]     = useState(null)
  const [editingRole, setEditingRole] = useState(null)   // user id being role-edited
  const [pendingRole, setPendingRole] = useState('')     // selected role value
  const [savingRole, setSavingRole]   = useState(null)
  const [error, setError]           = useState('')

  useEffect(() => {
    usersAPI.getAll()
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  // Mini stats
  const roleCounts = useMemo(() => ({
    admin:    users.filter(u => u.role === 'admin').length,
    employee: users.filter(u => u.role === 'employee').length,
    student:  users.filter(u => u.role === 'student' || !u.role).length,
  }), [users])

  const filtered = useMemo(() => {
    let list = users.filter(u => {
      const term = search.toLowerCase()
      const matchSearch = !term ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.full_name?.toLowerCase().includes(term)

      const matchRole = roleFilter === 'all' || u.role === roleFilter

      const joined = u.date_joined ? new Date(u.date_joined) : null
      const matchFrom = !dateFrom || (joined && joined >= new Date(dateFrom))
      const matchTo   = !dateTo   || (joined && joined <= new Date(dateTo + 'T23:59:59'))

      return matchSearch && matchRole && matchFrom && matchTo
    })

    list.sort((a, b) => {
      const rankDiff = (ROLE_RANK[a.role] ?? 2) - (ROLE_RANK[b.role] ?? 2)
      if (rankDiff !== 0) return rankDiff
      const da = a.date_joined ? new Date(a.date_joined) : 0
      const db = b.date_joined ? new Date(b.date_joined) : 0
      return dateSort === 'asc' ? da - db : db - da
    })

    return list
  }, [users, search, roleFilter, dateFrom, dateTo, dateSort])

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

  const startEditRole = (u) => {
    setEditingRole(u.id)
    setPendingRole(u.role || 'student')
  }

  const cancelEditRole = () => {
    setEditingRole(null)
    setPendingRole('')
  }

  const saveRole = async (id) => {
    setSavingRole(id)
    try {
      await usersAPI.updateRole(id, pendingRole)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: pendingRole } : u))
      setEditingRole(null)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update role')
    } finally {
      setSavingRole(null)
    }
  }

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setSearch(''); setRoleFilter('all') }
  const hasFilters = search || dateFrom || dateTo || roleFilter !== 'all'

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
          <span className="text-sm font-semibold text-text-primary">{filtered.length}</span>
          <span className="text-sm text-text-muted">/ {users.length} total</span>
        </div>
      </motion.div>

      {/* Mini Stats Bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber/8 px-4 py-2">
          <span className="text-xs font-semibold text-brand-amber uppercase tracking-wide">Admins</span>
          <span className="text-sm font-bold text-text-primary">{roleCounts.admin}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-secondary/30 bg-brand-secondary/8 px-4 py-2">
          <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wide">Moderators</span>
          <span className="text-sm font-bold text-text-primary">{roleCounts.employee}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-primary/8 px-4 py-2">
          <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Students</span>
          <span className="text-sm font-bold text-text-primary">{roleCounts.student}</span>
        </div>
      </motion.div>

      {/* Role Filter Pills */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        {ROLE_FILTERS.map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
              roleFilter === r
                ? r === 'all'
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : roleColor(r) + ' border-opacity-60'
                : 'border-bg-border text-text-muted hover:text-text-primary hover:border-brand-primary/30'
            }`}
          >
            {r === 'all' ? `All (${users.length})` : `${ROLE_LABEL[r] || r} (${roleCounts[r] ?? 0})`}
          </button>
        ))}
      </motion.div>

      {/* Search + Date Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted font-medium uppercase tracking-wide flex items-center gap-1">
            <Calendar size={11} /> From
          </label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="rounded-lg border border-bg-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none [color-scheme:dark]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted font-medium uppercase tracking-wide flex items-center gap-1">
            <Calendar size={11} /> To
          </label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="rounded-lg border border-bg-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none [color-scheme:dark]"
          />
        </div>
        <button
          onClick={() => setDateSort(s => s === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:border-brand-primary/40 transition-all"
        >
          {dateSort === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {dateSort === 'desc' ? 'Newest' : 'Oldest'}
        </button>
        {hasFilters && (
          <button onClick={clearFilters}
            className="px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
          >
            Clear
          </button>
        )}
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
          <p>{hasFilters ? 'No users match filters' : 'No users registered yet'}</p>
        </div>
      ) : (
        <motion.div variants={fadeUp} className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-elevated/50">
                  {['User', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {filtered.map(u => (
                  <tr key={u.id} className={`hover:bg-bg-elevated/30 transition-colors ${u.role === 'admin' || u.role === 'employee' ? 'bg-brand-amber/3' : ''}`}>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                          u.role === 'admin' ? 'bg-brand-amber/20 border-brand-amber/30 text-brand-amber'
                          : u.role === 'employee' ? 'bg-brand-secondary/20 border-brand-secondary/30 text-brand-secondary'
                          : 'bg-brand-primary/20 border-brand-primary/20 text-brand-primary'
                        }`}>
                          {(u.full_name || u.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {u.full_name || '—'}
                            {u.id === currentUser?.user_id && (
                              <span className="ml-2 text-xs text-brand-primary font-normal">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-text-muted">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-text-secondary">{u.email || '—'}</td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-text-secondary">{u.phone || '—'}</td>

                    {/* Role — inline edit */}
                    <td className="px-4 py-3">
                      {editingRole === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={pendingRole}
                            onChange={e => setPendingRole(e.target.value)}
                            className="rounded-lg border border-brand-primary/40 bg-bg-elevated px-2 py-1 text-xs text-text-primary focus:outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="employee">Moderator</option>
                            <option value="student">Student</option>
                          </select>
                          <button
                            onClick={() => saveRole(u.id)}
                            disabled={savingRole === u.id}
                            className="p-1 rounded text-green-400 hover:bg-green-400/10 transition-colors"
                            title="Save"
                          >
                            {savingRole === u.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          </button>
                          <button onClick={cancelEditRole} className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => u.id !== currentUser?.user_id && startEditRole(u)}
                          disabled={u.id === currentUser?.user_id}
                          title={u.id === currentUser?.user_id ? 'Cannot change own role' : 'Click to change role'}
                          className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium capitalize transition-all ${roleColor(u.role)} ${
                            u.id !== currentUser?.user_id ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
                          }`}
                        >
                          {ROLE_LABEL[u.role] || 'Student'}
                        </button>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {u.id === currentUser?.user_id ? (
                        <span className="text-xs text-text-muted px-3 py-1.5">—</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {deleting === u.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Delete
                        </button>
                      )}
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
