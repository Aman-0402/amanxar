import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Library, ExternalLink, BookOpen, Crown, Tag,
} from 'lucide-react'
import { learningAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function StudentMyLearningPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await learningAPI.getAll()
      setItems(data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Library size={22} className="text-brand-primary" />
            My Learning
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? '…' : `${items.length} course${items.length !== 1 ? 's' : ''} in your library`}
          </p>
        </div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-primary/30 bg-brand-primary/8 text-brand-primary text-sm font-medium hover:bg-brand-primary/15 transition-colors shrink-0"
        >
          <BookOpen size={14} /> Browse More Courses
        </Link>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div variants={fadeUp} className="text-center py-24 space-y-4">
          <Library size={52} className="mx-auto opacity-20 text-text-muted" />
          <p className="text-text-secondary text-sm">Your learning library is empty.</p>
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            <BookOpen size={14} /> Explore Courses
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                layout
                className="group rounded-xl border border-bg-border bg-bg-surface overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200 flex flex-col"
              >
                {/* Cover */}
                <div className={`relative h-40 overflow-hidden flex items-center justify-center ${item.ebook_gradient ? `bg-gradient-to-br ${item.ebook_gradient}` : 'bg-bg-elevated'}`}>
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-black/15 pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
                  <div className="relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">
                    {item.ebook_icon ? (
                      <img src={item.ebook_icon} alt={item.ebook_title} width={64} height={64}
                        className={`h-16 w-16 object-contain drop-shadow-2xl ${item.ebook_icon_white ? 'brightness-0 invert' : ''}`}
                        loading="lazy" onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="opacity-50">
                        {item.ebook_is_free ? <BookOpen size={40} className="text-white" /> : <Crown size={40} className="text-white" />}
                      </div>
                    )}
                  </div>
                  {item.ebook_is_free ? (
                    <span className="absolute top-2 right-2 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-green-300">Free</span>
                  ) : (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand-amber/30 backdrop-blur-sm border border-brand-amber/50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-amber"><Crown size={9} /> Premium</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  {item.ebook_category && (
                    <div className="flex items-center gap-1 text-[11px] text-text-muted uppercase tracking-wide">
                      <Tag size={9} /> {item.ebook_category}
                    </div>
                  )}
                  <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">
                    {item.ebook_title}
                  </h3>
                  {item.ebook_subtitle && (
                    <p className="text-xs text-text-secondary font-medium line-clamp-1">{item.ebook_subtitle}</p>
                  )}
                  {item.ebook_description && (
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{item.ebook_description}</p>
                  )}

                  <div className="mt-auto pt-3">
                    {item.ebook_read_url ? (
                      <a
                        href={item.ebook_read_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold py-2.5 hover:bg-brand-primary hover:text-white transition-all"
                      >
                        <ExternalLink size={12} /> Read Online
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-bg-elevated border border-bg-border text-text-muted text-xs py-2.5">
                        No link available
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
