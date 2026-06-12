import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, Search, ExternalLink, Lock, Tag, Crown, ArrowRight,
} from 'lucide-react'
import { ebooksAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import { assetUrl } from '@utils/assetUrl'

const FILTERS = [
  { key: 'all',     label: 'All Courses' },
  { key: 'free',    label: 'Free'        },
  { key: 'premium', label: 'Premium'     },
]

export default function StudentCoursesPage() {
  const [ebooks, setEbooks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    ebooksAPI.getAll()
      .then(({ data }) => setEbooks(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = ebooks.filter(e => {
    const matchSearch =
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'free' ? e.is_free : !e.is_free)
    return matchSearch && matchFilter
  })

  const freeCount    = ebooks.filter(e => e.is_free).length
  const premiumCount = ebooks.filter(e => !e.is_free).length

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Courses</h1>
          <p className="text-text-secondary text-sm mt-1">
            {ebooks.length} courses available — {freeCount} free, {premiumCount} premium
          </p>
        </div>

        {/* Premium CTA pill */}
        <Link
          to="/student/request"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-amber/30 bg-brand-amber/8 text-brand-amber text-sm font-medium hover:bg-brand-amber/15 transition-colors shrink-0"
        >
          <Crown size={14} /> Request Premium Access
        </Link>
      </motion.div>

      {/* Search + Filter bar */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl border border-bg-border bg-bg-elevated">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={[
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                filter === key
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
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
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-20 text-text-muted">
          <BookOpen size={44} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No courses found</p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-2 text-xs text-brand-primary hover:underline">
              Clear search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(book => (
            <motion.div
              key={book.id || book.slug}
              variants={fadeUp}
              className="group rounded-xl border border-bg-border bg-bg-surface overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200 flex flex-col"
            >
              {/* Cover */}
              <div className="h-36 bg-bg-elevated flex items-center justify-center relative overflow-hidden">
                {book.cover_image ? (
                  <img
                    src={assetUrl(book.cover_image)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    {book.is_free
                      ? <BookOpen size={36} className="text-brand-primary" />
                      : <Crown size={36} className="text-brand-amber" />
                    }
                  </div>
                )}
                {/* Badge */}
                {book.is_free ? (
                  <span className="absolute top-2 right-2 rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    Free
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand-amber/20 border border-brand-amber/40 px-2.5 py-0.5 text-xs font-semibold text-brand-amber">
                    <Crown size={9} /> Premium
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                {book.category && (
                  <div className="flex items-center gap-1 text-[11px] text-text-muted uppercase tracking-wide">
                    <Tag size={9} /> {book.category}
                  </div>
                )}
                <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">
                  {book.title}
                </h3>
                {book.subtitle && (
                  <p className="text-xs text-text-muted line-clamp-1">{book.subtitle}</p>
                )}

                {/* CTA */}
                <div className="mt-auto pt-3">
                  {book.is_free ? (
                    <a
                      href={book.read_url || book.download_url || book.file_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold py-2.5 hover:bg-brand-primary hover:text-white transition-all"
                    >
                      <ExternalLink size={12} /> Read / Download
                    </a>
                  ) : (
                    <Link
                      to="/student/request"
                      className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-amber/10 border border-brand-amber/20 text-brand-amber text-xs font-semibold py-2.5 hover:bg-brand-amber/20 transition-all"
                    >
                      <Lock size={12} /> Request Access <ArrowRight size={11} />
                    </Link>
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
