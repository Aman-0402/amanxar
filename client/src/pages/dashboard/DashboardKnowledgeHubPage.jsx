import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { knowledgeHubAPI, knowledgeToolsAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import KnowledgeHubCategoryFormModal from '@components/dashboard/KnowledgeHubCategoryFormModal'
import KnowledgeToolFormModal from '@components/dashboard/KnowledgeToolFormModal'

export default function DashboardKnowledgeHubPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteType, setDeleteType] = useState(null)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [toolFormOpen, setToolFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingTool, setEditingTool] = useState(null)
  const [toolCategoryId, setToolCategoryId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await knowledgeHubAPI.getCategories()
      setCategories(res.data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return
    try {
      await knowledgeHubAPI.deleteCategory(deleteTarget.id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteTool = async () => {
    if (!deleteTarget) return
    try {
      await knowledgeToolsAPI.delete(deleteTarget.id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = () => {
    if (deleteType === 'category') {
      handleDeleteCategory()
    } else if (deleteType === 'tool') {
      handleDeleteTool()
    }
  }

  const handleSaveCategory = async (data) => {
    try {
      if (editingCategory) {
        await knowledgeHubAPI.updateCategory(editingCategory.id, data)
      } else {
        await knowledgeHubAPI.createCategory(data)
      }
      setCategoryFormOpen(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveTool = async (data) => {
    try {
      if (editingTool) {
        await knowledgeToolsAPI.update(editingTool.id, data)
      } else {
        await knowledgeToolsAPI.create(data)
      }
      setToolFormOpen(false)
      setEditingTool(null)
      setToolCategoryId(null)
      fetchCategories()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Knowledge Hub</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Categories ({categories.length})</h2>
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryFormOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.id} className="border border-bg-border rounded-lg bg-bg-elevated overflow-hidden">
                <div
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-bg-border/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-text-primary">{cat.label}</h3>
                    <p className="text-xs text-text-muted mt-1">{cat.description}</p>
                    <div className="text-xs text-text-muted mt-2">
                      {cat.tools.length} tools | Icon: {cat.icon_name} | Color: {cat.color}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingCategory(cat)
                        setCategoryFormOpen(true)
                      }}
                      className="p-2 hover:bg-bg-border rounded transition-colors"
                      title="Edit category"
                    >
                      <Edit2 size={16} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(cat)
                        setDeleteType('category')
                        setDeleteModalOpen(true)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                    {expandedCategory === cat.id ? (
                      <ChevronUp size={18} className="text-text-muted" />
                    ) : (
                      <ChevronDown size={18} className="text-text-muted" />
                    )}
                  </div>
                </div>

                {/* Tools list */}
                {expandedCategory === cat.id && (
                  <div className="border-t border-bg-border p-4 space-y-3">
                    <button
                      onClick={() => {
                        setToolCategoryId(cat.id)
                        setEditingTool(null)
                        setToolFormOpen(true)
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded bg-bg-border text-text-primary hover:bg-bg-border/80 transition-colors text-xs w-full justify-center"
                    >
                      <Plus size={14} />
                      Add Tool to this Category
                    </button>

                    {cat.tools.length > 0 ? (
                      cat.tools.map((tool) => (
                        <div key={tool.id} className="p-3 bg-bg-surface rounded border border-bg-border/50 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{tool.emoji}</span>
                              <h4 className="text-sm font-medium text-text-primary">{tool.name}</h4>
                            </div>
                            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{tool.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                tool.pricing === 'free' ? 'bg-green-500/15 text-green-400' :
                                tool.pricing === 'freemium' ? 'bg-yellow-500/15 text-yellow-400' :
                                'bg-red-500/15 text-red-400'
                              }`}>
                                {tool.pricing}
                              </span>
                              {tool.featured && (
                                <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/15 text-brand-primary">
                                  Featured
                                </span>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded bg-bg-border text-text-muted">
                                ⭐ {tool.rating}/5
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => window.open(tool.url, '_blank')}
                              className="p-2 hover:bg-bg-border rounded transition-colors"
                              title="Open URL"
                            >
                              <ExternalLink size={14} className="text-text-secondary" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingTool(tool)
                                setToolCategoryId(tool.category)
                                setToolFormOpen(true)
                              }}
                              className="p-2 hover:bg-bg-border rounded transition-colors"
                              title="Edit tool"
                            >
                              <Edit2 size={14} className="text-text-secondary" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(tool)
                                setDeleteType('tool')
                                setDeleteModalOpen(true)
                              }}
                              className="p-2 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted">No tools in this category</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-text-muted">No categories yet</p>
          )}
        </div>
      </motion.div>

      <KnowledgeHubCategoryFormModal
        isOpen={categoryFormOpen}
        onClose={() => {
          setCategoryFormOpen(false)
          setEditingCategory(null)
        }}
        onSubmit={handleSaveCategory}
        category={editingCategory}
      />

      <KnowledgeToolFormModal
        isOpen={toolFormOpen}
        onClose={() => {
          setToolFormOpen(false)
          setEditingTool(null)
          setToolCategoryId(null)
        }}
        onSubmit={handleSaveTool}
        tool={editingTool}
        categoryId={toolCategoryId}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
          setDeleteType(null)
        }}
        onConfirm={handleDelete}
        title={deleteType === 'category' ? 'Delete Category' : 'Delete Tool'}
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
