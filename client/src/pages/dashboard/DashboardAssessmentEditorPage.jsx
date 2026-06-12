import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Trash2, Loader2, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp, GripVertical,
  Users, Search, UserPlus, Lock, BarChart2,
  TrendingUp, TrendingDown, Clock, Calendar,
} from 'lucide-react'
import { assessmentsAPI, usersAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import Swal from 'sweetalert2'

const Q_TYPES = [
  { value: 'mcq_single', label: 'Single Choice' },
  { value: 'mcq_multi',  label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
]

// ── Questions tab ─────────────────────────────────────────────────────────────

function QuestionsTab({ id, assessment }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [addingQ, setAddingQ]     = useState(false)

  useEffect(() => {
    assessmentsAPI.getQuestions(id)
      .then(({ data }) => setQuestions(data.map(q => ({ ...q, _open: false }))))
      .catch(() => setError('Failed to load questions'))
      .finally(() => setLoading(false))
  }, [id])

  const addQuestion = async () => {
    setAddingQ(true)
    try {
      const { data } = await assessmentsAPI.createQuestion(id, {
        type: 'mcq_single', text: '', explanation: '', order: questions.length,
      })
      setQuestions(prev => [...prev, { ...data, _open: true }])
    } catch { setError('Failed to add question') }
    finally  { setAddingQ(false) }
  }

  const updateQuestion = async (qId, patch) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...patch } : q))
    try {
      const q = questions.find(q => q.id === qId)
      const u = { ...q, ...patch }
      await assessmentsAPI.updateQuestion(qId, { type: u.type, text: u.text, explanation: u.explanation, order: u.order })
    } catch { setError('Failed to save question') }
  }

  const deleteQuestion = async (qId) => {
    const r = await Swal.fire({ title: 'Delete question?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#ef4444', background: '#0C1628', color: '#EEF4FF' })
    if (!r.isConfirmed) return
    try { await assessmentsAPI.deleteQuestion(qId); setQuestions(prev => prev.filter(q => q.id !== qId)) }
    catch { setError('Failed to delete question') }
  }

  const addOption = async (qId, init = {}) => {
    try {
      const order = questions.find(q => q.id === qId)?.options?.length ?? 0
      const { data } = await assessmentsAPI.createOption(qId, { text: '', is_correct: false, order, ...init })
      setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...(q.options || []), data] } : q))
    } catch { setError('Failed to add option') }
  }

  const addTFOptions = async (qId) => {
    await addOption(qId, { text: 'True', order: 0 })
    await addOption(qId, { text: 'False', order: 1 })
  }

  const updateOption = async (qId, oId, patch) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, ...patch } : o) } : q))
    try { await assessmentsAPI.updateOption(oId, patch) }
    catch { setError('Failed to save option') }
  }

  const deleteOption = async (qId, oId) => {
    try { await assessmentsAPI.deleteOption(oId); setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.filter(o => o.id !== oId) } : q)) }
    catch { setError('Failed to delete option') }
  }

  const setCorrect = (qId, oId, type) => {
    const q = questions.find(q => q.id === qId)
    if (!q) return
    if (type === 'true_false' || type === 'mcq_single') {
      q.options.forEach(o => { if (o.is_correct !== (o.id === oId)) updateOption(qId, o.id, { is_correct: o.id === oId }) })
    } else {
      const cur = q.options.find(o => o.id === oId)
      updateOption(qId, oId, { is_correct: !cur?.is_correct })
    }
  }

  const toggleOpen = (qId) => setQuestions(prev => prev.map(q => q.id === qId ? { ...q, _open: !q._open } : q))

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-primary" /></div>

  return (
    <div className="space-y-4">
      {error && <ErrBanner msg={error} />}

      {questions.length === 0 && !loading && (
        <div className="text-center py-10 text-text-muted rounded-xl border border-dashed border-bg-border">
          <p className="mb-3">No questions yet</p>
          <p className="text-xs">Click "Add Question" below to start building the exam</p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {questions.map((q, idx) => (
          <motion.div key={q.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-bg-elevated/40 transition-colors" onClick={() => toggleOpen(q.id)}>
              <GripVertical size={16} className="text-text-muted shrink-0" />
              <span className="text-xs font-mono text-text-muted shrink-0">Q{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{q.text || <span className="text-text-muted italic">Untitled question</span>}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-text-muted">{Q_TYPES.find(t => t.value === q.type)?.label}</span>
                  <span className="text-xs text-text-muted">{q.options?.length || 0} options</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={e => { e.stopPropagation(); deleteQuestion(q.id) }} className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
                {q._open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </div>
            </div>

            <AnimatePresence initial={false}>
              {q._open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-5 pb-5 space-y-4 border-t border-bg-border">
                    <div className="flex gap-2 pt-4">
                      {Q_TYPES.map(t => (
                        <button key={t.value} type="button" onClick={() => updateQuestion(q.id, { type: t.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${q.type === t.value ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/40' : 'border-bg-border text-text-muted hover:text-text-primary hover:bg-bg-elevated'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Question Text</label>
                      <textarea rows={2} value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })}
                        className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                        placeholder="Enter question text…" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Explanation (shown after submit)</label>
                      <textarea rows={2} value={q.explanation} onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                        className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                        placeholder="Why is this the correct answer?" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-2 block">
                        Answer Options
                        {q.type === 'mcq_multi'  && <span className="ml-2 text-brand-primary">(select all correct)</span>}
                        {q.type === 'mcq_single' && <span className="ml-2 text-brand-primary">(select one correct)</span>}
                      </label>
                      <div className="space-y-2">
                        {(q.options || []).map(o => (
                          <div key={o.id} className="flex items-center gap-3">
                            <button type="button" onClick={() => setCorrect(q.id, o.id, q.type)}
                              className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${o.is_correct ? 'bg-green-500 border-green-500' : 'border-bg-border hover:border-green-500/50'}`}>
                              {o.is_correct && <CheckCircle size={10} className="text-white" />}
                            </button>
                            <input value={o.text} onChange={e => updateOption(q.id, o.id, { text: e.target.value })}
                              className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                              placeholder={`Option ${(q.options || []).indexOf(o) + 1}`} />
                            <button type="button" onClick={() => deleteOption(q.id, o.id)} className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 size={13} /></button>
                          </div>
                        ))}
                      </div>
                      {q.type !== 'true_false' && (
                        <button type="button" onClick={() => addOption(q.id)} className="mt-2 flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-dark transition-colors">
                          <Plus size={13} /> Add Option
                        </button>
                      )}
                      {q.type === 'true_false' && (q.options || []).length === 0 && (
                        <button type="button" onClick={() => addTFOptions(q.id)} className="mt-2 flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-dark transition-colors">
                          <Plus size={13} /> Add True / False options
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      <button onClick={addQuestion} disabled={addingQ}
        className="w-full py-4 rounded-xl border-2 border-dashed border-bg-border text-text-muted hover:border-brand-primary/50 hover:text-brand-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60">
        {addingQ ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        Add Question
      </button>
    </div>
  )
}

// ── Students / Enrollment tab ─────────────────────────────────────────────────

function StudentsTab({ id, isPremium }) {
  const [enrolled, setEnrolled]   = useState([])
  const [allUsers, setAllUsers]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [enrolling, setEnrolling] = useState(null)
  const [removing, setRemoving]   = useState(null)
  const [error, setError]         = useState('')

  useEffect(() => {
    Promise.all([
      assessmentsAPI.getEnrollments(id),
      usersAPI.getAll(),
    ]).then(([e, u]) => {
      setEnrolled(e.data)
      setAllUsers(u.data.filter(u => u.role === 'student' || !u.role))
    }).catch(() => setError('Failed to load')).finally(() => setLoading(false))
  }, [id])

  const enrolledIds = new Set(enrolled.map(e => e.user_id))

  const handleEnroll = async (userId) => {
    setEnrolling(userId)
    try {
      const { data } = await assessmentsAPI.enroll(id, userId)
      setEnrolled(prev => [...prev, data])
    } catch { setError('Failed to enroll student') }
    finally { setEnrolling(null) }
  }

  const handleUnenroll = async (userId) => {
    setRemoving(userId)
    try {
      await assessmentsAPI.unenroll(id, userId)
      setEnrolled(prev => prev.filter(e => e.user_id !== userId))
    } catch { setError('Failed to remove student') }
    finally { setRemoving(null) }
  }

  const filteredUsers = allUsers.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-primary" /></div>

  return (
    <div className="space-y-6">
      {error && <ErrBanner msg={error} />}

      {!isPremium && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-amber/30 bg-brand-amber/10 px-4 py-3 text-sm text-brand-amber">
          <Lock size={14} /> This is a free exam — all students can access it automatically. Enrollment management applies only to premium exams.
        </div>
      )}

      {/* Currently enrolled */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Enrolled Students <span className="text-text-muted font-normal">({enrolled.length})</span>
        </h3>
        {enrolled.length === 0 ? (
          <p className="text-sm text-text-muted">No students enrolled yet.</p>
        ) : (
          <div className="space-y-2">
            {enrolled.map(e => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-bg-border bg-bg-elevated px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-primary/20 border border-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary shrink-0">
                    {(e.full_name || e.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{e.full_name || e.username}</p>
                    <p className="text-xs text-text-muted">@{e.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnenroll(e.user_id)}
                  disabled={removing === e.user_id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {removing === e.user_id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add students */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">Add Students</h3>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, or email…"
            className="w-full rounded-lg border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">{search ? 'No students match search' : 'No students found'}</p>
          ) : filteredUsers.map(u => (
            <div key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-bg-border bg-bg-surface px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-bg-elevated border border-bg-border flex items-center justify-center text-xs font-bold text-text-muted shrink-0">
                  {(u.full_name || u.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{u.full_name || u.username}</p>
                  <p className="text-xs text-text-muted">{u.email || `@${u.username}`}</p>
                </div>
              </div>
              {enrolledIds.has(u.id) ? (
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg font-medium">
                  <CheckCircle size={12} /> Enrolled
                </span>
              ) : (
                <button
                  onClick={() => handleEnroll(u.id)}
                  disabled={enrolling === u.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors font-medium disabled:opacity-50"
                >
                  {enrolling === u.id ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                  Enroll
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Analytics tab ─────────────────────────────────────────────────────────────

function AnalyticsTab({ id, assessment }) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    assessmentsAPI.getAllAttempts(id)
      .then(({ data }) => setAttempts(data))
      .catch(() => setError('Failed to load attempts'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-brand-primary" /></div>

  const completed   = attempts.filter(a => a.status === 'completed')
  const inProgress  = attempts.filter(a => a.status === 'in_progress')
  const passed      = completed.filter(a => a.passed)
  const failed      = completed.filter(a => !a.passed)
  const avgScore    = completed.length ? Math.round(completed.reduce((s, a) => s + a.percentage, 0) / completed.length) : 0

  const fmtDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    })
  }

  const timeTaken = (a) => {
    if (!a.submitted_at || !a.started_at) return '—'
    const ms = new Date(a.submitted_at) - new Date(a.started_at)
    const m  = Math.floor(ms / 60000)
    const s  = Math.floor((ms % 60000) / 1000)
    return `${m}m ${s}s`
  }

  return (
    <div className="space-y-6">
      {error && <ErrBanner msg={error} />}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Enrolled',    value: assessment?.enrolled_count ?? '—', color: 'text-brand-primary',   icon: Users      },
          { label: 'Started',     value: attempts.length,                    color: 'text-brand-secondary', icon: Calendar   },
          { label: 'Completed',   value: completed.length,                   color: 'text-text-primary',    icon: Clock      },
          { label: 'Passed',      value: passed.length,                      color: 'text-green-400',       icon: TrendingUp },
          { label: 'Failed',      value: failed.length,                      color: 'text-red-400',         icon: TrendingDown},
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-bg-border bg-bg-surface p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Avg score bar */}
      {completed.length > 0 && (
        <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Average score</span>
            <span className={`font-bold ${avgScore >= (assessment?.pass_mark ?? 60) ? 'text-green-400' : 'text-red-400'}`}>
              {avgScore}% (pass mark: {assessment?.pass_mark ?? 60}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-bg-elevated overflow-hidden">
            <div className={`h-full rounded-full transition-all ${avgScore >= (assessment?.pass_mark ?? 60) ? 'bg-green-400' : 'bg-red-400'}`}
              style={{ width: `${avgScore}%` }} />
          </div>
        </div>
      )}

      {/* Attempts table */}
      {attempts.length === 0 ? (
        <div className="text-center py-10 text-text-muted rounded-xl border border-dashed border-bg-border">
          <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
          <p>No students have started this exam yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
          <div className="px-5 py-3 border-b border-bg-border bg-bg-elevated/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">All Attempts</h3>
            <span className="text-xs text-text-muted">{attempts.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  {['Student', 'Email', 'Started', 'Submitted', 'Time Taken', 'Score', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {attempts.map(a => (
                  <tr key={a.id} className="hover:bg-bg-elevated/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{a.full_name || a.username}</p>
                        <p className="text-xs text-text-muted">@{a.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{a.email || '—'}</td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{fmtDate(a.started_at)}</td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{fmtDate(a.submitted_at)}</td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1"><Clock size={11} />{timeTaken(a)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'completed' ? (
                        <div className="space-y-1">
                          <span className={`font-semibold text-sm ${a.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {a.percentage}%
                          </span>
                          <div className="h-1 w-16 rounded-full bg-bg-elevated overflow-hidden">
                            <div className={`h-full rounded-full ${a.passed ? 'bg-green-400' : 'bg-red-400'}`}
                              style={{ width: `${a.percentage}%` }} />
                          </div>
                          <p className="text-[11px] text-text-muted">{a.score}/{a.total} correct</p>
                        </div>
                      ) : (
                        <span className="text-text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.status === 'in_progress' ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-brand-amber/10 text-brand-amber border border-brand-amber/30 font-medium">In Progress</span>
                      ) : a.passed ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/30 font-medium">Passed</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-400/10 text-red-400 border border-red-400/30 font-medium">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Error banner helper ───────────────────────────────────────────────────────
function ErrBanner({ msg }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <AlertCircle size={15} /> {msg}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardAssessmentEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState('questions')

  useEffect(() => {
    assessmentsAPI.getById(id)
      .then(({ data }) => setAssessment(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={36} className="animate-spin text-brand-primary" />
    </div>
  )

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/dashboard/assessments')}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-bg-border text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-text-primary truncate">{assessment?.title}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              assessment?.is_free
                ? 'text-brand-primary bg-brand-primary/10 border-brand-primary/30'
                : 'text-brand-amber bg-brand-amber/10 border-brand-amber/30'
            }`}>
              {assessment?.is_free ? 'Free' : 'Premium'}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
              assessment?.is_active
                ? 'text-green-400 bg-green-400/10 border-green-400/30'
                : 'text-text-muted bg-bg-elevated border-bg-border'
            }`}>
              {assessment?.is_active ? 'Active' : 'Draft'}
            </span>
          </div>
          <p className="text-text-muted text-sm mt-0.5">{assessment?.question_count ?? 0} questions · {assessment?.enrolled_count ?? 0} enrolled</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex gap-1 p-1 rounded-xl bg-bg-elevated border border-bg-border w-fit">
        {[
          { key: 'questions',  label: 'Questions', icon: null      },
          { key: 'analytics',  label: 'Analytics', icon: BarChart2 },
          { key: 'students',   label: 'Students',  icon: Users     },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-bg-surface text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {Icon && <Icon size={15} />}
            {label}
            {key === 'students' && !assessment?.is_free && (
              <span className="text-[10px] bg-brand-amber/20 text-brand-amber px-1.5 py-0.5 rounded-full font-semibold">Premium</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <motion.div variants={fadeUp}>
        {tab === 'questions' && <QuestionsTab  id={id} assessment={assessment} />}
        {tab === 'analytics' && <AnalyticsTab  id={id} assessment={assessment} />}
        {tab === 'students'  && <StudentsTab   id={id} isPremium={!assessment?.is_free} />}
      </motion.div>

    </motion.div>
  )
}
