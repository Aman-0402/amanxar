import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Target, CheckCircle, XCircle,
  Loader2, AlertCircle, PlayCircle, Trophy, Tag,
} from 'lucide-react'
import { assessmentsAPI } from '@services/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Components ────────────────────────────────────────────────────────────────

function ProgressBar({ answered, total }) {
  const pct = total ? Math.round((answered / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-text-muted">
        <span>{answered}/{total} answered</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function QuestionCard({ q, idx, answer, onChange, submitted, resultData }) {
  const isMulti   = q.type === 'mcq_multi'
  const selected  = answer || []
  const resultQ   = resultData?.questions?.find(rq => rq.id === q.id)

  const toggle = (oId) => {
    if (submitted) return
    if (isMulti) {
      onChange(selected.includes(oId) ? selected.filter(x => x !== oId) : [...selected, oId])
    } else {
      onChange([oId])
    }
  }

  return (
    <div className="rounded-xl border border-bg-border bg-bg-surface p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-xs font-mono text-text-muted bg-bg-elevated px-2 py-1 rounded-lg mt-0.5">
          Q{idx + 1}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary leading-relaxed">{q.text}</p>
          {isMulti && !submitted && (
            <p className="text-xs text-text-muted mt-1">Select all that apply</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {q.options.map(o => {
          const isSelected = selected.includes(o.id)
          const isCorrect  = resultQ?.correct_ids?.includes(o.id)
          const isWrong    = submitted && isSelected && !isCorrect
          const isMissed   = submitted && !isSelected && isCorrect

          let optClass = 'border-bg-border text-text-secondary hover:border-brand-primary/40 hover:text-text-primary hover:bg-brand-primary/5'
          if (isSelected && !submitted) optClass = 'border-brand-primary bg-brand-primary/10 text-brand-primary'
          if (submitted && isCorrect)   optClass = 'border-green-400 bg-green-400/10 text-green-300'
          if (submitted && isWrong)     optClass = 'border-red-400 bg-red-400/10 text-red-300'
          if (submitted && isMissed)    optClass = 'border-green-400/50 bg-green-400/5 text-green-400/70'

          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              disabled={submitted}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 disabled:cursor-default ${optClass}`}
            >
              <div className={`shrink-0 h-4 w-4 rounded-${isMulti ? 'sm' : 'full'} border-2 flex items-center justify-center transition-colors ${
                isSelected && !submitted ? 'border-brand-primary bg-brand-primary' :
                submitted && isCorrect   ? 'border-green-400 bg-green-400' :
                submitted && isWrong     ? 'border-red-400 bg-red-400' :
                'border-current'
              }`}>
                {isSelected && !submitted && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                {submitted && isCorrect && <CheckCircle size={10} className="text-white" />}
                {submitted && isWrong   && <XCircle    size={10} className="text-white" />}
              </div>
              <span className="flex-1">{o.text}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation (after submit) */}
      {submitted && resultQ?.explanation && (
        <div className="flex items-start gap-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 px-4 py-3 text-sm text-brand-primary/90">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">{resultQ.explanation}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function StudentExamPage() {
  const { id } = useParams()
  const [phase, setPhase]         = useState('loading') // loading | intro | exam | submitting | result
  const [assessment, setAssess]   = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [answers, setAnswers]     = useState({})        // { questionId: [optionId...] }
  const [resultData, setResult]   = useState(null)
  const [timeLeft, setTimeLeft]   = useState(null)
  const [error, setError]         = useState('')
  const timerRef    = useRef(null)
  const answersRef  = useRef(answers)
  const attemptRef  = useRef(attemptId)

  // keep refs in sync
  useEffect(() => { answersRef.current = answers },    [answers])
  useEffect(() => { attemptRef.current = attemptId },  [attemptId])

  // ── Load assessment ──────────────────────────────────────────────────────
  useEffect(() => {
    assessmentsAPI.getById(id)
      .then(({ data }) => {
        setAssess(data)
        const ua = data.user_attempt
        if (ua?.status === 'completed') {
          setAttemptId(ua.id)
          assessmentsAPI.getResult(ua.id).then(r => {
            setResult(r.data)
            setPhase('result')
          }).catch(() => setPhase('result'))
        } else if (ua?.status === 'in_progress') {
          setAttemptId(ua.id)
          setPhase('exam')
          if (data.time_limit) setTimeLeft(data.time_limit * 60)
        } else {
          setPhase('intro')
        }
      })
      .catch(() => {
        setError('Failed to load assessment')
        setPhase('intro')
      })
  }, [id])

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam' || timeLeft === null) return
    if (timeLeft <= 0) { doSubmit(); return }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [phase, timeLeft])

  // ── Start exam ───────────────────────────────────────────────────────────
  const handleStart = async () => {
    try {
      const { data } = await assessmentsAPI.startAttempt(id)
      setAttemptId(data.id)
      if (assessment.time_limit) setTimeLeft(assessment.time_limit * 60)
      setPhase('exam')
    } catch {
      setError('Failed to start exam')
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    const aId = attemptRef.current
    if (!aId) return
    clearTimeout(timerRef.current)
    setPhase('submitting')
    const payload = Object.entries(answersRef.current).map(([qId, opts]) => ({
      question_id:         Number(qId),
      selected_option_ids: opts,
    }))
    try {
      await assessmentsAPI.submitAttempt(aId, { answers: payload })
      const r = await assessmentsAPI.getResult(aId)
      setResult(r.data)
      setPhase('result')
    } catch {
      setError('Failed to submit. Please try again.')
      setPhase('exam')
    }
  }, [])

  const answeredCount = Object.keys(answers).length
  const totalQs       = assessment?.questions?.length || 0

  // ── Render ───────────────────────────────────────────────────────────────

  if (phase === 'loading') return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={36} className="animate-spin text-brand-primary" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        to="/student/assessments"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={15} /> All Assessments
      </Link>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── INTRO phase ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && assessment && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-bg-border bg-bg-surface p-7 space-y-5">
              <div>
                {assessment.category && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full mb-3">
                    <Tag size={10} /> {assessment.category}
                  </span>
                )}
                <h1 className="font-display text-2xl font-bold text-text-primary">{assessment.title}</h1>
                {assessment.description && (
                  <p className="text-text-secondary mt-2 leading-relaxed">{assessment.description}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: CheckCircle, label: 'Questions', value: `${assessment.question_count}` },
                  { icon: Clock,       label: 'Time Limit', value: assessment.time_limit ? `${assessment.time_limit} min` : 'Unlimited' },
                  { icon: Target,      label: 'Pass Mark',  value: `${assessment.pass_mark}%` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-bg-elevated border border-bg-border p-4 text-center">
                    <Icon size={18} className="mx-auto mb-2 text-brand-primary" />
                    <p className="text-lg font-bold text-text-primary">{value}</p>
                    <p className="text-xs text-text-muted">{label}</p>
                  </div>
                ))}
              </div>

              {assessment.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {assessment.tags.map(t => (
                    <span key={t} className="text-xs bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-dark transition-colors shadow-glow-primary"
              >
                <PlayCircle size={18} /> Start Exam
              </button>
            </div>
          </motion.div>
        )}

        {/* ── EXAM phase ─────────────────────────────────────────────────── */}
        {(phase === 'exam' || phase === 'submitting') && assessment && (
          <motion.div
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Sticky exam header */}
            <div className="sticky top-0 z-20 rounded-xl border border-bg-border bg-bg-surface/95 backdrop-blur px-5 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-text-primary truncate">{assessment.title}</h2>
                {timeLeft !== null && (
                  <span className={`flex items-center gap-1.5 text-sm font-mono font-semibold px-3 py-1 rounded-lg ${
                    timeLeft < 60
                      ? 'text-red-400 bg-red-400/10'
                      : timeLeft < 300
                      ? 'text-brand-amber bg-brand-amber/10'
                      : 'text-text-primary bg-bg-elevated'
                  }`}>
                    <Clock size={13} /> {fmt(timeLeft)}
                  </span>
                )}
              </div>
              <ProgressBar answered={answeredCount} total={totalQs} />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {assessment.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  idx={idx}
                  answer={answers[q.id]}
                  onChange={opts => setAnswers(prev => ({ ...prev, [q.id]: opts }))}
                  submitted={false}
                />
              ))}
            </div>

            {/* Submit */}
            <div className="sticky bottom-4">
              <button
                onClick={doSubmit}
                disabled={phase === 'submitting'}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-dark transition-colors shadow-glow-primary disabled:opacity-60"
              >
                {phase === 'submitting'
                  ? <><Loader2 size={18} className="animate-spin" /> Submitting…</>
                  : <>Submit Exam ({answeredCount}/{totalQs} answered)</>
                }
              </button>
            </div>
          </motion.div>
        )}

        {/* ── RESULT phase ───────────────────────────────────────────────── */}
        {phase === 'result' && resultData && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Score card */}
            <div className={`rounded-2xl border p-7 text-center space-y-4 ${
              resultData.passed
                ? 'border-green-400/30 bg-green-400/5'
                : 'border-red-400/30 bg-red-400/5'
            }`}>
              <div className={`h-20 w-20 mx-auto rounded-full flex items-center justify-center ${
                resultData.passed ? 'bg-green-400/15' : 'bg-red-400/15'
              }`}>
                {resultData.passed
                  ? <Trophy size={36} className="text-green-400" />
                  : <XCircle size={36} className="text-red-400" />
                }
              </div>
              <div>
                <p className={`font-display text-5xl font-bold mb-1 ${resultData.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {resultData.percentage}%
                </p>
                <p className="text-xl font-semibold text-text-primary">
                  {resultData.passed ? 'Passed!' : 'Failed'}
                </p>
                <p className="text-text-muted mt-1 text-sm">
                  {resultData.score} / {resultData.total} correct · Pass mark {assessment?.pass_mark}%
                </p>
              </div>
            </div>

            {/* Question review */}
            <div className="space-y-2">
              <h3 className="font-semibold text-text-primary">Question Review</h3>
              {resultData.questions?.map((q, idx) => (
                <div key={q.id} className={`rounded-xl border p-4 ${q.is_correct ? 'border-green-400/20 bg-green-400/5' : 'border-red-400/20 bg-red-400/5'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {q.is_correct
                      ? <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                      : <XCircle    size={16} className="text-red-400 shrink-0 mt-0.5" />
                    }
                    <p className="text-sm font-medium text-text-primary"><span className="text-text-muted mr-2">Q{idx + 1}.</span>{q.text}</p>
                  </div>
                  <div className="space-y-1.5 ml-7">
                    {q.options.map(o => {
                      const isCorrect  = q.correct_ids.includes(o.id)
                      const isSelected = q.selected.includes(o.id)
                      return (
                        <div key={o.id} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                          isCorrect && isSelected ? 'text-green-400 bg-green-400/10'  :
                          isCorrect              ? 'text-green-400/70 bg-green-400/5' :
                          isSelected             ? 'text-red-400 bg-red-400/10'       :
                          'text-text-muted'
                        }`}>
                          {isCorrect ? <CheckCircle size={11} /> : isSelected ? <XCircle size={11} /> : <div className="h-[11px] w-[11px]" />}
                          {o.text}
                          {isCorrect && !isSelected && <span className="ml-auto text-green-400/60">(correct)</span>}
                        </div>
                      )
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 ml-7 flex items-start gap-2 text-xs text-brand-primary/80 bg-brand-primary/10 rounded-lg px-3 py-2">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Link
              to="/student/assessments"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-bg-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors text-sm font-medium"
            >
              <ArrowLeft size={15} /> Back to Assessments
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
