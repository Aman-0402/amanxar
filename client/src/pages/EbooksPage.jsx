import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ExternalLink, Sparkles, Lock, Crown, GraduationCap, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageLayout from '@components/layout/PageLayout'
import { fadeUp, staggerContainer } from '@animations/variants'
import { viewport } from '@animations/transitions'
import { ebooksAPI } from '@services/api'

const CATEGORY_META = {
  'Web Development':   { pill: 'text-brand-primary  bg-brand-primary/10  border-brand-primary/20',  dot: 'bg-brand-primary'  },
  'Data Science & AI': { pill: 'text-amber-400      bg-amber-400/10      border-amber-400/20',       dot: 'bg-amber-400'      },
  'Cloud & DevOps':    { pill: 'text-sky-400        bg-sky-400/10        border-sky-400/20',         dot: 'bg-sky-400'        },
  'Networking':        { pill: 'text-emerald-400    bg-emerald-400/10    border-emerald-400/20',     dot: 'bg-emerald-400'    },
  'Languages':         { pill: 'text-purple-400     bg-purple-400/10     border-purple-400/20',      dot: 'bg-purple-400'     },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2 } },
}

const gridVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  exit:    { transition: { staggerChildren: 0.03 } },
}

function CourseCard({ book }) {
  const meta = CATEGORY_META[book.category]

  return (
    <motion.div
      layout
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      className="group flex flex-col rounded-2xl overflow-hidden border border-bg-border bg-bg-elevated hover:border-brand-primary/30 hover:shadow-card-hover transition-all duration-300"
    >
      {/* Cover */}
      <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${book.gradient} flex items-center justify-center`}>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/15 pointer-events-none" />
        {/* Shine */}
        <div className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />

        {/* Icon */}
        <div className="relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
          {book.icon ? (
            <img
              src={book.icon}
              alt={book.title}
              width={72}
              height={72}
              className={`h-[72px] w-[72px] object-contain drop-shadow-2xl ${book.icon_white ? 'brightness-0 invert' : ''}`}
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          ) : (
            <GraduationCap size={48} className="text-white/70" />
          )}
        </div>

        {/* Badge */}
        {book.is_free ? (
          <div className="absolute top-3 right-3 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-green-300 tracking-wide">
            FREE
          </div>
        ) : (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-brand-amber/25 backdrop-blur-sm border border-brand-amber/40 px-2.5 py-0.5 text-[11px] font-semibold text-brand-amber tracking-wide">
            <Crown size={9} /> PREMIUM
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta?.pill ?? 'text-text-muted bg-bg-border border-bg-border'}`}>
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${meta?.dot ?? 'bg-text-muted'}`} />
          {book.category}
        </span>

        <div>
          <h3 className="font-display font-bold text-text-primary leading-snug group-hover:text-brand-primary transition-colors duration-200">
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="text-xs text-text-muted mt-0.5 font-medium">{book.subtitle}</p>
          )}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 flex-1">
          {book.description}
        </p>

        {/* Tags */}
        {book.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {book.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-full bg-bg-border px-2.5 py-0.5 text-xs text-text-muted">
                {tag}
              </span>
            ))}
            {book.tags.length > 3 && (
              <span className="rounded-full bg-bg-border px-2.5 py-0.5 text-xs text-text-muted">
                +{book.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-1">
          {book.is_free ? (
            <a
              href={book.read_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-bg-border bg-bg-surface py-2.5 text-sm font-medium text-text-secondary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200"
            >
              <BookOpen size={14} /> Read Online <ExternalLink size={12} className="opacity-50" />
            </a>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber/8 py-2.5 text-sm font-medium text-brand-amber hover:bg-brand-amber/15 transition-all duration-200"
            >
              <Lock size={14} /> Login to Access
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ComingSoonCard() {
  return (
    <motion.div
      layout
      variants={cardVariants}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-bg-border bg-bg-surface min-h-[320px] p-8 text-center gap-5"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20"
      >
        <Sparkles size={24} className="text-brand-primary" />
      </motion.div>
      <div className="space-y-1.5">
        <p className="font-display font-bold text-text-primary text-lg">More Coming Soon</p>
        <p className="text-sm text-text-muted">
          React, Node.js, Machine Learning,<br />AI Engineering & more
        </p>
      </div>
    </motion.div>
  )
}

const FILTERS = ['All', 'Free', 'Premium']

export default function EbooksPage() {
  const [books, setBooks]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeFilter, setActiveFilter]     = useState('All') // All | Free | Premium

  useEffect(() => {
    ebooksAPI.getAll()
      .then(({ data }) => setBooks(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(books.map(b => b.category).filter(Boolean))]

  const filtered = books.filter(b => {
    const matchCat    = activeCategory === 'All' || b.category === activeCategory
    const matchFilter = activeFilter === 'All'
      || (activeFilter === 'Free' ? b.is_free : !b.is_free)
    return matchCat && matchFilter
  })

  const freeCount    = books.filter(b => b.is_free).length
  const premiumCount = books.filter(b => !b.is_free).length

  return (
    <PageLayout
      title="Courses"
      description="Free and premium courses on Web Development, Python, Data Science, AI, Cloud and more by Aman Raj."
      path="/ebooks"
    >
      {/* Hero */}
      <section className="section-container section-padding pb-0">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl">
          <motion.span variants={fadeUp} className="tag mb-4 inline-block">
            Learning Resources
          </motion.span>
          <motion.h1 variants={fadeUp} className="font-display text-4xl font-bold text-text-primary lg:text-5xl">
            Explore <span className="gradient-text">Courses</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-text-secondary text-lg leading-relaxed">
            {books.length} courses — {freeCount} free &amp; {premiumCount} premium. All managed by Aman.
          </motion.p>

          {/* Pills */}
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: BookOpen, label: `${freeCount} Free`          },
              { icon: Crown,    label: `${premiumCount} Premium`     },
              { icon: Sparkles, label: 'More Coming'                 },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-bg-border bg-bg-elevated px-3.5 py-1.5 text-sm text-text-secondary">
                <Icon size={13} className="text-brand-primary flex-shrink-0" />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Filters + Grid */}
      <section className="section-container pt-10 pb-20">

        {/* Free / Premium toggle */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
          className="flex items-center gap-2 mb-6"
        >
          <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={[
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  activeFilter === f
                    ? f === 'Premium'
                      ? 'bg-brand-amber text-white'
                      : 'bg-brand-primary text-white shadow-glow-primary'
                    : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {f === 'Premium' && <Crown size={12} className="inline mr-1 -mt-0.5" />}
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map(cat => {
            const count = cat === 'All'
              ? filtered.length
              : filtered.filter(b => b.category === cat).length
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-bg-elevated border border-brand-primary/40 text-text-primary'
                    : 'border border-bg-border bg-bg-elevated text-text-secondary hover:text-text-primary hover:border-brand-primary/30'
                }`}
              >
                {cat}
                <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-40'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-bg-border bg-bg-elevated animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${activeFilter}`}
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map(book => (
                <CourseCard key={book.id || book.slug} book={book} />
              ))}
              {activeFilter === 'All' && activeCategory === 'All' && <ComingSoonCard />}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </PageLayout>
  )
}
