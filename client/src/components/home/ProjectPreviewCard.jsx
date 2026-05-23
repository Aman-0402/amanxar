import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '@animations/variants'
import { imageUrl } from '@utils/imageUrl'

export default function ProjectPreviewCard({ project }) {
  return (
    <motion.div
      variants={fadeUp}
      className="border-3 border-text-primary/50 rounded-md overflow-hidden hover:border-brand-primary hover:scale-[1.02] hover:translate-y-2 transition-all duration-200 offset-shadow"
    >
      {project.thumbnail && (
        <img
          src={
            typeof project.thumbnail === 'string' &&
            (project.thumbnail.startsWith('http://') || project.thumbnail.startsWith('https://'))
              ? project.thumbnail
              : imageUrl(project.thumbnail)
          }
          alt={project.title}
          className="w-full border-b-4 border-text-primary object-cover h-40"
          onError={(e) => console.error('Image load failed:', project.thumbnail, e)}
        />
      )}

      <div className="p-6 space-y-3">
        <h3 className="font-display font-semibold text-text-primary">{project.title}</h3>
        <p className="text-sm text-text-secondary">{project.shortDesc}</p>

        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="tag text-xs">
                {tech}
              </span>
            ))}
          </div>
        )}

        <Link
          to={`/projects/${project.slug}`}
          className="inline-block text-sm font-medium text-brand-primary hover:text-brand-dark transition-colors pt-2"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  )
}
