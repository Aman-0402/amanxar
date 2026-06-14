import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Plus, Pencil, Trash2, Loader2,
  AlertCircle, CheckCircle, XCircle, Tag, Clock, Target,
  Search, Users, UserCheck, BookOpen, Crown, Zap,
} from 'lucide-react'
import { assessmentsAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import Swal from 'sweetalert2'

const BLANK = {
  title: '', description: '', category: '', tags: [],
  is_free: true, time_limit: '', pass_mark: 60,
  is_active: true, order: 0,
}

const FILTERS = ['all', 'active', 'draft', 'free', 'premium']

export default function DashboardAssessmentsPage() {
  const navigate = useNavigate()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState(BLANK)
  const [editId, setEditId]       = useState(null)
  const [tagInput, setTagInput]   = useState('')
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [togglingId, setTogglingId] = useState(null)

  const load = () => {
    setLoading(true)
    assessmentsAPI.getAll()
      .then(({ data }) => setItems(data))
      .catch(() => setError('Failed to load assessments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Stats
  const totalActive  = items.filter(i => i.is_active).length
  const totalFree    = items.filter(i => i.is_free).length
  const totalPremium = items.filter(i => !i.is_free).length

  const filtered = useMemo(() => items.filter(i => {
    const term = search.toLowerCase()
    const matchSearch = !term ||
      i.title?.toLowerCase().includes(term) ||
      i.category?.toLowerCase().includes(term) ||
      i.description?.toLowerCase().includes(term)
    const matchFilter =
      filter === 'all'     ||
      (filter === 'active'  && i.is_active)  ||
      (filter === 'draft'   && !i.is_active) ||
      (filter === 'free'    && i.is_free)    ||
      (filter === 'premium' && !i.is_free)
    return matchSearch && matchFilter
  }), [items, search, filter])

  const filterCounts = {
    all:     items.length,
    active:  totalActive,
    draft:   items.length - totalActive,
    free:    totalFree,
    premium: totalPremium,
  }

  const openCreate = () => { setForm(BLANK); setEditId(null); setTagInput(''); setShowModal(true) }

  const openEdit = (item) => {
    setForm({
      title: item.title, description: item.description,
      category: item.category, tags: item.tags || [],
      is_free: item.is_free, time_limit: item.time_limit ?? '',
      pass_mark: item.pass_mark, is_active: item.is_active, order: item.order,
    })
    setTagInput(''); setEditId(item.id); setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      time_limit: form.time_limit === '' ? null : Number(form.time_limit),
      pass_mark: Number(form.pass_mark),
      order: Number(form.order),
    }
    try {
      if (editId) {
        const { data } = await assessmentsAPI.update(editId, payload)
        setItems(prev => prev.map(i => i.id === editId ? data : i))
      } else {
        const { data } = await assessmentsAPI.create(payload)
        setItems(prev => [data, ...prev])
      }
      setShowModal(false)
    } catch {
      setError('Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete assessment?',
      text: 'All questions and student attempts will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
      background: '#0C1628',
      color: '#EEF4FF',
    })
    if (!result.isConfirmed) return
    try {
      await assessmentsAPI.delete(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      setError('Failed to delete assessment')
    }
  }

  const handleToggleActive = async (item) => {
    setTogglingId(item.id)
    try {
      const { data } = await assessmentsAPI.update(item.id, { ...item, is_active: !item.is_active })
      setItems(prev => prev.map(i => i.id === item.id ? data : i))
    } finally {
      setTogglingId(null)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }))
    setTagInput('')
  }
  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Assessments</h1>
          <p className="text-text-secondary mt-1">Create and manage exams for students</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors shadow-glow-primary">
          <Plus size={16} /> New Assessment
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        {[
          { label: 'Total',   value: items.length,  color: 'border-bg-border bg-bg-elevated text-text-primary' },
          { label: 'Active',  value: totalActive,   color: 'border-green-500/30 bg-green-500/8 text-green-400' },
          { label: 'Free',    value: totalFree,     color: 'border-brand-primary/30 bg-brand-primary/8 text-brand-primary' },
          { label: 'Premium', value: totalPremium,  color: 'border-brand-amber/30 bg-brand-amber/8 text-brand-amber' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${s.color}`}>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</span>
            <span className="text-sm font-bold">{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text" placeholder="Search assessments…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}>
              {f} <span className="opacity-60">({filterCounts[f]})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface h-28 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-text-muted">
          <ClipboardList size={44} className="mb-3 opacity-30" />
          <p className="text-sm">{search || filter !== 'all' ? 'No assessments match filters' : 'No assessments yet'}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all') }} className="mt-2 text-xs text-brand-primary hover:underline">Clear filters</button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="grid gap-3">
          {filtered.map(item => (
            <div key={item.id}
              className="rounded-xl border border-bg-border bg-bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-primary/20 transition-colors">

              {/* Left: title + badges + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>

                  {/* Active toggle badge */}
                  <button
                    onClick={() => handleToggleActive(item)}
                    disabled={togglingId === item.id}
                    title={item.is_active ? 'Click to Draft' : 'Click to Activate'}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium transition-all disabled:opacity-50 ${
                      item.is_active
                        ? 'text-green-400 bg-green-400/10 border-green-400/30 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30'
                        : 'text-text-muted bg-bg-elevated border-bg-border hover:bg-green-400/10 hover:text-green-400 hover:border-green-400/30'
                    }`}>
                    {togglingId === item.id
                      ? <Loader2 size={9} className="animate-spin" />
                      : <Zap size={9} />
                    }
                    {item.is_active ? 'Active' : 'Draft'}
                  </button>

                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    item.is_free
                      ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/30'
                      : 'text-brand-amber bg-brand-amber/10 border-brand-amber/30'
                  }`}>
                    {item.is_free ? 'Free' : <span className="flex items-center gap-1"><Crown size={9} />Premium</span>}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-text-muted line-clamp-1 mb-2">{item.description}</p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                  {item.category && (
                    <span className="flex items-center gap-1"><Tag size={10} />{item.category}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen size={10} />{item.question_count ?? 0} questions
                  </span>
                  {item.time_limit && (
                    <span className="flex items-center gap-1"><Clock size={10} />{item.time_limit} min</span>
                  )}
                  <span className="flex items-center gap-1"><Target size={10} />Pass {item.pass_mark}%</span>
                </div>
              </div>

              {/* Right: student stats + actions */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                {/* Student counts */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-bg-border bg-bg-elevated/60 text-xs">
                  {!item.is_free && (
                    <>
                      <span className="flex items-center gap-1.5 text-text-secondary" title="Students granted access">
                        <Crown size={11} className="text-brand-amber" />
                        <span className="font-semibold text-text-primary">{item.enrolled_count ?? 0}</span>
                        <span className="text-text-muted">enrolled</span>
                      </span>
                      <span className="text-bg-border">|</span>
                    </>
                  )}
                  <span className="flex items-center gap-1.5 text-text-secondary" title="Students who started">
                    <Users size={11} className="text-brand-primary" />
                    <span className="font-semibold text-text-primary">{item.started_count ?? 0}</span>
                    <span className="text-text-muted">started</span>
                  </span>
                  <span className="text-bg-border">|</span>
                  <span className="flex items-center gap-1.5 text-text-secondary" title="Students who completed">
                    <UserCheck size={11} className="text-green-400" />
                    <span className="font-semibold text-text-primary">{item.attempt_count ?? 0}</span>
                    <span className="text-text-muted">done</span>
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button onClick={() => navigate(`/dashboard/assessments/${item.id}/edit`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-brand-primary border border-brand-primary/30 bg-brand-primary/8 hover:bg-brand-primary hover:text-white transition-all font-semibold">
                    <Pencil size={12} /> Questions
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-text-primary hover:border-brand-primary/30 transition-colors" title="Settings">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors" title="Delete">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-12 bottom-12 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 overflow-y-auto rounded-2xl border border-bg-border bg-bg-surface shadow-2xl"
            >
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-text-primary">
                    {editId ? 'Edit Assessment' : 'New Assessment'}
                  </h2>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                    <XCircle size={18} />
                  </button>
                </div>

                <Field label="Title" required>
                  <input required value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Python Fundamentals Quiz"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </Field>

                <Field label="Description">
                  <textarea rows={3} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief overview of this assessment"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category">
                    <input value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="e.g. Python"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </Field>
                  <Field label="Order">
                    <input type="number" min="0" value={form.order}
                      onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Time Limit (min)">
                    <input type="number" min="1" value={form.time_limit}
                      onChange={e => setForm(f => ({ ...f, time_limit: e.target.value }))}
                      placeholder="No limit"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </Field>
                  <Field label="Pass Mark (%)">
                    <input type="number" min="0" max="100" value={form.pass_mark}
                      onChange={e => setForm(f => ({ ...f, pass_mark: e.target.value }))}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </Field>
                </div>

                <Field label="Tags">
                  <div className="flex gap-2">
                    <input value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="Add tag…"
                      className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <button type="button" onClick={addTag}
                      className="px-3 py-2 rounded-lg bg-bg-elevated text-text-secondary hover:text-brand-primary text-sm transition-colors">
                      Add
                    </button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.tags.map(t => (
                        <span key={t} className="flex items-center gap-1 text-xs bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-2.5 py-1 rounded-full">
                          {t}
                          <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>

                <div className="flex items-center gap-6">
                  <Toggle label="Free"   checked={form.is_free}   onChange={v => setForm(f => ({ ...f, is_free: v }))} />
                  <Toggle label="Active" checked={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-bg-border text-text-secondary hover:bg-bg-elevated text-sm font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {editId ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-secondary">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-bg-elevated border border-bg-border'}`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  )
}
