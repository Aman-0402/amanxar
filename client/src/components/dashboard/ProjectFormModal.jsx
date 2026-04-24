import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function ProjectFormModal({ isOpen, onClose, onSubmit, project = null }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDesc: '',
    longDesc: '',
    thumbnail: '',
    techStack: [],
    categories: [],
    status: 'completed',
    featured: false,
    year: new Date().getFullYear(),
    duration: '',
    links: { demo: '', github: '' },
    highlights: [],
    images: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (project) {
      setFormData(project)
    } else {
      setFormData({
        title: '',
        slug: '',
        shortDesc: '',
        longDesc: '',
        thumbnail: '',
        techStack: [],
        categories: [],
        status: 'completed',
        featured: false,
        year: new Date().getFullYear(),
        duration: '',
        links: { demo: '', github: '' },
        highlights: [],
        images: [],
      })
    }
    setError('')
  }, [project, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
    }))
  }

  const handleArrayChange = (e, field) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(',').map((item) => item.trim()).filter(Boolean),
    }))
  }

  const handleLinksChange = (e, linkField) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      links: { ...prev.links, [linkField]: value },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-bg-border bg-bg-surface shadow-card z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-text-primary">
                {project ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-bg-elevated rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Short Description *
                </label>
                <textarea
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  rows="2"
                  className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Long Description (Markdown) *
                </label>
                <textarea
                  name="longDesc"
                  value={formData.longDesc}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none font-mono text-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Thumbnail & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Tech Stack & Categories */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.techStack?.join(', ') || ''}
                    onChange={(e) => handleArrayChange(e, 'techStack')}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Categories (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.categories?.join(', ') || ''}
                    onChange={(e) => handleArrayChange(e, 'categories')}
                    placeholder="Web, AI/ML"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Status & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  >
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="live">Live</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="3 months"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.links?.demo || ''}
                    onChange={(e) => handleLinksChange(e, 'demo')}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.links?.github || ''}
                    onChange={(e) => handleLinksChange(e, 'github')}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Highlights (one per line)
                </label>
                <textarea
                  value={formData.highlights?.join('\n') || ''}
                  onChange={(e) => handleArrayChange(e, 'highlights')}
                  rows="3"
                  placeholder="Line 1&#10;Line 2&#10;Line 3"
                  className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Images (one URL per line)
                </label>
                <textarea
                  value={formData.images?.join('\n') || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      images: value.split('\n').map((item) => item.trim()).filter(Boolean),
                    }))
                  }}
                  rows="3"
                  className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded cursor-pointer"
                  disabled={isLoading}
                />
                <label htmlFor="featured" className="text-sm font-medium text-text-primary cursor-pointer">
                  Mark as Featured
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-lg border border-bg-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    project ? 'Update Project' : 'Create Project'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
