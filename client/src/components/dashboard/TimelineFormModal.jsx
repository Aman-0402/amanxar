import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function TimelineFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    year: '',
    title: '',
    type: 'milestone',
    description: '',
    tags: [],
    order: 0,
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      setTagInput('')
    } else {
      setFormData({
        year: '',
        title: '',
        type: 'milestone',
        description: '',
        tags: [],
        order: 0,
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...new Set([...prev.tags, tagInput.trim()])],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-bg-surface border border-bg-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text-primary mb-4">
          {initialData ? 'Edit Timeline Item' : 'Add Timeline Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Year</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2025"
                className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              >
                <option value="education">Education</option>
                <option value="work">Work</option>
                <option value="milestone">Milestone</option>
                <option value="launch">Launch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Launched aman.ai"
              className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description of the timeline event..."
              rows="4"
              className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1 bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 bg-brand-primary/15 text-brand-primary px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded bg-bg-elevated text-text-secondary hover:bg-bg-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors font-medium"
            >
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
