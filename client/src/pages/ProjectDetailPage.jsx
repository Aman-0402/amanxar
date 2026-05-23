import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Github, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageLayout from '@components/layout/PageLayout'
import ScreenshotCarousel from '@components/sections/ProjectDetailPage/ScreenshotCarousel'
import { projectsAPI } from '@services/api'
import { assetUrl } from '@utils/assetUrl'
import { imageUrl } from '@utils/imageUrl'

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await projectsAPI.getBySlug(slug)
        setProject(data)
      } catch (err) {
        setError('Failed to load project')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [slug])

  if (isLoading) {
    return (
      <PageLayout title="Loading..." description="Loading project details" path={`/projects/${slug}`}>
        <div className="section-container section-padding flex justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-brand-primary border-t-transparent" />
        </div>
      </PageLayout>
    )
  }

  if (error || !project) return <Navigate to="/projects" replace />

  return (
    <PageLayout
      title={project.title}
      description={project.shortDesc}
      path={`/projects/${project.slug}`}
    >
      <article className="section-container section-padding max-w-prose-lg mx-auto">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-primary transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>

        <h1 className="font-display font-bold text-display-md text-text-primary mb-4">
          {project.title}
        </h1>

        {project.thumbnail && (
          <img
            src={typeof project.thumbnail === 'string' && (project.thumbnail.startsWith('http://') || project.thumbnail.startsWith('https://')) ? project.thumbnail : imageUrl(project.thumbnail)}
            alt={project.title}
            className="w-full rounded-xl mb-6 object-cover max-h-72"
            onError={(e) => console.error('Thumbnail load failed:', project.thumbnail, e)}
          />
        )}

        <div className="prose prose-sm max-w-none text-text-secondary mb-6 [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:text-lg [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-text-secondary [&_p]:mb-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.longDesc}</ReactMarkdown>
        </div>

        {/* Screenshot Carousel */}
        {project.images && project.images.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-semibold text-text-primary text-lg mb-4">Screenshots</h2>
            <ScreenshotCarousel images={project.images} />
          </div>
        )}

        {/* Project Goals */}
        {project.goals && project.goals.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display font-semibold text-text-primary text-lg mb-4">Project Goals</h2>
            <ul className="space-y-2">
              {project.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-brand-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Before/After Comparison */}
        {project.beforeAfterImages && (project.beforeAfterImages.before || project.beforeAfterImages.after) && (
          <div className="mb-8">
            <h2 className="font-display font-semibold text-text-primary text-lg mb-4">Before & After</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.beforeAfterImages.before && (
                <div>
                  <p className="text-sm text-text-muted mb-2 font-medium">Before</p>
                  <img
                    src={project.beforeAfterImages.before.startsWith('http') ? project.beforeAfterImages.before : imageUrl(project.beforeAfterImages.before)}
                    alt="Before"
                    className="w-full rounded-lg border border-bg-border object-cover"
                  />
                </div>
              )}
              {project.beforeAfterImages.after && (
                <div>
                  <p className="text-sm text-text-muted mb-2 font-medium">After</p>
                  <img
                    src={project.beforeAfterImages.after.startsWith('http') ? project.beforeAfterImages.after : imageUrl(project.beforeAfterImages.after)}
                    alt="After"
                    className="w-full rounded-lg border border-bg-border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Desktop Previews */}
        {project.mobileDesktopPreviews && (project.mobileDesktopPreviews.mobile || project.mobileDesktopPreviews.desktop) && (
          <div className="mb-8">
            <h2 className="font-display font-semibold text-text-primary text-lg mb-4">Device Preview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.mobileDesktopPreviews.mobile && (
                <div>
                  <p className="text-sm text-text-muted mb-2 font-medium">Mobile</p>
                  <img
                    src={project.mobileDesktopPreviews.mobile.startsWith('http') ? project.mobileDesktopPreviews.mobile : imageUrl(project.mobileDesktopPreviews.mobile)}
                    alt="Mobile preview"
                    className="w-full rounded-lg border border-bg-border object-cover"
                  />
                </div>
              )}
              {project.mobileDesktopPreviews.desktop && (
                <div>
                  <p className="text-sm text-text-muted mb-2 font-medium">Desktop</p>
                  <img
                    src={project.mobileDesktopPreviews.desktop.startsWith('http') ? project.mobileDesktopPreviews.desktop : imageUrl(project.mobileDesktopPreviews.desktop)}
                    alt="Desktop preview"
                    className="w-full rounded-lg border border-bg-border object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.techStack.map((tech) => (
              <span key={tech} className="tag">{tech}</span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-3">
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              <ExternalLink size={14} /> Live Demo
            </a>
          )}
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-bg-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
            >
              <Github size={14} /> Source Code
            </a>
          )}
        </div>
      </article>
    </PageLayout>
  )
}
