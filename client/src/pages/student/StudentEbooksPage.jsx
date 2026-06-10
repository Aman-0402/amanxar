import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, ExternalLink, Lock, Tag } from 'lucide-react'
import { ebooksAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import { assetUrl } from '@utils/assetUrl'

export default function StudentEbooksPage() {
  const [ebooks, setEbooks]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all') // all | free | premium

  useEffect(() => {
    ebooksAPI.getAll()
      .then(({ data }) => setEbooks(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = ebooks.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) ||
                        e.category?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'free' ? e.is_free : !e.is_free)
    return matchSearch && matchFilter
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-2xl font-bold text-text-primary">Ebooks Library</h1>
        <p className="text-text-secondary text-sm mt-1">Browse all available ebooks and learning resources</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search ebooks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'free', 'premium'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'border border-bg-border text-text-secondary hover:text-text-primary hover:border-brand-primary/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-16 text-text-muted">
          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>No ebooks found</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book) => (
            <motion.div
              key={book.id || book.slug}
              variants={fadeUp}
              className="group rounded-xl border border-bg-border bg-bg-surface overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200 flex flex-col"
            >
              {/* Cover / icon */}
              <div className="h-36 bg-bg-elevated flex items-center justify-center relative overflow-hidden">
                {book.cover_image ? (
                  <img src={assetUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={40} className="text-brand-primary/40" />
                )}
                {!book.is_free && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand-amber/20 border border-brand-amber/40 px-2 py-0.5 text-xs font-medium text-brand-amber">
                    <Lock size={10} /> Premium
                  </div>
                )}
                {book.is_free && (
                  <div className="absolute top-2 right-2 rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-400">
                    Free
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                {book.category && (
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Tag size={10} /> {book.category}
                  </div>
                )}
                <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">{book.title}</h3>
                {book.description && (
                  <p className="text-xs text-text-muted line-clamp-2">{book.description}</p>
                )}
                <div className="mt-auto pt-2">
                  {book.is_free ? (
                    <a
                      href={book.download_url || book.file_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium py-2 hover:bg-brand-primary hover:text-white transition-all"
                    >
                      <ExternalLink size={12} /> Read / Download
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-amber/10 border border-brand-amber/20 text-brand-amber text-xs font-medium py-2 cursor-not-allowed opacity-70"
                    >
                      <Lock size={12} /> Unlock in Premium
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
