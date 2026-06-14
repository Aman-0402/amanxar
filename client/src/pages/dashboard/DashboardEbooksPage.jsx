import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Edit2, Trash2, ExternalLink, Users, Search,
  BookOpen, Crown, Lock, Unlock, Loader2,
} from 'lucide-react'
import { ebooksAPI } from '@services/api'
import EBookFormModal from '@components/dashboard/EBookFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import { fadeUp, staggerContainer } from '@animations/variants'

const CATEGORY_COLOR = {
  'Web Development':   'bg-brand-primary/15 text-brand-primary',
  'Data Science & AI': 'bg-brand-amber/15 text-brand-amber',
  'Cloud & DevOps':    'bg-sky-400/15 text-sky-400',
  'Languages':         'bg-purple-400/15 text-purple-400',
  'Networking':        'bg-emerald-400/15 text-emerald-400',
}

const FILTERS = [
  { key: 'all',     label: 'All'     },
  { key: 'free',    label: 'Free'    },
  { key: 'premium', label: 'Premium' },
]

export default function DashboardEbooksPage() {
  const [ebooks, setEbooks]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [formModalOpen, setFormModalOpen]   = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [togglingId, setTogglingId]   = useState(null) // inline free/premium toggle

  const fetchEbooks = async () => {
    setLoading(true)
    try {
      const { data } = await ebooksAPI.getAll()
      setEbooks(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEbooks() }, [])

  const handleSave = async (data) => {
    if (editingItem) {
      await ebooksAPI.update(editingItem.slug, data)
    } else {
      await ebooksAPI.create(data)
    }
    setFormModalOpen(false)
    setEditingItem(null)
    fetchEbooks()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await ebooksAPI.delete(deleteTarget.slug)
    setDeleteModalOpen(false)
    setDeleteTarget(null)
    fetchEbooks()
  }

  const handleToggleFree = async (book) => {
    setTogglingId(book.slug)
    try {
      await ebooksAPI.update(book.slug, { ...book, is_free: !book.is_free })
      setEbooks(prev => prev.map(e => e.slug === book.slug ? { ...e, is_free: !e.is_free } : e))
    } finally {
      setTogglingId(null)
    }
  }

  const freeCount    = ebooks.filter(e => e.is_free).length
  const premiumCount = ebooks.filter(e => !e.is_free).length

  const filtered = useMemo(() => ebooks.filter(e => {
    const term = search.toLowerCase()
    const matchSearch = !term ||
      e.title?.toLowerCase().includes(term) ||
      e.category?.toLowerCase().includes(term) ||
      e.subtitle?.toLowerCase().includes(term)
    const matchFilter =
      filter === 'all' ||
      (filter === 'free' ? e.is_free : !e.is_free)
    return matchSearch && matchFilter
  }), [ebooks, search, filter])

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Courses</h1>
          <p className="text-text-secondary text-sm mt-1">{ebooks.length} courses — {freeCount} free, {premiumCount} premium</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setFormModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus size={15} /> Add Course
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: ebooks.length,  color: 'border-bg-border bg-bg-elevated text-text-primary' },
          { label: 'Free',  value: freeCount,       color: 'border-green-500/30 bg-green-500/8 text-green-400' },
          { label: 'Premium', value: premiumCount,  color: 'border-brand-amber/30 bg-brand-amber/8 text-brand-amber' },
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
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated">
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === key ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
              {key === 'free'    && <span className="ml-1.5 text-xs opacity-70">({freeCount})</span>}
              {key === 'premium' && <span className="ml-1.5 text-xs opacity-70">({premiumCount})</span>}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface animate-pulse h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-text-muted">
          <BookOpen size={44} className="mb-3 opacity-30" />
          <p className="text-sm">{search ? 'No courses match your search' : 'No courses yet'}</p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-2 text-xs text-brand-primary hover:underline">Clear search</button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(book => (
            <motion.div key={book.slug} variants={fadeUp}
              className="group rounded-xl border border-bg-border bg-bg-surface overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200 flex flex-col"
            >
              {/* Cover */}
              <div className={`relative h-36 overflow-hidden flex items-center justify-center bg-gradient-to-br ${book.gradient || 'from-blue-500 to-indigo-600'}`}>
                {/* shimmer */}
                <div className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[300%] transition-transform duration-700 pointer-events-none" />
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-black/15 pointer-events-none" />

                {book.icon ? (
                  <img src={book.icon} alt={book.title} width={56} height={56}
                    className={`relative z-10 h-14 w-14 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 ${book.icon_white ? 'brightness-0 invert' : ''}`}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <BookOpen size={40} className="relative z-10 text-white/70" />
                )}

                {/* Free/Premium badge */}
                {book.is_free ? (
                  <span className="absolute top-2 left-2 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/40 px-2 py-0.5 text-[10px] font-semibold text-green-300">
                    Free
                  </span>
                ) : (
                  <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-brand-amber/30 backdrop-blur-sm border border-brand-amber/50 px-2 py-0.5 text-[10px] font-semibold text-brand-amber">
                    <Crown size={8} /> Premium
                  </span>
                )}

                {/* Learners count */}
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80">
                  <Users size={9} /> {book.learners_count ?? 0}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {book.category && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${CATEGORY_COLOR[book.category] ?? 'bg-bg-border text-text-muted'}`}>
                      {book.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">{book.title}</h3>
                {book.subtitle && (
                  <p className="text-xs text-text-muted line-clamp-1">{book.subtitle}</p>
                )}
                {book.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {book.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-bg-elevated border border-bg-border px-1.5 py-0.5 rounded text-text-muted">{tag}</span>
                    ))}
                    {book.tags.length > 3 && (
                      <span className="text-[10px] bg-bg-elevated border border-bg-border px-1.5 py-0.5 rounded text-text-muted">+{book.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-3 flex items-center gap-1.5">
                  {/* Toggle free/premium */}
                  <button
                    onClick={() => handleToggleFree(book)}
                    disabled={togglingId === book.slug}
                    title={book.is_free ? 'Make Premium' : 'Make Free'}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      book.is_free
                        ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-brand-amber/10 hover:border-brand-amber/30 hover:text-brand-amber'
                        : 'border-brand-amber/30 bg-brand-amber/10 text-brand-amber hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                    } disabled:opacity-50`}
                  >
                    {togglingId === book.slug
                      ? <Loader2 size={10} className="animate-spin" />
                      : book.is_free ? <Unlock size={10} /> : <Lock size={10} />
                    }
                    {book.is_free ? 'Free' : 'Premium'}
                  </button>

                  <div className="flex items-center gap-1 ml-auto">
                    <button onClick={() => window.open(book.read_url, '_blank')} title="Open course"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-text-primary hover:border-brand-primary/30 transition-colors">
                      <ExternalLink size={13} />
                    </button>
                    <button onClick={() => { setEditingItem(book); setFormModalOpen(true) }} title="Edit"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => { setDeleteTarget(book); setDeleteModalOpen(true) }} title="Delete"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <EBookFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSave}
        ebook={editingItem}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure? This cannot be undone."
      />
    </motion.div>
  )
}
