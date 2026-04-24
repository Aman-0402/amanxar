import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'
import { footerSectionsAPI } from '@services/api'

export default function FooterSectionFormModal({ isOpen, onClose, section, onSave }) {
  const [formData, setFormData] = useState({ title: '', order: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (section) {
      setFormData(section)
    } else {
      setFormData({ title: '', order: 0 })
    }
    setError('')
  }, [section, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (section?.id) {
        await footerSectionsAPI.update(section.id, formData)
        alert('✅ Footer section updated successfully!')
      } else {
        await footerSectionsAPI.create(formData)
        alert('✅ Footer section created successfully!')
      }
      onSave()
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save'
      setError(`❌ ${errorMsg}`)
      alert(`❌ Failed to save: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

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
            <div className="w-full max-w-md rounded-2xl border border-bg-border bg-bg-surface shadow-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-text-primary">
                  {section ? 'Edit Section' : 'Add Section'}
                </h2>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-bg-elevated rounded-lg transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Navigation"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>

                <p className="text-xs text-text-muted">
                  💡 Note: You can add links to this section in the dashboard after creating it.
                </p>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary hover:bg-bg-border transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    {section ? 'Update' : 'Create'}
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
