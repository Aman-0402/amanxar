import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Crown, Briefcase, MessageSquare, ArrowRight } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { ebooksAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

const QUICK_LINKS = [
  { href: '/student/ebooks',   label: 'Browse Ebooks',   desc: 'Free learning resources',       icon: BookOpen,     color: 'text-brand-primary',  bg: 'bg-brand-primary/10' },
  { href: '/student/premium',  label: 'Premium Content', desc: 'Unlock paid ebooks & courses',  icon: Crown,        color: 'text-brand-amber',    bg: 'bg-brand-amber/10'   },
  { href: '/student/services', label: 'Book a Session',  desc: 'Schedule 1:1 with Aman',        icon: Briefcase,    color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
  { href: '/student/request',  label: 'Get Support',     desc: 'Ask questions or report issues', icon: MessageSquare, color: 'text-green-400',      bg: 'bg-green-400/10'    },
]

export default function StudentHomePage() {
  const { user } = useAuth()
  const [ebookCount, setEbookCount] = useState(null)

  useEffect(() => {
    ebooksAPI.getAll()
      .then(({ data }) => setEbookCount(data?.length ?? 0))
      .catch(() => {})
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">

      {/* Welcome banner */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-bg-border bg-bg-surface p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.1) 0%, transparent 60%)' }} />
        <div className="relative">
          <p className="text-label mb-1">Student Portal</p>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            {greeting()},{' '}
            <span className="gradient-text">
              {user?.full_name?.split(' ')[0] || user?.username || 'Student'}
            </span>!
          </h1>
          <p className="text-text-secondary max-w-xl">
            Welcome to Think With Aman learning portal. Explore ebooks, premium content, and book personalised sessions.
          </p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Free Ebooks',     value: ebookCount ?? '…' },
          { label: 'Premium Courses', value: 'Soon'            },
          { label: 'Sessions Booked', value: 0                 },
          { label: 'Support Tickets', value: 0                 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-bg-border bg-bg-surface p-4 text-center">
            <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick access */}
      <motion.div variants={fadeUp}>
        <h2 className="font-display text-lg font-semibold text-text-primary mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(({ href, label, desc, icon: Icon, color, bg }) => (
            <Link
              key={href}
              to={href}
              className="group flex items-center gap-4 rounded-xl border border-bg-border bg-bg-surface p-5 hover:border-brand-primary/30 hover:shadow-card transition-all duration-200"
            >
              <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">{label}</p>
                <p className="text-sm text-text-muted">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
