import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function GalleryFormModal({ isOpen, onClose, onSubmit, item = null }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    category: 'Design',
    image: '',
    year: new Date().getFullYear(),
    order: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const CATEGORIES = ['Design', 'Diagrams', 'Events', 'Certificates', 'Screenshots']

  useEffect(() => {
    if (item) {
      setFormData(item)
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
        category: 'Design',
        image: '',
        year: new Date().getFullYear(),
        order: 0,
      })
    }
    setError('')
  }, [item, isOpen])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }))
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      id: title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
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
      setError(err.response?.data?.detail || 'Failed to save gallery item')
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
                  {item ? 'Edit Gallery Item' : 'Add New Gallery Item'}
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
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g., AI Resume Builder UI"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    ID (auto-generated) *
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="gallery-001"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Category & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-h-48 rounded-lg border border-bg-border object-cover"
                        onError={() => setError('Failed to load image preview')}
                      />
                    </div>
                  )}
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
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
                      item ? 'Update Item' : 'Create Item'
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
