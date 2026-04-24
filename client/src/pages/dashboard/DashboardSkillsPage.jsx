import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { skillsAPI } from '@services/api'
import SkillCategoryFormModal from '@components/dashboard/SkillCategoryFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

export default function DashboardSkillsPage() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      setLoading(true)
      const res = await skillsAPI.getAll()
      setSkills(res.data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        await skillsAPI.update(editingItem.id, data)
      } else {
        await skillsAPI.create(data)
      }
      setFormModalOpen(false)
      setEditingItem(null)
      fetchSkills()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await skillsAPI.delete(deleteTarget.id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchSkills()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Skills Categories</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Categories ({skills.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
        <div className="space-y-3">
          {skills.length > 0 ? (
            skills.map((cat) => (
              <div key={cat.id} className="p-4 rounded bg-bg-elevated border border-bg-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-text-primary">{cat.category}</h3>
                    <p className="text-xs text-text-muted mt-1">
                      Icon: {cat.icon} | Color: {cat.color} | Skills: {cat.skills.length}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill.name}
                          className="text-xs bg-brand-primary/15 text-brand-primary px-2 py-0.5 rounded"
                        >
                          {skill.name} ({skill.level}%)
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(cat)
                        setFormModalOpen(true)
                      }}
                      className="p-2 hover:bg-bg-border rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(cat)
                        setDeleteModalOpen(true)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No skills yet</p>
          )}
        </div>
      </motion.div>

      <SkillCategoryFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSave}
        initialData={editingItem}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete Skill Category"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
