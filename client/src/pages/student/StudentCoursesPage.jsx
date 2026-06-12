import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, Search, ExternalLink, Lock, Tag, Crown, ArrowRight,
  CheckCircle, PlusCircle, Loader2,
} from 'lucide-react'
import Swal from 'sweetalert2'
import { ebooksAPI, learningAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import { assetUrl } from '@utils/assetUrl'

const FILTERS = [
  { key: 'all',     label: 'All Courses' },
  { key: 'free',    label: 'Free'        },
  { key: 'premium', label: 'Premium'     },
]

export default function StudentCoursesPage() {
  const [ebooks, setEbooks]           = useState([])
  const [learning, setLearning]       = useState([])  // { ebook: id, id: learningId }[]
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [claiming, setClaiming]       = useState(null)  // ebook id being claimed
  const [successBook, setSuccessBook] = useState(null)  // ebook obj after claim

  const loadAll = useCallback(async () => {
    try {
      const [ebooksRes, learningRes] = await Promise.all([
        ebooksAPI.getAll(),
        learningAPI.getAll(),
      ])
      setEbooks(ebooksRes.data)
      setLearning(learningRes.data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const claimedIds = new Set(learning.map(l => l.ebook))

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

  const handleClaim = async (book) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Add to My Learning?',
      html: `<span style="color:#8BAAC8">Add <strong style="color:#EEF4FF">${book.title}</strong> to your learning library?</span><br/><span style="font-size:12px;color:#445E7A;margin-top:6px;display:block">This cannot be removed once added.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Add It',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3B82F6',
      background: '#0C1628',
      color: '#EEF4FF',
    })
    if (!isConfirmed) return
    setClaiming(book.id)
    try {
      await learningAPI.claim({ ebook: book.id })
      setLearning(prev => [...prev, { ebook: book.id }])
      setSuccessBook(book)
    } catch {}
    finally { setClaiming(null) }
  }

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
        <Link
          to="/student/request"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-amber/30 bg-brand-amber/8 text-brand-amber text-sm font-medium hover:bg-brand-amber/15 transition-colors shrink-0"
        >
          <Crown size={14} /> Request Premium Access
        </Link>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
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
          {filtered.map(book => {
            const inLearning = claimedIds.has(book.id)
            const isClaiming = claiming === book.id
            return (
              <motion.div
                key={book.id || book.slug}
                variants={fadeUp}
                className="group rounded-xl border border-bg-border bg-bg-surface overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200 flex flex-col"
              >
                {/* Cover */}
                <div className={`relative h-40 overflow-hidden flex items-center justify-center ${book.gradient ? `bg-gradient-to-br ${book.gradient}` : 'bg-bg-elevated'}`}>
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-black/15 pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
                  <div className="relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                    {book.cover_image ? (
                      <img src={assetUrl(book.cover_image)} alt={book.title} className="w-full h-full object-cover" />
                    ) : book.icon ? (
                      <img src={book.icon} alt={book.title} width={64} height={64}
                        className={`h-16 w-16 object-contain drop-shadow-2xl ${book.icon_white ? 'brightness-0 invert' : ''}`}
                        loading="lazy" onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="opacity-50">
                        {book.is_free ? <BookOpen size={40} className="text-white" /> : <Crown size={40} className="text-white" />}
                      </div>
                    )}
                  </div>
                  {book.is_free ? (
                    <span className="absolute top-2 right-2 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-green-300">
                      Free
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand-amber/30 backdrop-blur-sm border border-brand-amber/50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-amber">
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
                      inLearning ? (
                        <Link
                          to="/student/learning"
                          className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold py-2.5 hover:bg-green-500/20 transition-all"
                        >
                          <CheckCircle size={12} /> In My Learning
                        </Link>
                      ) : (
                        <button
                          disabled={isClaiming}
                          onClick={() => handleClaim(book)}
                          className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold py-2.5 hover:bg-brand-primary hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isClaiming
                            ? <><Loader2 size={12} className="animate-spin" /> Adding…</>
                            : <><PlusCircle size={12} /> Add to Learning</>
                          }
                        </button>
                      )
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
            )
          })}
        </motion.div>
      )}

      {/* Success popup */}
      <AnimatePresence>
        {successBook && (
          <motion.div
            key="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setSuccessBook(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{   scale: 0.8, opacity: 0, y: 10  }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-bg-surface border border-bg-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Animated check */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
                className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 20, delay: 0.2 }}
                >
                  <CheckCircle size={32} className="text-green-400" />
                </motion.div>
              </motion.div>

              <h3 className="font-display text-lg font-bold text-text-primary mb-1">
                Successfully Claimed!
              </h3>
              <p className="text-sm text-text-secondary mb-1">
                <span className="text-brand-primary font-semibold">{successBook.title}</span>
              </p>
              <p className="text-xs text-text-muted mb-6">
                Added to your learning library.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessBook(null)}
                  className="flex-1 py-2.5 rounded-xl border border-bg-border text-text-secondary text-sm hover:bg-bg-elevated transition-colors"
                >
                  Continue Browsing
                </button>
                <Link
                  to="/student/learning"
                  onClick={() => setSuccessBook(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors text-center"
                >
                  My Learning
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
