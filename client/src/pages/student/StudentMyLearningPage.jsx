import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Library, ExternalLink, Trash2, BookOpen, Crown, Tag, Loader2,
} from 'lucide-react'
import { learningAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function StudentMyLearningPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  const load = useCallback(async () => {
    try {
      const { data } = await learningAPI.getAll()
      setItems(data)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRemove = async (item) => {
    setRemoving(item.id)
    try {
      await learningAPI.remove(item.id)
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch {}
    finally { setRemoving(null) }
  }

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
                {/* Cover placeholder */}
                <div className="h-32 bg-bg-elevated flex items-center justify-center relative overflow-hidden">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <BookOpen size={34} className="text-brand-primary" />
                  </div>
                  <span className="absolute top-2 right-2 rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                    Free
                  </span>
                  {/* Remove btn */}
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={removing === item.id}
                    className="absolute top-2 left-2 h-7 w-7 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/30 transition-all"
                    title="Remove from My Learning"
                  >
                    {removing === item.id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Trash2 size={12} />
                    }
                  </button>
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
                    <p className="text-xs text-text-muted line-clamp-1">{item.ebook_subtitle}</p>
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
