import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

const PLATFORM_CHOICES = [
  'GitHub',
  'LinkedIn',
  'Twitter',
  'YouTube',
  'Email',
  'Instagram',
  'Facebook',
]

const ICON_NAMES = [
  'Github',
  'Linkedin',
  'Twitter',
  'Youtube',
  'Mail',
  'Instagram',
  'Facebook',
]

export default function SocialLinkFormModal({ isOpen, onClose, link, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon_name: '',
    order: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (link) {
      setFormData(link)
    } else {
      setFormData({
        platform: '',
        url: '',
        icon_name: '',
        order: 0,
      })
    }
    setError('')
  }, [link, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    let newFormData = {
      ...formData,
      [name]: name === 'order' ? parseInt(value) : value,
    }

    // Auto-set icon_name based on platform
    if (name === 'platform') {
      const platformIndex = PLATFORM_CHOICES.indexOf(value)
      if (platformIndex !== -1) {
        newFormData.icon_name = ICON_NAMES[platformIndex]
      }
    }

    setFormData(newFormData)
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
            <div className="w-full max-w-md rounded-2xl border border-bg-border bg-bg-surface shadow-card p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-bg-surface pb-4">
                <h2 className="font-display text-2xl font-bold text-text-primary">
                  {link ? 'Edit Social Link' : 'Add Social Link'}
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
                    Platform
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
                    required
                  >
                    <option value="">Select Platform</option>
                    {PLATFORM_CHOICES.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="e.g., https://github.com/username"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    name="icon_name"
                    value={formData.icon_name}
                    onChange={handleChange}
                    placeholder="Auto-filled based on platform"
                    className="w-full px-4 py-2 rounded-lg border border-bg-border bg-bg-elevated text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">
                    💡 Auto-filled when you select a platform
                  </p>
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
                    {link ? 'Update' : 'Create'}
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
