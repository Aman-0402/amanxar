import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function FooterCTAFormModal({ isOpen, onClose, cta, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    badge_text: '',
    heading: '',
    button_text: '',
    button_url: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (cta) {
      setFormData({
        badge_text: cta.badge_text,
        heading: cta.heading,
        button_text: cta.button_text,
        button_url: cta.button_url,
      })
    } else {
      setFormData({
        badge_text: '',
        heading: '',
        button_text: '',
        button_url: '',
      })
    }
    setError('')
  }, [cta, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSave(formData)
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
                  Edit Footer CTA
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
                    Badge Text
                  </label>
                  <input
                    type="text"
                    name="badge_text"
                    value={formData.badge_text}
                    onChange={handleChange}
                    placeholder="e.g., Open to opportunities"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Heading
                  </label>
                  <textarea
                    name="heading"
                    value={formData.heading}
                    onChange={handleChange}
                    placeholder="e.g., Let's build something amazing together"
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="button_text"
                    value={formData.button_text}
                    onChange={handleChange}
                    placeholder="e.g., Get in touch"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Button URL
                  </label>
                  <input
                    type="text"
                    name="button_url"
                    value={formData.button_url}
                    onChange={handleChange}
                    placeholder="e.g., /contact"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                </div>

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
                    Update
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
