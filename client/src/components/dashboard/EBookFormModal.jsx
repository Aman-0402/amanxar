import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function EBookFormModal({ isOpen, onClose, onSubmit, ebook = null }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    category: 'Web Development',
    tags: [],
    gradient: 'from-blue-500 to-indigo-600',
    icon: '',
    icon_white: false,
    read_url: '',
    is_free: true,
    order: 0,
  })

  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const CATEGORIES = [
    'Web Development',
    'Data Science & AI',
    'Cloud & DevOps',
    'Languages',
    'Networking',
  ]

  const GRADIENTS = [
    'from-orange-500 to-red-500',
    'from-yellow-300 to-yellow-500',
    'from-green-600 to-emerald-800',
    'from-slate-500 to-slate-800',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-700',
    'from-orange-400 to-amber-600',
    'from-zinc-600 to-zinc-900',
    'from-red-500 to-orange-600',
    'from-cyan-500 to-teal-700',
  ]

  useEffect(() => {
    if (ebook) {
      setFormData(ebook)
      setTagInput('')
    } else {
      setFormData({
        title: '',
        slug: '',
        subtitle: '',
        description: '',
        category: 'Web Development',
        tags: [],
        gradient: 'from-blue-500 to-indigo-600',
        icon: '',
        icon_white: false,
        read_url: '',
        is_free: true,
        order: 0,
      })
      setTagInput('')
    }
    setError('')
  }, [ebook, isOpen])

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

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
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
      setError(err.response?.data?.detail || 'Failed to save eBook')
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
                  {ebook ? 'Edit eBook' : 'Add New eBook'}
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
                {/* Title & Slug */}
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

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Subtitle *
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
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

                {/* Category & Gradient */}
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
                      Gradient *
                    </label>
                    <select
                      name="gradient"
                      value={formData.gradient}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    >
                      {GRADIENTS.map((grad) => (
                        <option key={grad} value={grad}>
                          {grad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Icon URL */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Icon URL *
                  </label>
                  <input
                    type="url"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="https://cdn.example.com/icon.svg"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                  {formData.icon && (
                    <div className="mt-2">
                      <img
                        src={formData.icon}
                        alt="Icon preview"
                        className={`h-16 w-16 rounded-lg border border-bg-border object-contain ${formData.icon_white ? 'bg-bg-elevated' : ''}`}
                        onError={() => setError('Failed to load icon preview')}
                      />
                    </div>
                  )}
                </div>

                {/* Read URL */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Read URL *
                  </label>
                  <input
                    type="url"
                    name="read_url"
                    value={formData.read_url}
                    onChange={handleChange}
                    placeholder="https://aman.example.com/book/"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Tags
                  </label>
                  <div className="space-y-3 mb-3">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-2 bg-bg-elevated p-2 rounded">
                        <span className="flex-1 text-sm text-text-primary">{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="p-1 hover:bg-red-500/10 rounded"
                        >
                          <X size={14} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Add
                    </button>
                  </div>
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

                {/* Checkboxes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="icon_white"
                      name="icon_white"
                      checked={formData.icon_white}
                      onChange={handleChange}
                      className="w-4 h-4 rounded cursor-pointer"
                      disabled={isLoading}
                    />
                    <label htmlFor="icon_white" className="text-sm font-medium text-text-primary cursor-pointer">
                      Icon is white (invert)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_free"
                      name="is_free"
                      checked={formData.is_free}
                      onChange={handleChange}
                      className="w-4 h-4 rounded cursor-pointer"
                      disabled={isLoading}
                    />
                    <label htmlFor="is_free" className="text-sm font-medium text-text-primary cursor-pointer">
                      Free eBook
                    </label>
                  </div>
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
                      ebook ? 'Update eBook' : 'Create eBook'
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
