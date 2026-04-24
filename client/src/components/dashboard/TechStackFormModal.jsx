import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function TechStackFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    category: '',
    techs: [],
  })
  const [techInput, setTechInput] = useState('')
  const [iconInput, setIconInput] = useState('')
  const [invertInput, setInvertInput] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        category: '',
        techs: [],
      })
    }
    setTechInput('')
    setIconInput('')
    setInvertInput(false)
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTech = () => {
    if (techInput.trim() && iconInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        techs: [
          ...prev.techs,
          { name: techInput.trim(), icon: iconInput.trim(), invert: invertInput },
        ],
      }))
      setTechInput('')
      setIconInput('')
      setInvertInput(false)
    }
  }

  const handleRemoveTech = (index) => {
    setFormData((prev) => ({
      ...prev,
      techs: prev.techs.filter((_, i) => i !== index),
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
          {initialData ? 'Edit Tech Stack Category' : 'Add Tech Stack Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Category Name</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Frontend"
              className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Technologies</label>
            <div className="space-y-2 mb-3">
              {formData.techs.map((tech, index) => (
                <div key={index} className="flex items-center gap-2 bg-bg-elevated p-2 rounded">
                  {tech.icon && (
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 object-contain"
                    />
                  )}
                  <span className="flex-1 text-sm text-text-primary">{tech.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(index)}
                    className="p-1 hover:bg-red-500/10 rounded"
                  >
                    <X size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Tech name (e.g., React.js)"
                className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
              <input
                type="text"
                value={iconInput}
                onChange={(e) => setIconInput(e.target.value)}
                placeholder="Icon URL (e.g., https://...)"
                className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertInput}
                    onChange={(e) => setInvertInput(e.target.checked)}
                    className="rounded"
                  />
                  Invert color (for dark icons)
                </label>
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="ml-auto px-3 py-2 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
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
