import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Users, BookOpen, ClipboardList,
  MessageSquare, Inbox, ArrowRight, Clock,
} from 'lucide-react'
import { projectsAPI, usersAPI, ebooksAPI, assessmentsAPI, supportAPI, messagesAPI } from '@services/api'
import { useAuth } from '@context/AuthContext'
import { fadeUp, staggerContainer } from '@animations/variants'

const STATUS_COLOR = {
  open:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  replied: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
  closed:  'text-text-muted bg-bg-elevated border-bg-border',
}

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-5 hover:border-brand-primary/30 hover:shadow-card transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {loading ? <span className="inline-block h-8 w-10 rounded bg-bg-elevated animate-pulse" /> : value}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${color}/10`}>
          <Icon size={18} className={color} />
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardOverviewPage() {
  const { user: currentUser } = useAuth()
  const [stats, setStats] = useState({
    students: 0, courses: 0, assessments: 0,
    projects: 0, openTickets: 0, unreadMessages: 0,
  })
  const [recentProjects, setRecentProjects]   = useState([])
  const [recentTickets, setRecentTickets]     = useState([])
  const [recentMessages, setRecentMessages]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      projectsAPI.getAll(),
      usersAPI.getAll(),
      ebooksAPI.getAll(),
      assessmentsAPI.getAll(),
      supportAPI.getAll(),
      messagesAPI.getAll(),
    ]).then(([proj, users, ebooks, assess, tickets, msgs]) => {
      const pData = proj.status    === 'fulfilled' ? proj.value.data    : []
      const uData = users.status   === 'fulfilled' ? users.value.data   : []
      const eData = ebooks.status  === 'fulfilled' ? ebooks.value.data  : []
      const aData = assess.status  === 'fulfilled' ? assess.value.data  : []
      const tData = tickets.status === 'fulfilled' ? tickets.value.data : []
      const mData = msgs.status    === 'fulfilled' ? msgs.value.data    : []

      setStats({
        students:       uData.filter(u => u.role === 'student').length,
        courses:        eData.length,
        assessments:    aData.length,
        projects:       pData.length,
        openTickets:    tData.filter(t => t.status === 'open').length,
        unreadMessages: mData.filter(m => !m.is_read).length,
      })
      setRecentProjects(pData.slice(0, 5))
      setRecentTickets(tData.slice(0, 5))
      setRecentMessages(mData.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: 'Students',        value: stats.students,       icon: Users,         color: 'text-cyan-400'    },
    { label: 'Courses',         value: stats.courses,        icon: BookOpen,      color: 'text-purple-400'  },
    { label: 'Assessments',     value: stats.assessments,    icon: ClipboardList, color: 'text-brand-primary'},
    { label: 'Projects',        value: stats.projects,       icon: FileText,      color: 'text-green-400'   },
    { label: 'Open Tickets',    value: stats.openTickets,    icon: MessageSquare, color: 'text-yellow-400'  },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: Inbox,         color: 'text-brand-amber' },
  ]

  const firstName = currentUser?.full_name?.split(' ')[0] || currentUser?.username || 'Admin'

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-text-secondary mt-1">Here's what's happening on your platform today.</p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {STAT_CARDS.map(card => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </motion.div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Support Tickets */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageSquare size={16} className="text-yellow-400" /> Support Tickets
            </h2>
            <Link to="/dashboard/messages" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-bg-elevated animate-pulse" />
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No support tickets yet</p>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(t => (
                <Link
                  key={t.id}
                  to="/dashboard/messages"
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated/40 hover:bg-bg-elevated transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{t.subject}</p>
                    <p className="text-xs text-text-muted truncate">{t.user_name || t.user_email || '—'}</p>
                  </div>
                  <span className={`ml-3 shrink-0 text-xs font-medium capitalize rounded-full border px-2 py-0.5 ${STATUS_COLOR[t.status] || STATUS_COLOR.open}`}>
                    {t.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <Inbox size={16} className="text-brand-amber" /> Contact Messages
            </h2>
            <Link to="/dashboard/messages" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-bg-elevated animate-pulse" />
              ))}
            </div>
          ) : recentMessages.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-8">No messages yet</p>
          ) : (
            <div className="space-y-2">
              {recentMessages.map(m => (
                <Link
                  key={m.id}
                  to="/dashboard/messages"
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    !m.is_read ? 'bg-brand-amber/5 border border-brand-amber/20 hover:bg-brand-amber/10' : 'bg-bg-elevated/40 hover:bg-bg-elevated'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{m.name || m.email}</p>
                    <p className="text-xs text-text-muted truncate">{m.subject || m.message}</p>
                  </div>
                  {!m.is_read && (
                    <span className="ml-3 shrink-0 h-2 w-2 rounded-full bg-brand-amber" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
            <FileText size={16} className="text-green-400" /> Recent Projects
          </h2>
          <Link to="/dashboard/projects" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-bg-elevated animate-pulse" />
            ))}
          </div>
        ) : recentProjects.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No projects yet</p>
        ) : (
          <div className="space-y-2">
            {recentProjects.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated/40 hover:bg-bg-elevated transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{project.title}</p>
                  {project.techStack?.length > 0 && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{project.techStack.join(', ')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  {project.featured && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium border ${
                    project.status === 'completed'
                      ? 'bg-green-400/10 text-green-400 border-green-400/20'
                      : 'bg-bg-elevated text-text-muted border-bg-border'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  )
}
