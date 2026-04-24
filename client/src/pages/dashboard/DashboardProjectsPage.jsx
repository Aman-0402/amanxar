import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2, Plus, Eye } from 'lucide-react'
import { projectsAPI } from '@services/api'
import ProjectFormModal from '@components/dashboard/ProjectFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import { fadeUp, staggerContainer } from '@animations/variants'

export default function DashboardProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form Modal State
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll()
      setProjects(data)
    } catch (err) {
      setError('Failed to fetch projects')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Form Modal Handlers
  const handleOpenAddForm = () => {
    setEditingProject(null)
    setFormModalOpen(true)
  }

  const handleOpenEditForm = (project) => {
    setEditingProject(project)
    setFormModalOpen(true)
  }

  const handleCloseForm = () => {
    setFormModalOpen(false)
    setEditingProject(null)
  }

  const handleFormSubmit = async (formData) => {
    setIsFormSubmitting(true)
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.slug, formData)
      } else {
        await projectsAPI.create(formData)
      }
      await fetchProjects()
      handleCloseForm()
    } catch (err) {
      throw err
    } finally {
      setIsFormSubmitting(false)
    }
  }

  // Delete Modal Handlers
  const handleOpenDeleteModal = (project) => {
    setProjectToDelete(project)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setProjectToDelete(null)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await projectsAPI.delete(projectToDelete.slug)
      await fetchProjects()
      handleCloseDeleteModal()
    } catch (err) {
      console.error('Failed to delete project:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with CTA */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Projects
          </h1>
          <p className="text-text-secondary mt-2">
            Manage your portfolio projects
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-glow-primary hover:bg-brand-dark transition-all duration-200"
        >
          <Plus size={16} />
          Add Project
        </button>
      </motion.div>

      {/* Projects Table */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-bg-border bg-bg-surface/50 backdrop-blur overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            No projects found. Create one to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-bg-border bg-bg-elevated/30">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Tech Stack
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Featured
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Year
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border">
                {projects.map((project, idx) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-bg-elevated/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-text-primary">
                          {project.title}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {project.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.techStack?.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-xs rounded-full bg-brand-primary/10 text-brand-primary"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack?.length > 3 && (
                          <span className="px-2 py-1 text-xs text-text-muted">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        project.status === 'completed'
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-xs ${
                        project.featured
                          ? 'bg-yellow-400/20 text-yellow-400'
                          : 'bg-gray-400/10 text-gray-400'
                      }`}>
                        {project.featured ? '★' : '☆'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {project.year}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => handleOpenEditForm(project)}
                          className="p-2 text-text-muted hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(project)}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        project={editingProject}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={projectToDelete?.title || 'project'}
        isLoading={isDeleting}
      />
    </div>
  )
}
