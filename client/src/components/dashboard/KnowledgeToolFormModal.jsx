import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function KnowledgeToolFormModal({ isOpen, onClose, onSubmit, tool = null, categoryId = null }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    url: '',
    emoji: '🔧',
    category: categoryId || '',
    tags: [],
    pricing: 'free',
    rating: 4,
    featured: false,
    order: 0,
  })

  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const PRICING_OPTIONS = ['free', 'freemium', 'paid']

  useEffect(() => {
    if (tool) {
      setFormData(tool)
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        url: '',
        emoji: '🔧',
        category: categoryId || '',
        tags: [],
        pricing: 'free',
        rating: 4,
        featured: false,
        order: 0,
      })
    }
    setTagInput('')
    setError('')
  }, [tool, categoryId, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }))
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      id: name
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
      setError(err.response?.data?.detail || 'Failed to save tool')
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
                  {tool ? 'Edit Tool' : 'Add New Tool'}
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
                {/* Name & ID */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Tool Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g., Three.js"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      ID (auto-generated) *
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      placeholder="three-js"
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
                    rows="3"
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* URL & Emoji */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      name="url"
                      value={formData.url}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      name="emoji"
                      value={formData.emoji}
                      onChange={handleChange}
                      maxLength="2"
                      placeholder="🔧"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Pricing & Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Pricing *
                    </label>
                    <select
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    >
                      {PRICING_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Rating (1-5) *
                    </label>
                    <input
                      type="number"
                      name="rating"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
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
                          disabled={isLoading}
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

                {/* Order & Featured */}
                <div className="grid grid-cols-2 gap-4">
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

                  <div className="flex items-end">
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
                        Featured
                      </label>
                    </div>
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
                      tool ? 'Update Tool' : 'Create Tool'
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
