import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ZoomIn, Search, Images } from 'lucide-react'
import { galleryAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import GalleryFormModal from '@components/dashboard/GalleryFormModal'
import { showSuccess, showError } from '@utils/toast'
import { fadeUp, staggerContainer } from '@animations/variants'

const CATEGORIES = ['All', 'Design', 'Diagrams', 'Events', 'Certificates', 'Screenshots']

export default function DashboardGalleryPage() {
  const [items,     setItems]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('All')
  const [lightbox,  setLightbox]  = useState(null)

  const [formModalOpen,   setFormModalOpen]   = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem,     setEditingItem]     = useState(null)
  const [deleteTarget,    setDeleteTarget]    = useState(null)
  const [isDeleting,      setIsDeleting]      = useState(false)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data } = await galleryAPI.getAll()
      setItems(data)
    } catch {
      showError('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await galleryAPI.update(editingItem.id, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        showSuccess('Gallery item updated')
      } else {
        await galleryAPI.create(formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        showSuccess('Gallery item added')
      }
      setFormModalOpen(false)
      setEditingItem(null)
      fetchItems()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save'
      showError(msg)
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await galleryAPI.delete(deleteTarget.id)
      showSuccess('Item deleted')
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  // Stats
  const catCounts = useMemo(() => {
    const counts = {}
    items.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1 })
    return counts
  }, [items])

  const filtered = useMemo(() => items.filter(i => {
    const term = search.toLowerCase()
    const matchSearch = !term || i.title?.toLowerCase().includes(term) || i.description?.toLowerCase().includes(term) || i.category?.toLowerCase().includes(term)
    const matchFilter = filter === 'All' || i.category === filter
    return matchSearch && matchFilter
  }), [items, search, filter])

  // Lightbox keyboard
  useEffect(() => {
    if (!lightbox) return
    const handler = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') {
        const idx = filtered.findIndex(i => i.id === lightbox.id)
        if (idx < filtered.length - 1) setLightbox(filtered[idx + 1])
      }
      if (e.key === 'ArrowLeft') {
        const idx = filtered.findIndex(i => i.id === lightbox.id)
        if (idx > 0) setLightbox(filtered[idx - 1])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, filtered])

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Gallery</h1>
          <p className="text-text-secondary mt-1 text-sm">Manage portfolio images</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setFormModalOpen(true) }}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all"
        >
          <Plus size={16} /> Add Image
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: items.length, color: 'border-bg-border bg-bg-elevated text-text-primary' },
          ...Object.entries(catCounts).map(([cat, count]) => ({
            label: cat, value: count,
            color: 'border-brand-primary/20 bg-brand-primary/8 text-brand-primary',
          }))
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
            type="text" placeholder="Search title, category…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === cat ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}>
              {cat}
              {cat !== 'All' && catCounts[cat] ? <span className="ml-1 opacity-60">({catCounts[cat]})</span> : null}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Images size={44} className="mb-3 opacity-30" />
          <p className="text-sm">{search || filter !== 'All' ? 'No images match filters' : 'No gallery items yet'}</p>
          {(search || filter !== 'All') && (
            <button onClick={() => { setSearch(''); setFilter('All') }} className="mt-2 text-xs text-brand-primary hover:underline">
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(item => (
            <motion.div key={item.id} variants={fadeUp}
              className="group relative rounded-xl overflow-hidden border border-bg-border bg-bg-surface hover:border-brand-primary/30 transition-all duration-200 aspect-[4/3]">

              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => { e.target.style.display = 'none' }}
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              {/* Category badge top-left */}
              <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 border border-white/10">
                {item.category}
              </span>

              {/* Year badge top-right */}
              <span className="absolute top-2 right-2 text-[10px] text-white/60 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
                {item.year}
              </span>

              {/* Title + actions on hover */}
              <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-xs font-semibold text-white line-clamp-1 mb-2">{item.title}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setLightbox(item)}
                    title="View full size"
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors">
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={() => { setEditingItem(item); setFormModalOpen(true) }}
                    title="Edit"
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => { setDeleteTarget(item); setDeleteModalOpen(true) }}
                    title="Delete"
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-500/30 backdrop-blur-sm border border-red-400/20 text-red-300 hover:bg-red-500/50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.image}
              alt={lightbox.title}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{lightbox.title}</p>
                <p className="text-sm text-white/60">{lightbox.category} · {lightbox.year}</p>
                {lightbox.description && <p className="text-xs text-white/50 mt-1 line-clamp-2">{lightbox.description}</p>}
              </div>
              <button onClick={() => setLightbox(null)}
                className="ml-4 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors shrink-0">
                Close
              </button>
            </div>
            {/* Keyboard nav hint */}
            <p className="text-center text-xs text-white/30 mt-2">← → to navigate · Esc to close</p>
          </div>
        </div>
      )}

      <GalleryFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingItem(null) }}
        onSubmit={handleSave}
        item={editingItem}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null) }}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.title || 'gallery item'}
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
