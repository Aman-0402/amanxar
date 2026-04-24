import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { ebooksAPI } from '@services/api'
import EBookFormModal from '@components/dashboard/EBookFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

export default function DashboardEbooksPage() {
  const [ebooks, setEbooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchEbooks()
  }, [])

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const res = await ebooksAPI.getAll()
      setEbooks(res.data)
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
        await ebooksAPI.update(editingItem.slug, data)
      } else {
        await ebooksAPI.create(data)
      }
      setFormModalOpen(false)
      setEditingItem(null)
      fetchEbooks()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await ebooksAPI.delete(deleteTarget.slug)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchEbooks()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Free eBooks</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">eBooks ({ebooks.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add eBook
          </button>
        </div>
        <div className="space-y-3">
          {ebooks.length > 0 ? (
            ebooks.map((book) => (
              <div key={book.slug} className="p-4 rounded bg-bg-elevated border border-bg-border">
                <div className="flex items-start gap-4 justify-between">
                  {/* Left side: Text content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-text-primary">{book.title}</h3>
                    <p className="text-xs text-text-muted mt-1">{book.subtitle}</p>
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2">{book.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        book.category === 'Web Development' ? 'bg-brand-primary/15 text-brand-primary' :
                        book.category === 'Data Science & AI' ? 'bg-amber-400/15 text-amber-400' :
                        book.category === 'Cloud & DevOps' ? 'bg-sky-400/15 text-sky-400' :
                        book.category === 'Languages' ? 'bg-purple-400/15 text-purple-400' :
                        book.category === 'Networking' ? 'bg-emerald-400/15 text-emerald-400' :
                        'bg-text-muted/15 text-text-muted'
                      }`}>
                        {book.category}
                      </span>
                      {book.is_free && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/15 text-green-400">
                          Free
                        </span>
                      )}
                      {book.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-bg-border px-2 py-0.5 rounded text-text-muted">
                          {tag}
                        </span>
                      ))}
                      {book.tags.length > 2 && (
                        <span className="text-xs bg-bg-border px-2 py-0.5 rounded text-text-muted">
                          +{book.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side: Icon and actions */}
                  <div className="flex flex-col items-end gap-3">
                    {book.icon && (
                      <img
                        src={book.icon}
                        alt={book.title}
                        className={`h-12 w-12 object-contain rounded ${book.icon_white ? 'bg-bg-surface p-1' : ''}`}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex gap-1">
                      <button
                        onClick={() => window.open(book.read_url, '_blank')}
                        className="p-2 hover:bg-bg-border rounded transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink size={16} className="text-text-secondary" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(book)
                          setFormModalOpen(true)
                        }}
                        className="p-2 hover:bg-bg-border rounded transition-colors"
                      >
                        <Edit2 size={16} className="text-text-secondary" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(book)
                          setDeleteModalOpen(true)
                        }}
                        className="p-2 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No eBooks yet</p>
          )}
        </div>
      </motion.div>

      <EBookFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSave}
        ebook={editingItem}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete eBook"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
