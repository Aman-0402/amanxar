import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Edit2, Trash2, Plus, Eye, Search, Star,
  FolderOpen, CheckCircle, Clock, Loader2,
} from 'lucide-react'
import { projectsAPI } from '@services/api'
import ProjectFormModal from '@components/dashboard/ProjectFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import { fadeUp, staggerContainer } from '@animations/variants'
import { showSuccess, showError } from '@utils/toast'
import { assetUrl } from '@utils/assetUrl'

const STATUS_META = {
  completed:   { label: 'Completed',   color: 'text-green-400 bg-green-400/10 border-green-400/30'      },
  in_progress: { label: 'In Progress', color: 'text-brand-amber bg-brand-amber/10 border-brand-amber/30' },
  archived:    { label: 'Archived',    color: 'text-text-muted bg-bg-elevated border-bg-border'          },
}

const FILTERS = ['all', 'completed', 'in_progress', 'featured']

export default function DashboardProjectsPage() {
  const [projects, setProjects]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')

  const [formModalOpen, setFormModalOpen]     = useState(false)
  const [editingProject, setEditingProject]   = useState(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [isDeleting, setIsDeleting]           = useState(false)
  const [togglingSlug, setTogglingSlug]       = useState(null)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll()
      setProjects(data)
    } catch {
      showError('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (formData, isFormData = false) => {
    setIsFormSubmitting(true)
    try {
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
      if (editingProject) {
        await projectsAPI.update(editingProject.slug, formData, config)
      } else {
        await projectsAPI.create(formData, config)
      }
      await fetchProjects()
      setFormModalOpen(false)
      setEditingProject(null)
    } catch (err) {
      const msg = err.response?.data?.detail ||
        err.response?.data?.[Object.keys(err.response?.data || {})[0]]?.[0] ||
        'Failed to save project'
      showError(`Failed to save: ${msg}`)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await projectsAPI.delete(projectToDelete.slug)
      showSuccess('Project deleted')
      setProjects(prev => prev.filter(p => p.slug !== projectToDelete.slug))
      setDeleteModalOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleFeatured = async (project) => {
    setTogglingSlug(project.slug)
    try {
      await projectsAPI.partialUpdate(project.slug, { featured: !project.featured })
      setProjects(prev => prev.map(p => p.slug === project.slug ? { ...p, featured: !p.featured } : p))
    } catch {
      showError('Failed to update featured status')
    } finally {
      setTogglingSlug(null)
    }
  }

  // Stats
  const totalCompleted = projects.filter(p => p.status === 'completed').length
  const totalFeatured  = projects.filter(p => p.featured).length

  const filterCounts = {
    all:         projects.length,
    completed:   totalCompleted,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    featured:    totalFeatured,
  }

  const filtered = useMemo(() => projects.filter(p => {
    const term = search.toLowerCase()
    const matchSearch = !term ||
      p.title?.toLowerCase().includes(term) ||
      p.shortDesc?.toLowerCase().includes(term) ||
      p.categories?.some(c => c.toLowerCase().includes(term)) ||
      p.techStack?.some(t => t.toLowerCase().includes(term))
    const matchFilter =
      filter === 'all'         ||
      (filter === 'featured'    && p.featured)               ||
      (filter === 'completed'   && p.status === 'completed') ||
      (filter === 'in_progress' && p.status === 'in_progress')
    return matchSearch && matchFilter
  }), [projects, search, filter])

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary mt-1">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => { setEditingProject(null); setFormModalOpen(true) }}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all"
        >
          <Plus size={16} /> Add Project
        </button>
      </motion.div>

      {/* Stats bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        {[
          { label: 'Total',       value: projects.length, color: 'border-bg-border bg-bg-elevated text-text-primary' },
          { label: 'Completed',   value: totalCompleted,  color: 'border-green-500/30 bg-green-500/8 text-green-400' },
          { label: 'Featured',    value: totalFeatured,   color: 'border-brand-amber/30 bg-brand-amber/8 text-brand-amber' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${s.color}`}>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</span>
            <span className="text-sm font-bold">{s.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text" placeholder="Search projects, tech, category…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-bg-border bg-bg-elevated pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-bg-border bg-bg-elevated">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}>
              {f.replace('_', ' ')} <span className="opacity-60">({filterCounts[f]})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-bg-border bg-bg-surface h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-text-muted">
          <FolderOpen size={44} className="mb-3 opacity-30" />
          <p className="text-sm">{search || filter !== 'all' ? 'No projects match filters' : 'No projects yet'}</p>
          {(search || filter !== 'all') && (
            <button onClick={() => { setSearch(''); setFilter('all') }} className="mt-2 text-xs text-brand-primary hover:underline">Clear filters</button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const status = STATUS_META[project.status] ?? { label: project.status, color: 'text-text-muted bg-bg-elevated border-bg-border' }
            const isToggling = togglingSlug === project.slug

            return (
              <motion.div key={project.slug} variants={fadeUp}
                className="group rounded-xl border border-bg-border bg-bg-surface overflow-hidden hover:border-brand-primary/30 hover:shadow-card transition-all duration-200 flex flex-col">

                {/* Thumbnail */}
                <div className="relative h-40 bg-bg-elevated overflow-hidden">
                  {project.thumbnail ? (
                    <img
                      src={assetUrl(project.thumbnail)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen size={40} className="text-text-muted opacity-30" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Status badge top-left */}
                  <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>

                  {/* Featured star top-right */}
                  <button
                    onClick={() => handleToggleFeatured(project)}
                    disabled={isToggling}
                    title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                    className={`absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all disabled:opacity-50 ${
                      project.featured
                        ? 'bg-brand-amber/30 border-brand-amber/50 text-brand-amber hover:bg-red-500/30 hover:border-red-400/50 hover:text-red-400'
                        : 'bg-black/30 border-white/10 text-white/40 hover:bg-brand-amber/30 hover:border-brand-amber/50 hover:text-brand-amber'
                    }`}>
                    {isToggling
                      ? <Loader2 size={11} className="animate-spin" />
                      : <Star size={11} className={project.featured ? 'fill-current' : ''} />
                    }
                  </button>

                  {/* Year badge bottom-left on hover */}
                  <span className="absolute bottom-2 left-2 text-[10px] text-white/70 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
                    {project.year}
                    {project.duration && ` · ${project.duration}`}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-1">{project.title}</h3>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{project.shortDesc}</p>

                  {/* Tech stack */}
                  {project.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {project.techStack.slice(0, 4).map(t => (
                        <span key={t} className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="text-[10px] bg-bg-elevated border border-bg-border text-text-muted px-1.5 py-0.5 rounded">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-3 flex items-center gap-1.5">
                    <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer"
                      title="View public page"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-colors">
                      <Eye size={13} />
                    </a>
                    <button onClick={() => { setEditingProject(project); setFormModalOpen(true) }} title="Edit"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => { setProjectToDelete(project); setDeleteModalOpen(true) }} title="Delete"
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-bg-border text-text-muted hover:text-red-400 hover:border-red-400/30 transition-colors">
                      <Trash2 size={13} />
                    </button>

                    {/* Categories */}
                    {project.categories?.length > 0 && (
                      <span className="ml-auto text-[10px] text-text-muted truncate max-w-24">{project.categories[0]}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <ProjectFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingProject(null) }}
        onSubmit={handleFormSubmit}
        project={editingProject}
        isLoading={isFormSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setProjectToDelete(null) }}
        onConfirm={handleConfirmDelete}
        itemName={projectToDelete?.title || 'project'}
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
