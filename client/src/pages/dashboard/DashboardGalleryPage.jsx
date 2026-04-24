import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { galleryAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import GalleryFormModal from '@components/dashboard/GalleryFormModal'

export default function DashboardGalleryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await galleryAPI.getAll()
      setItems(res.data)
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
        await galleryAPI.update(editingItem.id, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await galleryAPI.create(data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      setFormModalOpen(false)
      setEditingItem(null)
      fetchItems()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await galleryAPI.delete(deleteTarget.id)
      alert('✅ Gallery item deleted successfully!')
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete item'
      alert(`❌ Failed to delete: ${errorMsg}`)
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  // Group by category
  const byCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categories = Object.keys(byCategory).sort()

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Gallery</h1>
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

      {categories.map((category) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-bg-border bg-bg-surface p-6"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">
            {category} ({byCategory[category].length})
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byCategory[category].map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-bg-border bg-bg-elevated overflow-hidden hover:border-brand-primary/30 transition-all"
              >
                {/* Image */}
                <div className="relative h-40 w-full bg-bg-base overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-medium text-text-primary text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-text-muted mt-1">{item.year}</p>
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2">{item.description}</p>

                  {/* Actions */}
                  <div className="flex gap-1 mt-3">
                    <button
                      onClick={() => window.open(item.image, '_blank')}
                      className="p-2 hover:bg-bg-border rounded transition-colors flex-1 flex items-center justify-center"
                      title="View image"
                    >
                      <ExternalLink size={14} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setFormModalOpen(true)
                      }}
                      className="p-2 hover:bg-bg-border rounded transition-colors flex-1 flex items-center justify-center"
                      title="Edit"
                    >
                      <Edit2 size={14} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(item)
                        setDeleteModalOpen(true)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors flex-1 flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <GalleryFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSave}
        item={editingItem}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete Gallery Item"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
