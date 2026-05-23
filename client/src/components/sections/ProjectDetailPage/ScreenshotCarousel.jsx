import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { imageUrl } from '@utils/imageUrl'
import { modalBackdrop, modalContent } from '@animations/variants'

export default function ScreenshotCarousel({ images }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const processedImages = images.map((img) => (img.startsWith('http') ? img : imageUrl(img)))

  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length)
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % processedImages.length)

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return
    if (e.key === 'ArrowLeft') goToPrev()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') setLightboxOpen(false)
  }

  return (
    <>
      {/* Grid View */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {processedImages.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative rounded-xl overflow-hidden border border-bg-border cursor-pointer group h-48 bg-bg-elevated"
            onClick={() => {
              setCurrentIndex(idx)
              setLightboxOpen(true)
            }}
          >
            <img
              src={img}
              alt={`Screenshot ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-medium">Click to expand</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <>
            <motion.div
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40"
              onKeyDown={handleKeyDown}
              tabIndex={0}
              autoFocus
            />

            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="relative w-full max-w-4xl max-h-[80vh]">
                {/* Close Button */}
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="absolute -top-10 right-0 p-2 text-white hover:text-white/80 transition-colors"
                  aria-label="Close"
                >
                  <X size={28} />
                </button>

                {/* Image Container */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-2xl overflow-hidden bg-black"
                >
                  <img
                    src={processedImages[currentIndex]}
                    alt={`Screenshot ${currentIndex + 1}`}
                    className="w-full max-h-[80vh] object-contain"
                  />
                </motion.div>

                {/* Navigation Buttons */}
                {processedImages.length > 1 && (
                  <>
                    <button
                      onClick={goToPrev}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 p-2 rounded-full text-white hover:bg-white/10 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={28} />
                    </button>

                    <button
                      onClick={goToNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 p-2 rounded-full text-white hover:bg-white/10 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}

                {/* Counter & Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                  <div className="flex gap-2">
                    {processedImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/70">
                    {currentIndex + 1} / {processedImages.length}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
