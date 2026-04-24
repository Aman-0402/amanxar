import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'
import { driveUrl, extractDriveId } from '@utils/driveUrl'

const MAX_FILE_SIZE = 1024 * 1024 // 1 MB

export default function ProjectFormModal({ isOpen, onClose, onSubmit, project = null }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDesc: '',
    longDesc: '',
    thumbnail: null,
    thumbnailFile: null,
    thumbnailPreview: '',
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

  const [thumbnailId, setThumbnailId] = useState('')
  const [imageIds, setImageIds] = useState('')
  const [useFileUpload, setUseFileUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileSize, setFileSize] = useState('')

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        thumbnailFile: null,
        thumbnailPreview: project.thumbnail || '',
      })
      setThumbnailId('')
      setImageIds(project.images?.join('\n') || '')
      setUseFileUpload(false)
    } else {
      setFormData({
        title: '',
        slug: '',
        shortDesc: '',
        longDesc: '',
        thumbnail: null,
        thumbnailFile: null,
        thumbnailPreview: '',
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
      setThumbnailId('')
      setImageIds('')
      setUseFileUpload(false)
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

  const handleThumbnailIdChange = (e) => {
    const value = e.target.value
    setThumbnailId(value)
    const id = extractDriveId(value)
    setUseFileUpload(false)
    setFormData((prev) => ({
      ...prev,
      thumbnail: id ? driveUrl(id) : '',
      thumbnailFile: null,
      thumbnailPreview: id ? driveUrl(id) : '',
    }))
  }

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileSizeMB = file.size / (1024 * 1024)

    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `❌ File too large! Max size is 1 MB, but your file is ${fileSizeMB.toFixed(2)} MB`
      setError(errorMsg)
      alert(errorMsg)
      e.target.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      const errorMsg = '❌ Please select a valid image file (PNG, JPG, WebP, etc.)'
      setError(errorMsg)
      alert(errorMsg)
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUseFileUpload(true)
      setThumbnailId('')
      setFormData((prev) => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: reader.result,
        thumbnail: null,
      }))
      const fileSizeKB = file.size / 1024
      setFileSize(`✅ File size: ${fileSizeKB.toFixed(2)} KB (Max 1 MB)`)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleImageIdsChange = (e) => {
    const value = e.target.value
    setImageIds(value)
    const urls = value
      .split('\n')
      .map((line) => extractDriveId(line.trim()))
      .filter(Boolean)
      .map((id) => driveUrl(id))
    setFormData((prev) => ({
      ...prev,
      images: urls,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let submitData = formData

      // If using file upload, send as FormData
      if (useFileUpload && formData.thumbnailFile) {
        submitData = new FormData()
        submitData.append('title', formData.title)
        submitData.append('slug', formData.slug)
        submitData.append('shortDesc', formData.shortDesc)
        submitData.append('longDesc', formData.longDesc)
        submitData.append('thumbnail', formData.thumbnailFile)
        submitData.append('techStack', JSON.stringify(formData.techStack))
        submitData.append('categories', JSON.stringify(formData.categories))
        submitData.append('status', formData.status)
        submitData.append('featured', formData.featured)
        submitData.append('year', formData.year)
        submitData.append('duration', formData.duration)
        submitData.append('links', JSON.stringify(formData.links))
        submitData.append('highlights', JSON.stringify(formData.highlights))
        submitData.append('images', JSON.stringify(formData.images))

        await onSubmit(submitData, true)
      } else {
        await onSubmit(submitData, false)
      }

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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-bg-border bg-bg-surface shadow-card p-6">
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
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
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

                {/* Thumbnail Options */}
                <div className="border border-bg-border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!useFileUpload}
                        onChange={() => setUseFileUpload(false)}
                        className="w-4 h-4"
                        disabled={isLoading}
                      />
                      <span className="text-sm font-medium text-text-primary">Google Drive Link</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={useFileUpload}
                        onChange={() => setUseFileUpload(true)}
                        className="w-4 h-4"
                        disabled={isLoading}
                      />
                      <span className="text-sm font-medium text-text-primary">Upload File (Max 1 MB)</span>
                    </label>
                  </div>

                  {!useFileUpload ? (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Thumbnail Google Drive ID
                      </label>
                      <input
                        type="text"
                        value={thumbnailId}
                        onChange={handleThumbnailIdChange}
                        placeholder="Paste Google Drive link or ID"
                        className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        Upload Thumbnail Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-text-muted mt-1">PNG, JPG, WebP (max 1 MB)</p>
                      {fileSize && (
                        <p className="text-xs text-green-400 mt-1">{fileSize}</p>
                      )}
                    </div>
                  )}

                  {formData.thumbnailPreview && (
                    <div className="mt-3">
                      <img
                        src={formData.thumbnailPreview}
                        alt="Thumbnail preview"
                        className="max-h-32 rounded-lg border border-bg-border object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Images (Google Drive IDs) & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Gallery Images (Google Drive IDs, one per line)
                    </label>
                    <textarea
                      value={imageIds}
                      onChange={handleImageIdsChange}
                      rows="3"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-xs text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none font-mono"
                      placeholder="Paste Google Drive links or IDs (one per line)"
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
                      value={formData.techStack.join(', ')}
                      onChange={(e) => handleArrayChange(e, 'techStack')}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="React, Node.js, MongoDB"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Categories (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.categories.join(', ')}
                      onChange={(e) => handleArrayChange(e, 'categories')}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      placeholder="Web Development, Full Stack"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Status & Featured */}
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
                      <option value="planned">Planned</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="w-4 h-4 rounded"
                        disabled={isLoading}
                      />
                      <span className="text-sm font-medium text-text-primary">Mark as Featured</span>
                    </label>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 2 months"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Demo URL
                    </label>
                    <input
                      type="url"
                      value={formData.links.demo}
                      onChange={(e) => handleLinksChange(e, 'demo')}
                      placeholder="https://demo.com"
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
                      value={formData.links.github}
                      onChange={(e) => handleLinksChange(e, 'github')}
                      placeholder="https://github.com/user/repo"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Highlights (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.highlights.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'highlights')}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    placeholder="Responsive Design, Real-time Updates"
                    disabled={isLoading}
                  />
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
