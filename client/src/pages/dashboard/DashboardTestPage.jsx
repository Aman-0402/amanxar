import { useEffect, useState } from 'react'
import { aboutAPI, projectsAPI } from '@services/api'

export default function DashboardTestPage() {
  const [stats, setStats] = useState(null)
  const [whatIDo, setWhatIDo] = useState(null)
  const [bio, setBio] = useState(null)
  const [highlights, setHighlights] = useState(null)
  const [projects, setProjects] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, whatIDoRes, bioRes, highlightsRes, projectsRes] = await Promise.all([
          aboutAPI.getStats(),
          aboutAPI.getWhatIDo(),
          aboutAPI.getBio(),
          aboutAPI.getHighlights(),
          projectsAPI.getAll(),
        ])

        setStats(statsRes.data)
        setWhatIDo(whatIDoRes.data)
        setBio(bioRes.data)
        setHighlights(highlightsRes.data)
        setProjects(projectsRes.data)
      } catch (err) {
        setError(err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold text-text-primary">API Test</h1>

      {/* Stats */}
      <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Stats ({stats?.length || 0})</h2>
        {stats && stats.length > 0 ? (
          <pre className="bg-bg-elevated p-4 rounded overflow-auto text-sm text-text-secondary">
            {JSON.stringify(stats, null, 2)}
          </pre>
        ) : (
          <p className="text-text-muted">No stats yet</p>
        )}
      </div>

      {/* What I Do */}
      <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">What I Do ({whatIDo?.length || 0})</h2>
        {whatIDo && whatIDo.length > 0 ? (
          <pre className="bg-bg-elevated p-4 rounded overflow-auto text-sm text-text-secondary">
            {JSON.stringify(whatIDo, null, 2)}
          </pre>
        ) : (
          <p className="text-text-muted">No data yet</p>
        )}
      </div>

      {/* Bio */}
      <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Bio ({bio?.length || 0})</h2>
        {bio && bio.length > 0 ? (
          <pre className="bg-bg-elevated p-4 rounded overflow-auto text-sm text-text-secondary">
            {JSON.stringify(bio, null, 2)}
          </pre>
        ) : (
          <p className="text-text-muted">No data yet</p>
        )}
      </div>

      {/* Highlights */}
      <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Highlights ({highlights?.length || 0})</h2>
        {highlights && highlights.length > 0 ? (
          <pre className="bg-bg-elevated p-4 rounded overflow-auto text-sm text-text-secondary">
            {JSON.stringify(highlights, null, 2)}
          </pre>
        ) : (
          <p className="text-text-muted">No data yet</p>
        )}
      </div>

      {/* Projects */}
      <div className="rounded-lg border border-bg-border bg-bg-surface p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Projects ({projects?.length || 0})</h2>
        {projects && projects.length > 0 ? (
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="text-sm p-2 bg-bg-elevated rounded text-text-primary">
                {p.title}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No projects</p>
        )}
      </div>
    </div>
  )
}
