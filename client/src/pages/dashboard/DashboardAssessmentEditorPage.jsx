import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Trash2, Loader2, AlertCircle,
  CheckCircle, ChevronDown, ChevronUp, GripVertical,
} from 'lucide-react'
import { assessmentsAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import Swal from 'sweetalert2'

const Q_TYPES = [
  { value: 'mcq_single', label: 'Single Choice' },
  { value: 'mcq_multi',  label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
]


export default function DashboardAssessmentEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [assessment, setAssessment] = useState(null)
  const [questions, setQuestions]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [addingQ, setAddingQ]       = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [aRes, qRes] = await Promise.all([
        assessmentsAPI.getById(id),
        assessmentsAPI.getQuestions(id),
      ])
      setAssessment(aRes.data)
      setQuestions(qRes.data.map(q => ({ ...q, _open: false, _saving: false })))
    } catch {
      setError('Failed to load assessment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const addQuestion = async () => {
    setAddingQ(true)
    try {
      const { data } = await assessmentsAPI.createQuestion(id, {
        type: 'mcq_single',
        text: '',
        explanation: '',
        order: questions.length,
      })
      setQuestions(prev => [...prev, { ...data, _open: true, _saving: false }])
    } catch {
      setError('Failed to add question')
    } finally {
      setAddingQ(false)
    }
  }

  const updateQuestion = async (qId, patch) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...patch } : q))
    try {
      const q = questions.find(q => q.id === qId)
      const updated = { ...q, ...patch }
      await assessmentsAPI.updateQuestion(qId, {
        type:        updated.type,
        text:        updated.text,
        explanation: updated.explanation,
        order:       updated.order,
      })
    } catch {
      setError('Failed to save question')
    }
  }

  const deleteQuestion = async (qId) => {
    const result = await Swal.fire({
      title: 'Delete question?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
      background: '#0C1628',
      color: '#EEF4FF',
    })
    if (!result.isConfirmed) return
    try {
      await assessmentsAPI.deleteQuestion(qId)
      setQuestions(prev => prev.filter(q => q.id !== qId))
    } catch {
      setError('Failed to delete question')
    }
  }

  const addOption = async (qId, init = {}) => {
    try {
      const order = questions.find(q => q.id === qId)?.options?.length ?? 0
      const { data } = await assessmentsAPI.createOption(qId, {
        text: '', is_correct: false, order, ...init,
      })
      setQuestions(prev => prev.map(q =>
        q.id === qId ? { ...q, options: [...(q.options || []), data] } : q
      ))
    } catch {
      setError('Failed to add option')
    }
  }

  const addTFOptions = async (qId) => {
    await addOption(qId, { text: 'True',  order: 0 })
    await addOption(qId, { text: 'False', order: 1 })
  }

  const updateOption = async (qId, oId, patch) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId
        ? { ...q, options: q.options.map(o => o.id === oId ? { ...o, ...patch } : o) }
        : q
    ))
    try {
      await assessmentsAPI.updateOption(oId, patch)
    } catch {
      setError('Failed to save option')
    }
  }

  const deleteOption = async (qId, oId) => {
    try {
      await assessmentsAPI.deleteOption(oId)
      setQuestions(prev => prev.map(q =>
        q.id === qId ? { ...q, options: q.options.filter(o => o.id !== oId) } : q
      ))
    } catch {
      setError('Failed to delete option')
    }
  }

  const setCorrect = (qId, oId, type) => {
    const q = questions.find(q => q.id === qId)
    if (!q) return

    if (type === 'true_false' || type === 'mcq_single') {
      q.options.forEach(o => {
        const should = o.id === oId
        if (o.is_correct !== should) {
          updateOption(qId, o.id, { is_correct: should })
        }
      })
    } else {
      const current = q.options.find(o => o.id === oId)
      updateOption(qId, oId, { is_correct: !current?.is_correct })
    }
  }

  const toggleOpen = (qId) =>
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, _open: !q._open } : q))

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={36} className="animate-spin text-brand-primary" />
    </div>
  )

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/assessments')}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-bg-border text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">{assessment?.title}</h1>
          <p className="text-text-muted text-sm">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Questions */}
      <AnimatePresence initial={false}>
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border border-bg-border bg-bg-surface overflow-hidden"
          >
            {/* Question header */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-bg-elevated/40 transition-colors"
              onClick={() => toggleOpen(q.id)}
            >
              <GripVertical size={16} className="text-text-muted shrink-0" />
              <span className="text-xs font-mono text-text-muted shrink-0">Q{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {q.text || <span className="text-text-muted italic">Untitled question</span>}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-text-muted">{Q_TYPES.find(t => t.value === q.type)?.label}</span>
                  <span className="text-xs text-text-muted">{q.options?.length || 0} options</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); deleteQuestion(q.id) }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                {q._open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </div>
            </div>

            {/* Question body (expanded) */}
            <AnimatePresence initial={false}>
              {q._open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4 border-t border-bg-border">

                    {/* Type selector */}
                    <div className="flex gap-2 pt-4">
                      {Q_TYPES.map(t => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => updateQuestion(q.id, { type: t.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            q.type === t.value
                              ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/40'
                              : 'border-bg-border text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Question text */}
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Question Text</label>
                      <textarea
                        rows={2}
                        value={q.text}
                        onChange={e => updateQuestion(q.id, { text: e.target.value })}
                        className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                        placeholder="Enter question text…"
                      />
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Explanation (shown after submit)</label>
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                        className="w-full rounded-lg border border-bg-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                        placeholder="Why is this the correct answer?"
                      />
                    </div>

                    {/* Options */}
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-2 block">
                        Answer Options
                        {q.type === 'mcq_multi' && (
                          <span className="ml-2 text-brand-primary">(select all correct)</span>
                        )}
                        {q.type === 'mcq_single' && (
                          <span className="ml-2 text-brand-primary">(select one correct)</span>
                        )}
                      </label>
                      <div className="space-y-2">
                        {(q.options || []).map(o => (
                          <div key={o.id} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setCorrect(q.id, o.id, q.type)}
                              title={q.type === 'mcq_multi' ? 'Toggle correct' : 'Set as correct'}
                              className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                                o.is_correct
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-bg-border hover:border-green-500/50'
                              }`}
                            >
                              {o.is_correct && <CheckCircle size={10} className="text-white" />}
                            </button>
                            <input
                              value={o.text}
                              onChange={e => updateOption(q.id, o.id, { text: e.target.value })}
                              className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/20"
                              placeholder={`Option ${q.options.indexOf(o) + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => deleteOption(q.id, o.id)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {q.type !== 'true_false' && (
                        <button
                          type="button"
                          onClick={() => addOption(q.id)}
                          className="mt-2 flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-dark transition-colors"
                        >
                          <Plus size={13} /> Add Option
                        </button>
                      )}
                      {q.type === 'true_false' && (q.options || []).length === 0 && (
                        <button
                          type="button"
                          onClick={() => addTFOptions(q.id)}
                          className="mt-2 flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-dark transition-colors"
                        >
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

      {/* Add Question */}
      <motion.div variants={fadeUp}>
        <button
          onClick={addQuestion}
          disabled={addingQ}
          className="w-full py-4 rounded-xl border-2 border-dashed border-bg-border text-text-muted hover:border-brand-primary/50 hover:text-brand-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-60"
        >
          {addingQ ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add Question
        </button>
      </motion.div>

    </motion.div>
  )
}
