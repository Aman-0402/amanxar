import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Star, Zap, Users } from 'lucide-react'
import { projectsAPI } from '@services/api'
import { fadeUp, staggerContainer } from '@animations/variants'
import { viewport } from '@animations/transitions'

const STAT_CARDS = [
  { label: 'Total Projects', icon: FileText, color: 'brand-primary' },
  { label: 'Featured', icon: Star, color: 'yellow-400' },
  { label: 'Active', icon: Zap, color: 'green-400' },
  { label: 'Total Views', icon: Users, color: 'cyan-400' },
]

export default function DashboardOverviewPage() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    active: 0,
    views: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await projectsAPI.getAll()
        setProjects(data)

        const featured = data.filter((p) => p.featured).length
        const active = data.filter((p) => p.status === 'completed').length

        setStats({
          total: data.length,
          featured,
          active,
          views: 0,
        })
      } catch (err) {
        setError('Failed to fetch projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const statValues = [stats.total, stats.featured, stats.active, stats.views]

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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {STAT_CARDS.map((card, idx) => {
          const Icon = card.icon
          const value = statValues[idx]

          return (
            <motion.div
              key={card.label}
              variants={fadeUp}
              className="group rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur p-6 hover:border-brand-primary/30 hover:shadow-card transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-text-muted font-medium">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-text-primary mt-2">
                    {value}
                  </p>
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
