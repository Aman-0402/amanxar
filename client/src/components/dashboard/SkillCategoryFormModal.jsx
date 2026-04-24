import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function SkillCategoryFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    category: '',
    icon: '',
    color: '#6366F1',
    skills: [],
  })
  const [skillInput, setSkillInput] = useState('')
  const [skillLevel, setSkillLevel] = useState(80)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        category: '',
        icon: '',
        color: '#6366F1',
        skills: [],
      })
    }
    setSkillInput('')
    setSkillLevel(80)
  }, [initialData, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [
          ...prev.skills,
          { name: skillInput.trim(), level: skillLevel },
        ],
      }))
      setSkillInput('')
      setSkillLevel(80)
    }
  }

  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
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
          {initialData ? 'Edit Skill Category' : 'Add Skill Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Category Name</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Frontend Development"
              className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Icon Name</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g., Layout"
                className="w-full bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Skills</label>
            <div className="space-y-3 mb-3">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 bg-bg-elevated p-2 rounded">
                  <span className="flex-1 text-sm text-text-primary">
                    {skill.name} ({skill.level}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
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
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Skill name"
                className="flex-1 bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={skillLevel}
                onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                className="w-20 bg-bg-elevated border border-bg-border rounded px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm font-medium"
              >
                Add
              </button>
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
