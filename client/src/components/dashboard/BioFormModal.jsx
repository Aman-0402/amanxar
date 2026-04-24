import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function BioFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    text: '',
    order: 0,
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        text: '',
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
          {initialData ? 'Edit Bio Paragraph' : 'Add Bio Paragraph'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Paragraph Text</label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Bio paragraph content..."
              rows="6"
              className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary resize-none"
            />
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
