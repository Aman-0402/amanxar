import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp } from '@animations/variants'
import { CheckCircle2 } from 'lucide-react'

export default function ServicePeekCard({ service }) {
  // Render icon from service.icon (can be emoji or text)
  const renderIcon = () => {
    if (!service.icon) return null
    // If it's a unicode emoji or special char, render directly
    if (typeof service.icon === 'string') {
      return <div className="text-5xl">{service.icon}</div>
    }
    return null
  }

  return (
    <motion.div
      variants={fadeUp}
      className="border-3 border-text-primary rounded-lg p-6 hover:border-brand-primary hover:scale-[1.02] hover:translate-y-2 transition-all duration-200 offset-shadow space-y-4"
    >
      {/* Icon */}
      <div className="flex justify-center mb-3">{renderIcon()}</div>

      {/* Title */}
      <h3 className="font-display font-semibold text-text-primary text-center">{service.title}</h3>

      {/* Description (truncated) */}
      <p className="text-sm text-text-secondary text-center line-clamp-2">
        {service.description}
      </p>

      {/* Top 3 Features */}
      {service.features && service.features.length > 0 && (
        <div className="space-y-2 border-t border-text-primary/20 pt-3">
          {service.features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
              <CheckCircle2 size={14} className="text-brand-primary flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}

      {/* Learn More Link */}
      <Link
        to={`/services`}
        className="block text-center text-sm font-medium text-brand-primary hover:text-brand-dark transition-colors pt-2"
      >
        Learn More →
      </Link>
    </motion.div>
  )
}
