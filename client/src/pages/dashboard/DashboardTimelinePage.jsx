import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { timelineAPI } from '@services/api'
import TimelineFormModal from '@components/dashboard/TimelineFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

export default function DashboardTimelinePage() {
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const res = await timelineAPI.getAll()
      setTimeline(res.data)
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
        await timelineAPI.update(editingItem.id, data)
      } else {
        await timelineAPI.create(data)
      }
      setFormModalOpen(false)
      setEditingItem(null)
      fetchTimeline()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await timelineAPI.delete(deleteTarget.id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchTimeline()
    } catch (err) {
      console.error(err)
    }
  }

  const typeColors = {
    education: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    work: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
    milestone: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    launch: 'bg-green-400/10 text-green-400 border-green-400/20',
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Timeline / Journey</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Timeline Items ({timeline.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
        <div className="space-y-3">
          {timeline.length > 0 ? (
            timeline.map((item) => (
              <div key={item.id} className="p-4 rounded bg-bg-elevated border border-bg-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium border ${
                          typeColors[item.type]
                        }`}
                      >
                        {item.year}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-bg-border text-text-secondary">
                        {item.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-text-primary mb-1">{item.title}</h3>
                    <p className="text-xs text-text-muted mb-2">{item.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-brand-primary/15 text-brand-primary px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setFormModalOpen(true)
                      }}
                      className="p-2 hover:bg-bg-border rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(item)
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
            <p className="text-text-muted">No timeline items yet</p>
          )}
        </div>
      </motion.div>

      <TimelineFormModal
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
        title="Delete Timeline Item"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
