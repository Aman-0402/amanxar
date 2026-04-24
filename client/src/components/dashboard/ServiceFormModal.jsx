import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function ServiceFormModal({ isOpen, onClose, onSubmit, service = null }) {
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    title: '',
    icon: '💻',
    description: '',
    features: [],
    pricing: '',
    cta: 'Learn More',
    cta_link: '/contact',
    order: 0,
  })

  const [newFeature, setNewFeature] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (service) {
      setFormData(service)
    } else {
      setFormData({
        id: '',
        slug: '',
        title: '',
        icon: '💻',
        description: '',
        features: [],
        pricing: '',
        cta: 'Learn More',
        cta_link: '/contact',
        order: 0,
      })
    }
    setError('')
    setNewFeature('')
  }, [service, isOpen])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }))
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    const id = `svc-${slug.slice(0, 20)}`

    setFormData((prev) => ({
      ...prev,
      title,
      slug,
      id,
    }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSubmit(formData)
      const successMsg = service ? '✅ Service updated successfully!' : '✅ Service created successfully!'
      alert(successMsg)
      onClose()
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to save service'
      setError(`❌ Error: ${errorMsg}`)
      alert(`❌ Failed to save: ${errorMsg}`)
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
                  {service ? 'Edit Service' : 'Add New Service'}
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
                    placeholder="e.g., Full-Stack Web Development"
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
                    disabled
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary opacity-50"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Slug (auto-generated) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    disabled
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary opacity-50"
                  />
                </div>

                {/* Icon & Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Icon (Emoji) *
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      placeholder="💻"
                      maxLength={5}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

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

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Features
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors text-sm"
                      disabled={isLoading}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {formData.features.length > 0 && (
                    <div className="space-y-2">
                      {formData.features.map((f, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-bg-elevated p-2 rounded-lg">
                          <span className="text-sm text-text-secondary">{f}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="p-1 hover:bg-red-500/10 rounded transition-colors"
                            disabled={isLoading}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing & CTA */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Pricing (Optional)
                    </label>
                    <input
                      type="text"
                      name="pricing"
                      value={formData.pricing}
                      onChange={handleChange}
                      placeholder="e.g., Pricing depends on..."
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      CTA Button Text *
                    </label>
                    <input
                      type="text"
                      name="cta"
                      value={formData.cta}
                      onChange={handleChange}
                      placeholder="Learn More"
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* CTA Link */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    CTA Link *
                  </label>
                  <input
                    type="text"
                    name="cta_link"
                    value={formData.cta_link}
                    onChange={handleChange}
                    placeholder="/contact?service=..."
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    required
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
                      service ? 'Update Service' : 'Create Service'
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
