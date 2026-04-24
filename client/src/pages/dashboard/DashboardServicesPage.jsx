import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { servicesAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'
import ServiceFormModal from '@components/dashboard/ServiceFormModal'

export default function DashboardServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const res = await servicesAPI.getAll()
      setServices(res.data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data) => {
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, data)
      } else {
        await servicesAPI.create(data)
      }
      setFormModalOpen(false)
      setEditingService(null)
      fetchServices()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await servicesAPI.delete(deleteTarget.id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchServices()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Services</h1>
        <button
          onClick={() => {
            setEditingService(null)
            setFormModalOpen(true)
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-bg-border bg-bg-surface p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-sm">{service.title}</h3>
                <p className="text-xs text-text-muted mt-1">{service.icon}</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary mb-4 line-clamp-2">{service.description}</p>

            <ul className="space-y-1 mb-4">
              {service.features.slice(0, 2).map((f, idx) => (
                <li key={idx} className="text-xs text-text-muted">
                  • {f}
                </li>
              ))}
              {service.features.length > 2 && (
                <li className="text-xs text-text-muted">
                  +{service.features.length - 2} more
                </li>
              )}
            </ul>

            {service.pricing && (
              <p className="text-xs text-brand-primary font-medium mb-3">💰 {service.pricing}</p>
            )}

            {/* Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditingService(service)
                  setFormModalOpen(true)
                }}
                className="p-2 hover:bg-bg-border rounded transition-colors flex-1 flex items-center justify-center"
                title="Edit"
              >
                <Edit2 size={14} className="text-text-secondary" />
              </button>
              <button
                onClick={() => {
                  setDeleteTarget(service)
                  setDeleteModalOpen(true)
                }}
                className="p-2 hover:bg-red-500/10 rounded transition-colors flex-1 flex items-center justify-center"
                title="Delete"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <ServiceFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false)
          setEditingService(null)
        }}
        onSubmit={handleSave}
        service={editingService}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure? This cannot be undone."
      />
    </div>
  )
}
