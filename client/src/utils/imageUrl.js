/**
 * Resolves a backend image URL to a full API URL.
 * Backend returns relative paths like "/media/gallery/image.jpg"
 * This converts them to full URLs like "http://localhost:8000/media/gallery/image.jpg"
 */
export function imageUrl(path) {
  if (!path) return path

  // If it's already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // If it's a relative path starting with /media/, prepend the API base URL
  if (path.startsWith('/media/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return apiBase + path
  }

  return path
}
