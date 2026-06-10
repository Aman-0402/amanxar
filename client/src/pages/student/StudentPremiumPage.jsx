import { motion } from 'framer-motion'
import { Crown, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fadeUp, staggerContainer } from '@animations/variants'

const PERKS = [
  'All premium ebooks unlocked',
  'Priority support responses',
  'Exclusive video tutorials',
  'Monthly Q&A sessions with Aman',
  'Certificate of completion',
  'Early access to new content',
]

export default function StudentPremiumPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-amber/15 border border-brand-amber/30 mb-4">
          <Crown size={32} className="text-brand-amber" />
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">Premium Access</h1>
        <p className="text-text-secondary">Unlock all ebooks, courses, and exclusive content</p>
      </motion.div>

      {/* Perks card */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-brand-amber/30 bg-bg-surface p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(245,158,11,0.06) 0%, transparent 60%)' }} />

        <div className="relative space-y-4">
          <h2 className="font-display text-lg font-semibold text-text-primary">What's included</h2>
          <ul className="space-y-3">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm text-text-secondary">
                <CheckCircle2 size={16} className="text-brand-amber shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Coming soon / CTA */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-bg-border bg-bg-elevated p-8 text-center">
        <Lock size={28} className="mx-auto text-text-muted mb-3" />
        <h3 className="font-display text-lg font-semibold text-text-primary mb-2">Coming Soon</h3>
        <p className="text-sm text-text-muted mb-6">
          Premium subscriptions are being set up. In the meantime, explore all free ebooks.
        </p>
        <Link
          to="/student/ebooks"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all"
        >
          Browse Free Ebooks <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Interest form placeholder */}
      <motion.div variants={fadeUp} className="rounded-xl border border-bg-border bg-bg-surface p-6 text-center">
        <p className="text-sm text-text-secondary mb-3">Interested in Premium?</p>
        <Link
          to="/student/request"
          className="inline-flex items-center gap-2 text-brand-primary text-sm font-medium hover:text-brand-secondary transition-colors"
        >
          Send a request <ArrowRight size={13} />
        </Link>
      </motion.div>
    </motion.div>
  )
}
