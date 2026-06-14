import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { modalBackdrop, modalContent } from '@animations/variants'
import { showError } from '@utils/toast'

const MAX_INPUT_MB  = 3
const TARGET_OUT_MB = 1
const CATEGORIES    = ['Design', 'Diagrams', 'Events', 'Certificates', 'Screenshots']

async function compressImage(file) {
  const options = {
    maxSizeMB:          TARGET_OUT_MB,
    maxWidthOrHeight:   1920,
    useWebWorker:       true,
    fileType:           'image/webp',
    initialQuality:     0.85,
  }
  return imageCompression(file, options)
}

export default function GalleryFormModal({ isOpen, onClose, onSubmit, item = null }) {
  const [formData, setFormData] = useState({
    id: '', title: '', description: '',
    category: 'Design', image: null, imagePreview: '',
    year: new Date().getFullYear(), order: 0,
  })
  const [isLoading,     setIsLoading]     = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [fileInfo,      setFileInfo]      = useState(null)
  const [error,         setError]         = useState('')

  useEffect(() => {
    setError('')
    setFileInfo(null)
    if (item) {
      setFormData({ ...item, image: null, imagePreview: item.image })
    } else {
      setFormData({
        id: '', title: '', description: '',
        category: 'Design', image: null, imagePreview: '',
        year: new Date().getFullYear(), order: 0,
      })
    }
  }, [item, isOpen])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }))
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev, title,
      id: title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
    }))
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Select a valid image file (PNG, JPG, WebP)')
      showError('Invalid file type')
      e.target.value = ''
      return
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_INPUT_MB) {
      setError(`File too large — max ${MAX_INPUT_MB} MB (yours: ${sizeMB.toFixed(2)} MB)`)
      showError(`File too large — max ${MAX_INPUT_MB} MB`)
      e.target.value = ''
      return
    }

    setError('')
    setIsCompressing(true)
    setFileInfo({ original: sizeMB.toFixed(2), compressed: null })

    try {
      const compressed   = await compressImage(file)
      const compressedMB = compressed.size / (1024 * 1024)
      const preview      = await imageCompression.getDataUrlFromFile(compressed)

      setFormData(prev => ({ ...prev, image: compressed, imagePreview: preview }))
      setFileInfo({
        original:   sizeMB.toFixed(2),
        compressed: compressedMB.toFixed(2),
        saved:      Math.round((1 - compressedMB / sizeMB) * 100),
      })
    } catch {
      showError('Compression failed — uploading original')
      const reader = new FileReader()
      reader.onloadend = () =>
        setFormData(prev => ({ ...prev, image: file, imagePreview: reader.result }))
      reader.readAsDataURL(file)
      setFileInfo({ original: sizeMB.toFixed(2), compressed: sizeMB.toFixed(2), saved: 0 })
    } finally {
      setIsCompressing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const fd = new FormData()
      fd.append('id',          formData.id)
      fd.append('title',       formData.title)
      fd.append('description', formData.description)
      fd.append('category',    formData.category)
      fd.append('year',        formData.year)
      fd.append('order',       formData.order)
      if (formData.image) fd.append('image', formData.image, formData.image.name || 'image.webp')
      await onSubmit(fd)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save'
      setError(msg)
      showError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div variants={modalBackdrop} initial="hidden" animate="visible" exit="exit"
            onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.div variants={modalContent} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-bg-border bg-bg-surface shadow-card p-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-text-primary">
                  {item ? 'Edit Gallery Item' : 'Add Gallery Item'}
                </h2>
                <button onClick={onClose} disabled={isLoading}
                  className="p-2 hover:bg-bg-elevated rounded-lg transition-colors disabled:opacity-50">
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
                  <label className="block text-sm font-medium text-text-primary mb-1">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleTitleChange}
                    placeholder="e.g., AI Resume Builder UI" required disabled={isLoading}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all" />
                </div>

                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">ID (auto-generated)</label>
                  <input type="text" name="id" value={formData.id} onChange={handleChange}
                    disabled className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary opacity-50" />
                </div>

                {/* Category + Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange}
                      required disabled={isLoading}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Year *</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange}
                      required disabled={isLoading}
                      className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    rows="3" required disabled={isLoading}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none" />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Image * <span className="text-text-muted font-normal">(max 3 MB — auto-compressed to ~1 MB)</span>
                  </label>
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    disabled={isLoading || isCompressing}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all" />

                  {/* Compression status */}
                  {isCompressing && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-brand-primary">
                      <Loader2 size={12} className="animate-spin" />
                      Compressing image…
                    </div>
                  )}
                  {fileInfo && !isCompressing && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-text-muted">Original: {fileInfo.original} MB</span>
                      <span className="text-text-muted">→</span>
                      <span className="text-green-400">Compressed: {fileInfo.compressed} MB</span>
                      {fileInfo.saved > 0 && (
                        <span className="rounded-full bg-green-500/15 border border-green-500/30 text-green-400 px-2 py-0.5">
                          -{fileInfo.saved}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Preview */}
                  {formData.imagePreview && (
                    <div className="mt-3 relative group w-fit">
                      <img src={formData.imagePreview} alt="Preview"
                        className="max-h-48 rounded-lg border border-bg-border object-cover" />
                    </div>
                  )}
                  {!formData.imagePreview && (
                    <div className="mt-3 h-24 rounded-lg border border-dashed border-bg-border flex items-center justify-center text-text-muted">
                      <ImageIcon size={24} className="opacity-30" />
                    </div>
                  )}
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleChange}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose} disabled={isLoading}
                    className="flex-1 rounded-lg border border-bg-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading || isCompressing}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : item ? 'Update Item' : 'Add Item'}
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
