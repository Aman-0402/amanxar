export const driveUrl = (id) => {
  if (!id) return ''
  const cleanId = extractDriveId(id)
  return cleanId ? `https://lh3.googleusercontent.com/d/${cleanId}` : ''
}

export const extractDriveId = (input) => {
  if (!input) return ''
  const trimmed = input.trim()
  const match = trimmed.match(/[-\w]{25,}/)
  return match ? match[0] : ''
}
