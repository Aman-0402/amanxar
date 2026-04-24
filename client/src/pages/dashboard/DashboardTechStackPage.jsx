import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { techStackAPI } from '@services/api'

export default function DashboardTechStackPage() {
  const [techStack, setTechStack] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTechStack()
  }, [])

  const fetchTechStack = async () => {
    try {
      setLoading(true)
      const res = await techStackAPI.getAll()
      setTechStack(res.data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">Tech Stack</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-bg-border bg-bg-surface p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">Categories ({techStack.length})</h2>
        </div>
        <div className="space-y-6">
          {techStack.length > 0 ? (
            techStack.map((cat) => (
              <div key={cat.id} className="p-4 rounded bg-bg-elevated border border-bg-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-primary">{cat.category}</h3>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-bg-border rounded transition-colors">
                      <Edit2 size={16} className="text-text-secondary" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.techs.map((tech) => (
                    <div
                      key={tech.name}
                      className="flex items-center gap-2 bg-bg-border px-2.5 py-1.5 rounded-lg"
                    >
                      {tech.icon && (
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          width={18}
                          height={18}
                          className="h-[18px] w-[18px] object-contain"
                        />
                      )}
                      <span className="text-xs text-text-primary">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-text-muted">No tech stack yet</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
