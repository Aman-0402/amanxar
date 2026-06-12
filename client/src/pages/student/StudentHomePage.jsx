import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap, Briefcase, MessageSquare, ArrowRight,
  Sparkles, Clock, TrendingUp, Star,
} from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { ebooksAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

const QUICK_LINKS = [
  {
    href: '/student/courses',
    label: 'Courses',
    desc: 'Free & premium learning resources',
    icon: GraduationCap,
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    border: 'hover:border-brand-primary/40',
  },
  {
    href: '/student/services',
    label: 'Book a Session',
    desc: 'Schedule 1:1 with Aman',
    icon: Briefcase,
    color: 'text-brand-secondary',
    bg: 'bg-brand-secondary/10',
    border: 'hover:border-brand-secondary/40',
  },
  {
    href: '/student/request',
    label: 'Get Support',
    desc: 'Ask questions or report issues',
    icon: MessageSquare,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'hover:border-green-400/40',
  },
]

const TIPS = [
  { icon: Sparkles, text: 'Start with free ebooks — build your foundation first.' },
  { icon: TrendingUp, text: 'Book a 1:1 session to get personalised guidance.' },
  { icon: Star, text: 'Premium content unlocks in-depth AI & tech courses.' },
  { icon: Clock, text: 'Use the Request form to suggest topics you want covered.' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function StudentHomePage() {
  const { user } = useAuth()
  const [courseCount, setCourseCount] = useState(null)

  useEffect(() => {
    ebooksAPI.getAll()
      .then(({ data }) => setCourseCount(data?.length ?? 0))
      .catch(() => {})
  }, [])

  const firstName = user?.full_name?.split(' ')[0] || user?.username || 'Student'

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Welcome banner ────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-bg-border bg-bg-surface relative overflow-hidden"
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.13) 0%, transparent 55%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full mb-3">
              <Sparkles size={12} /> Student Portal
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              {greeting()}, <span className="gradient-text">{firstName}</span>!
            </h1>
            <p className="text-text-secondary text-sm max-w-md leading-relaxed">
              Welcome to Think With Aman learning portal. Explore ebooks, book personalised sessions, and level up your AI skills.
            </p>
          </div>
          <Link
            to="/student/ebooks"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors shadow-glow-primary"
          >
            <BookOpen size={15} /> Start Learning
          </Link>
        </div>
      </motion.div>

      {/* ── Stats row ─────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Free Ebooks',     value: ebookCount ?? '…', color: 'text-brand-primary',   sub: 'available now'   },
          { label: 'Premium Courses', value: 'Soon',            color: 'text-brand-amber',     sub: 'coming soon'     },
          { label: 'Sessions Booked', value: 0,                 color: 'text-brand-secondary', sub: 'schedule more'   },
          { label: 'Support Tickets', value: 0,                 color: 'text-green-400',       sub: 'all resolved'    },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="rounded-xl border border-bg-border bg-bg-surface p-5 flex flex-col gap-1">
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm font-medium text-text-primary">{label}</p>
            <p className="text-xs text-text-muted">{sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Quick access + tips (two column on large) ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick access — takes 2/3 */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-3">
          <h2 className="font-display text-base font-semibold text-text-primary">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map(({ href, label, desc, icon: Icon, color, bg, border }) => (
              <Link
                key={href}
                to={href}
                className={`group flex items-center gap-4 rounded-xl border border-bg-border bg-bg-surface p-5 ${border} hover:shadow-card transition-all duration-200`}
              >
                <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={21} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm">{label}</p>
                  <p className="text-xs text-text-muted mt-0.5">{desc}</p>
                </div>
                <ArrowRight size={15} className="text-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Tips panel — takes 1/3 */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="font-display text-base font-semibold text-text-primary">Tips for You</h2>
          <div className="rounded-xl border border-bg-border bg-bg-surface p-4 space-y-4 h-fit">
            {TIPS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-brand-primary" />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  )
}
