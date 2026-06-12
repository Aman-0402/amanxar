import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Star, Zap, Users, BookOpen } from 'lucide-react'
import { projectsAPI, usersAPI, ebooksAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function DashboardOverviewPage() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({ total: 0, featured: 0, active: 0, users: 0, ebooks: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      projectsAPI.getAll(),
      usersAPI.getAll(),
      ebooksAPI.getAll(),
    ]).then(([proj, users, ebooks]) => {
      const pData = proj.status === 'fulfilled' ? proj.value.data : []
      const uData = users.status === 'fulfilled' ? users.value.data : []
      const eData = ebooks.status === 'fulfilled' ? ebooks.value.data : []

      setProjects(pData)
      setStats({
        total:    pData.length,
        featured: pData.filter(p => p.featured).length,
        active:   pData.filter(p => p.status === 'completed').length,
        users:    uData.filter(u => u.role === 'student' || !u.role).length,
        ebooks:   eData.length,
      })
    }).catch(() => setError('Failed to load data')).finally(() => setIsLoading(false))
  }, [])

  const STAT_CARDS = [
    { label: 'Total Projects', value: stats.total,    icon: FileText, color: 'brand-primary' },
    { label: 'Featured',       value: stats.featured, icon: Star,     color: 'yellow-400'   },
    { label: 'Completed',      value: stats.active,   icon: Zap,      color: 'green-400'    },
    { label: 'Students',       value: stats.users,    icon: Users,    color: 'cyan-400'     },
    { label: 'Courses',        value: stats.ebooks,   icon: BookOpen, color: 'purple-400'   },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-2">
          Welcome back! Here's your portfolio overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              variants={fadeUp}
              className="group rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-6 hover:border-brand-primary/30 hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-text-muted font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-text-primary mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}/10`}>
                  <Icon size={20} className={`text-${card.color}`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-text-primary">
            Recent Projects
          </h2>
          <a
            href="/dashboard/projects"
            className="text-sm text-brand-primary hover:underline"
          >
            View all →
          </a>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No projects yet. Start by adding one!
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-lg bg-bg-elevated/30 hover:bg-bg-elevated transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">
                    {project.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {project.techStack?.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {project.featured && (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-400/10 text-yellow-400 font-medium">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    project.status === 'completed'
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-gray-400/10 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
