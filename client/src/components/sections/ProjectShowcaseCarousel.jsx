import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fadeUp, scaleIn } from '@animations/variants'
import { imageUrl } from '@utils/imageUrl'
import { Link } from 'react-router-dom'

export default function ProjectShowcaseCarousel({ projects }) {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered || projects.length === 0) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % projects.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isHovered, projects.length])

  if (projects.length === 0) return null

  const project = projects[current]
  const thumbUrl = project.thumbnail?.startsWith('http')
    ? project.thumbnail
    : imageUrl(project.thumbnail)

  const goToPrev = () => setCurrent((prev) => (prev - 1 + projects.length) % projects.length)
  const goToNext = () => setCurrent((prev) => (prev + 1) % projects.length)

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-16"
    >
      <div
        className="relative rounded-3xl overflow-hidden border border-bg-border bg-bg-surface h-96"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex"
          >
            {/* Thumbnail */}
            <div className="w-1/2 overflow-hidden">
              <img
                src={thumbUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="w-1/2 p-8 flex flex-col justify-between bg-gradient-to-br from-bg-surface to-bg-elevated">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-2"
                >
                  Featured Project
                </motion.p>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-display text-2xl font-bold text-text-primary mb-2"
                >
                  {project.title}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-text-secondary line-clamp-2 mb-4"
                >
                  {project.shortDesc}
                </motion.p>

                {/* Tech Stack */}
                {project.techStack?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2"
                  >
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-brand-primary/15 text-brand-primary px-2 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-dark transition-colors text-sm"
                >
                  View Details →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {projects.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Previous project"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Next project"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === current ? 'w-8 bg-brand-primary' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to project ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Project Counter */}
      <p className="text-xs text-text-muted mt-3 text-center">
        {current + 1} / {projects.length}
      </p>
    </motion.section>
  )
}
