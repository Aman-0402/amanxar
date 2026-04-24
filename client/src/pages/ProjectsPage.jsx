import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageLayout from '@components/layout/PageLayout'
import { projectsAPI } from '@services/api'
import { assetUrl } from '@utils/assetUrl'

const ALL_CATEGORY = 'All'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(ALL_CATEGORY)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await projectsAPI.getAll()
        setProjects(data)
      } catch (err) {
        setError('Failed to load projects')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const categories = useMemo(() => {
    const cats = projects.flatMap((p) => p.categories || [])
    return [ALL_CATEGORY, ...Array.from(new Set(cats))]
  }, [projects])

  const filtered = useMemo(
    () =>
      active === ALL_CATEGORY
        ? projects
        : projects.filter((p) => p.categories && p.categories.includes(active)),
    [projects, active]
  )

  return (
    <PageLayout
      title="Projects"
      description="Explore Aman Raj's portfolio of web development, AI/ML, MERN stack and Python projects."
      path="/projects"
    >
      <section className="section-container section-padding">
        <h1 className="font-display font-bold text-display-md text-text-primary mb-2">
          Projects
        </h1>
        <p className="text-text-secondary mb-10">
          {isLoading ? 'Loading...' : `${projects.length} projects across web, AI/ML, and more.`}
        </p>

        {error && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`tag ${active === cat ? 'tag-active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Project grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                No projects found in this category.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="rounded-2xl border border-bg-border bg-bg-surface p-6 hover:border-brand-primary/30 transition-all duration-300 block"
                  >
                    {project.thumbnail && (
                      <img
                        src={assetUrl(project.thumbnail)}
                        alt={project.title}
                        className="w-full rounded-lg mb-4 object-cover h-40"
                      />
                    )}
                    <h3 className="font-display font-semibold text-text-primary mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">{project.shortDesc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack && project.techStack.slice(0, 4).map((tech) => (
                        <span key={tech} className="tag text-xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent" />
          </div>
        )}
      </section>
    </PageLayout>
  )
}
