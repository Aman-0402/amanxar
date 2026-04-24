import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Trash2, Eye, EyeOff } from 'lucide-react'
import { messagesAPI } from '@services/api'
import DeleteConfirmModal from '@components/dashboard/DeleteConfirmModal'

export default function DashboardMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await messagesAPI.getAll()
      setMessages(res.data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (message) => {
    try {
      await messagesAPI.markAsRead(message.id, { read: !message.read })
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await messagesAPI.delete(deleteTarget.id)
      setDeleteModalOpen(false)
      setDeleteTarget(null)
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
        {unreadCount > 0 && (
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface"
      >
        <div className="p-6 border-b border-bg-border">
          <h2 className="text-xl font-bold text-text-primary">Contact Submissions ({messages.length})</h2>
        </div>

        <div className="divide-y divide-bg-border">
          {messages.length > 0 ? (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 hover:bg-bg-elevated/50 transition-colors ${
                  !message.read ? 'bg-brand-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left side - Message content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-sm font-semibold ${!message.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {message.name}
                      </h3>
                      <span className="text-xs text-text-muted">{message.email}</span>
                      {!message.read && (
                        <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
                      )}
                    </div>

                    <h4 className="font-medium text-text-primary mb-2">{message.subject}</h4>
                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">{message.message}</p>

                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAsRead(message)}
                      className="p-2 hover:bg-bg-border rounded transition-colors"
                      title={message.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {message.read ? (
                        <EyeOff size={16} className="text-text-muted" />
                      ) : (
                        <Eye size={16} className="text-brand-primary" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(message)
                        setDeleteModalOpen(true)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Full message on hover/expand */}
                <div className="mt-4 p-4 rounded bg-bg-elevated">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{message.message}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-text-muted">No messages yet</p>
            </div>
          )}
        </div>
      </motion.div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
      />
    </div>
  )
}
