import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { aboutAPI } from '@services/api'
import { getIcon } from '@utils/iconMap'
import StatFormModal from '@components/dashboard/StatFormModal'
import WhatIDoFormModal from '@components/dashboard/WhatIDoFormModal'
import BioFormModal from '@components/dashboard/BioFormModal'
import HighlightFormModal from '@components/dashboard/HighlightFormModal'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

export default function DashboardAboutPage() {
  const [stats, setStats] = useState([])
  const [whatIDo, setWhatIDo] = useState([])
  const [bio, setBio] = useState([])
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [statModalOpen, setStatModalOpen] = useState(false)
  const [whatIDoModalOpen, setWhatIDoModalOpen] = useState(false)
  const [bioModalOpen, setBioModalOpen] = useState(false)
  const [highlightModalOpen, setHighlightModalOpen] = useState(false)

  const [editingItem, setEditingItem] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    console.log('About Page Data:', { stats: stats.length, whatIDo: whatIDo.length, bio: bio.length, highlights: highlights.length })
  }, [stats, whatIDo, bio, highlights])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [statsRes, whatIDoRes, bioRes, highlightsRes] = await Promise.all([
        aboutAPI.getStats(),
        aboutAPI.getWhatIDo(),
        aboutAPI.getBio(),
        aboutAPI.getHighlights(),
      ])
      setStats(statsRes.data)
      setWhatIDo(whatIDoRes.data)
      setBio(bioRes.data)
      setHighlights(highlightsRes.data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStat = async (data) => {
    try {
      if (editingItem?.type === 'stat') {
        await aboutAPI.updateStat(editingItem.id, data)
      } else {
        await aboutAPI.createStat(data)
      }
      setStatModalOpen(false)
      setEditingItem(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const handleWhatIDo = async (data) => {
    try {
      if (editingItem?.type === 'whatido') {
        await aboutAPI.updateWhatIDo(editingItem.id, data)
      } else {
        await aboutAPI.createWhatIDo(data)
      }
      setWhatIDoModalOpen(false)
      setEditingItem(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const handleBio = async (data) => {
    try {
      if (editingItem?.type === 'bio') {
        await aboutAPI.updateBio(editingItem.id, data)
      } else {
        await aboutAPI.createBio(data)
      }
      setBioModalOpen(false)
      setEditingItem(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const handleHighlight = async (data) => {
    try {
      if (editingItem?.type === 'highlight') {
        await aboutAPI.updateHighlight(editingItem.id, data)
      } else {
        await aboutAPI.createHighlight(data)
      }
      setHighlightModalOpen(false)
      setEditingItem(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const { type, id } = deleteTarget
      if (type === 'stat') await aboutAPI.deleteStat(id)
      else if (type === 'whatido') await aboutAPI.deleteWhatIDo(id)
      else if (type === 'bio') await aboutAPI.deleteBio(id)
      else if (type === 'highlight') await aboutAPI.deleteHighlight(id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchAll()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">About Section</h1>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Stats ({stats.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setStatModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Stat
          </button>
        </div>
        <div className="space-y-2">
          {stats.length > 0 ? (
            stats.map((stat) => (
              <div key={stat.id} className="flex items-center gap-3 p-3 rounded bg-bg-elevated">
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">
                    {stat.value} {stat.label}
                  </div>
                  <div className="text-xs text-text-muted">{stat.icon_name}</div>
                </div>
                <button
                  onClick={() => {
                    setEditingItem({ ...stat, type: 'stat' })
                    setStatModalOpen(true)
                  }}
                  className="p-2 hover:bg-bg-border rounded transition-colors"
                >
                  <Edit2 size={16} className="text-text-secondary" />
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({ id: stat.id, type: 'stat' })
                    setDeleteModalOpen(true)
                  }}
                  className="p-2 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No stats yet</p>
          )}
        </div>
      </motion.div>

      {/* What I Do Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">What I Do ({whatIDo.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setWhatIDoModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>
        <div className="space-y-2">
          {whatIDo.length > 0 ? (
            whatIDo.map((item) => (
              <div key={item.id} className="p-3 rounded bg-bg-elevated">
                <div className="flex items-start gap-3">
                  <div className="text-brand-primary mt-1">{getIcon(item.icon_name, { size: 18 })}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">{item.title}</div>
                    <div className="text-xs text-text-muted mt-1">{item.description.substring(0, 100)}...</div>
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-brand-primary/15 text-brand-primary px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingItem({ ...item, type: 'whatido' })
                        setWhatIDoModalOpen(true)
                      }}
                      className="p-2 hover:bg-bg-border rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-text-secondary" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget({ id: item.id, type: 'whatido' })
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
            <p className="text-text-muted">No services yet</p>
          )}
        </div>
      </motion.div>

      {/* Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Bio Paragraphs ({bio.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setBioModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Paragraph
          </button>
        </div>
        <div className="space-y-2">
          {bio.length > 0 ? (
            bio.map((para) => (
              <div key={para.id} className="p-3 rounded bg-bg-elevated flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{para.text.substring(0, 150)}...</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingItem({ ...para, type: 'bio' })
                      setBioModalOpen(true)
                    }}
                    className="p-2 hover:bg-bg-border rounded transition-colors"
                  >
                    <Edit2 size={16} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget({ id: para.id, type: 'bio' })
                      setDeleteModalOpen(true)
                    }}
                    className="p-2 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No paragraphs yet</p>
          )}
        </div>
      </motion.div>

      {/* Highlights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Highlights ({highlights.length})</h2>
          <button
            onClick={() => {
              setEditingItem(null)
              setHighlightModalOpen(true)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Highlight
          </button>
        </div>
        <div className="space-y-2">
          {highlights.length > 0 ? (
            highlights.map((highlight) => (
              <div key={highlight.id} className="flex items-center gap-3 p-3 rounded bg-bg-elevated">
                <div className="flex-1">
                  <div className="text-sm text-text-primary">{highlight.text}</div>
                </div>
                <button
                  onClick={() => {
                    setEditingItem({ ...highlight, type: 'highlight' })
                    setHighlightModalOpen(true)
                  }}
                  className="p-2 hover:bg-bg-border rounded transition-colors"
                >
                  <Edit2 size={16} className="text-text-secondary" />
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({ id: highlight.id, type: 'highlight' })
                    setDeleteModalOpen(true)
                  }}
                  className="p-2 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No highlights yet</p>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <StatFormModal
        isOpen={statModalOpen}
        onClose={() => {
          setStatModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleStat}
        initialData={editingItem?.type === 'stat' ? editingItem : null}
      />

      <WhatIDoFormModal
        isOpen={whatIDoModalOpen}
        onClose={() => {
          setWhatIDoModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleWhatIDo}
        initialData={editingItem?.type === 'whatido' ? editingItem : null}
      />

      <BioFormModal
        isOpen={bioModalOpen}
        onClose={() => {
          setBioModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleBio}
        initialData={editingItem?.type === 'bio' ? editingItem : null}
      />

      <HighlightFormModal
        isOpen={highlightModalOpen}
        onClose={() => {
          setHighlightModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleHighlight}
        initialData={editingItem?.type === 'highlight' ? editingItem : null}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
