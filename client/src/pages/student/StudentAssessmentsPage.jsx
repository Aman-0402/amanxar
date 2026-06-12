import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList, Tag, Clock, Target, CheckCircle,
  XCircle, PlayCircle, Loader2, AlertCircle, Lock,
} from 'lucide-react'
import { assessmentsAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

const STATUS_META = {
  passed:      { label: 'Passed',      color: 'text-green-400',       bg: 'bg-green-400/10',       border: 'border-green-400/30'      },
  failed:      { label: 'Failed',      color: 'text-red-400',         bg: 'bg-red-400/10',         border: 'border-red-400/30'        },
  in_progress: { label: 'In Progress', color: 'text-brand-amber',     bg: 'bg-brand-amber/10',     border: 'border-brand-amber/30'    },
  not_started: { label: 'Not Started', color: 'text-text-muted',      bg: 'bg-bg-elevated',        border: 'border-bg-border'         },
}

function getStatus(attempt) {
  if (!attempt) return 'not_started'
  if (attempt.status === 'in_progress') return 'in_progress'
  return attempt.passed ? 'passed' : 'failed'
}

export default function StudentAssessmentsPage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    assessmentsAPI.getAll()
      .then(({ data }) => setItems(data))
      .catch(() => setError('Failed to load assessments'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(a => {
    if (filter === 'free')      return a.is_free
    if (filter === 'premium')   return !a.is_free
    if (filter === 'completed') return a.user_attempt?.status === 'completed'
    if (filter === 'pending')   return !a.user_attempt || a.user_attempt.status === 'in_progress'
    return true
  })

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-display text-3xl font-bold text-text-primary">Assessments</h1>
        <p className="text-text-secondary mt-1">Test your knowledge and track your progress</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
        {[
          { key: 'all',       label: 'All'       },
          { key: 'free',      label: 'Free'      },
          { key: 'premium',   label: 'Premium'   },
          { key: 'pending',   label: 'Not Done'  },
          { key: 'completed', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === key
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'border-bg-border text-text-muted hover:text-text-primary hover:bg-bg-elevated'
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
          <p>No assessments found</p>
        </div>
      ) : (
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(item => {
            const status = getStatus(item.user_attempt)
            const meta   = STATUS_META[status]
            const isPremium = !item.is_free

            return (
              <div
                key={item.id}
                className="rounded-xl border border-bg-border bg-bg-surface flex flex-col overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200"
              >
                {/* Card body */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-text-primary leading-snug">{item.title}</h3>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color} ${meta.bg} ${meta.border}`}>
                      {meta.label}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-sm text-text-muted line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    {item.category && (
                      <span className="flex items-center gap-1"><Tag size={11} />{item.category}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <ClipboardList size={11} />{item.question_count} Qs
                    </span>
                    {item.time_limit && (
                      <span className="flex items-center gap-1"><Clock size={11} />{item.time_limit} min</span>
                    )}
                    <span className="flex items-center gap-1"><Target size={11} />Pass: {item.pass_mark}%</span>
                  </div>

                  {/* Score bar (if attempted) */}
                  {item.user_attempt?.status === 'completed' && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Your score</span>
                        <span className={`font-semibold ${item.user_attempt.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {item.user_attempt.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${item.user_attempt.passed ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ width: `${item.user_attempt.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[11px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA footer */}
                <div className="px-5 pb-5">
                  {isPremium ? (
                    <div className="flex items-center gap-2 justify-center py-2.5 rounded-xl border border-brand-amber/30 bg-brand-amber/10 text-brand-amber text-sm font-medium">
                      <Lock size={14} /> Premium
                    </div>
                  ) : status === 'not_started' ? (
                    <Link
                      to={`/student/assessments/${item.id}`}
                      className="flex items-center gap-2 justify-center w-full py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors shadow-glow-primary"
                    >
                      <PlayCircle size={15} /> Start Exam
                    </Link>
                  ) : status === 'in_progress' ? (
                    <Link
                      to={`/student/assessments/${item.id}`}
                      className="flex items-center gap-2 justify-center w-full py-2.5 rounded-xl bg-brand-amber text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <PlayCircle size={15} /> Continue
                    </Link>
                  ) : (
                    <Link
                      to={`/student/assessments/${item.id}`}
                      className={`flex items-center gap-2 justify-center w-full py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
                        item.user_attempt.passed
                          ? 'border-green-400/30 text-green-400 hover:bg-green-400/10'
                          : 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                      }`}
                    >
                      {item.user_attempt.passed
                        ? <><CheckCircle size={15} /> View Results</>
                        : <><XCircle size={15} /> View Results</>
                      }
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
